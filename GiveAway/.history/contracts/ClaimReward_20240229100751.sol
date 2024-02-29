// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract GiveAway is ReentrancyGuard {
    event ClaimMade(address user, uint256 criterialId, uint256 amount);
    event AddressAdded(address indexed newAddress, uint256 criterialId);
    event AddressRemoved(address indexed removedAddress, uint256 criterialId);

    error ClaimReward_Failed();

    IERC20 public immutable I_Optimism;
    address public immutable owner;
    uint8 private nextCriterialId;

    struct Criterial {
        uint256 unitReward;
        uint8 idCriterial;
        mapping(address => bool) eligibleAddresses;
        mapping(address => bool) claimedBy;
    }

    mapping(uint256 => Criterial) public criterials;

    constructor(address rewardCoin) {
        I_Optimism = IERC20(rewardCoin);
        owner = msg.sender;
        nextCriterialId = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function addCriterial(
        address[] calldata _eligibleAddresses,
        uint256 unitReward
    ) public onlyOwner {
        require(unitReward > 0, "Unit reward must be greater than 0");
        require(_eligibleAddresses.length > 0, "At least one eligible address must be provided");

        Criterial storage criterial = criterials[nextCriterialId];

        for (uint256 i = 0; i < _eligibleAddresses.length; i++) {
            criterial.eligibleAddresses[_eligibleAddresses[i]] = true;
        }

        criterial.unitReward = unitReward;
        nextCriterialId++;
      
    }
    function addAddressToCriterial(address[] calldata _addresses, uint256 criterialId) public onlyOwner {
        require(criterials[criterialId].unitReward > 0, "Criterial does not exist");
        require(_addresses.length > 0, "At least one eligible address must be provided");

        for (uint256 i = 0; i < _addresses.length; i++) {
            // require(!criterials[criterialId].eligibleAddresses[_addresses[i]], "Address already exists in this criterial");
            criterials[criterialId].eligibleAddresses[_addresses[i]] = true;
        }
    }

    function removeAddress(address _address, uint256 criterialId) public onlyOwner {
        require(criterials[criterialId].eligibleAddresses[_address], "Address is not eligible for this criterial");

        delete criterials[criterialId].eligibleAddresses[_address];

        emit AddressRemoved(_address, criterialId);
    }
    
    function claimReward(uint256 criterialId) external nonReentrant {
        require(isEligible(msg.sender, criterialId), "Not eligible for reward");
        require(!criterials[criterialId].claimedBy[msg.sender], "Reward already claimed");
        
        uint256 amount = criterials[criterialId].unitReward;
        require(amount < I_Optimism.balanceOf(address(this)),"Not enough balance");

        criterials[criterialId].claimedBy[msg.sender] = true;

        bool success = I_Optimism.transfer(msg.sender, amount);
        if (!success) {
            revert ClaimReward_Failed();
        }

        emit ClaimMade(msg.sender, criterialId, amount);
    }

    function isEligible(
        address user,
        uint256 criterialId
    ) public view returns (bool) {
        // require(user != address(0), "Invalid user address");
        require(criterials[criterialId].unitReward > 0, "Criterial does not exist");
        
        return criterials[criterialId].eligibleAddresses[user];
    }

    function userClaimed(
        address user,
        uint256 criterialId
    ) public view returns (bool) {
        require(isEligible(user, criterialId), "Not eligible for reward");

        return criterials[criterialId].claimedBy[user];
    }
    

    function getEligibleCriteriaCount(address _walletAddress) public view returns (uint256) {
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextCriterialId; i++) {
            if (isEligible(_walletAddress, i)) {
                count++;
            }
        }

        return count;
    }

    function getAddress() public view returns (address) {
        return address(this);
    }
}
