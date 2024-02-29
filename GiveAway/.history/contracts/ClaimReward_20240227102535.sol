// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract GiveAway is ReentrancyGuard {
    event ArrayAddr(address[] indexed array, string message);
    event ClaimMade(address user, uint256 criterialId, uint256 amount);
    event AddressAdded(address indexed newAddress, uint256 criterialId);
    event AddressRemoved(address indexed removedAddress, uint256 criterialId);

    error ClaimReward_Failed();

    IERC20 public I_rewardToken;
    address public owner;
    uint8 private nextCriterialId;

    struct Criterial {
        uint256 unitReward;
        mapping(address => bool) eligibleAddresses;
        mapping(address => bool) claimedBy;
    }

    mapping(uint256 => Criterial) public criterials;

    constructor(address rewardToken) {
        I_rewardToken = IERC20(rewardToken);
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
        Criterial storage criterial = criterials[nextCriterialId];
        for (uint256 i = 0; i < _eligibleAddresses.length; i++) {
            criterial.eligibleAddresses[_eligibleAddresses[i]] = true;
        }
        criterial.unitReward = unitReward;
        nextCriterialId++;
      
    }
    
    function removeAddress(address _address, uint256 criterialId) public onlyOwner {
        require(criterials[criterialId].eligibleAddresses[_address], "Address is not eligible for this criterial");
        delete criterials[criterialId].eligibleAddresses[_address];
        emit AddressRemoved(_address, criterialId);
    }
    
    function claimReward(uint256 criterialId) external nonReentrant {
        require(isEligible(msg.sender, criterialId), "Not eligible for reward");
        require(!criterials[criterialId].claimedBy[msg.sender], "Reward already claimed");
        require(amout < I_rewardToken.balanceOf(address(this)))
        uint256 amount = criterials[criterialId].unitReward;
        criterials[criterialId].claimedBy[msg.sender] = true;
        bool success = I_rewardToken.transfer(msg.sender, amount);
        if (!success) {
            revert ClaimReward_Failed();
        }
        emit ClaimMade(msg.sender, criterialId, amount);
    }

    function isEligible(
        address user,
        uint256 criterialId
    ) public view returns (bool) {
        return criterials[criterialId].eligibleAddresses[user];
    }

    function userClaimed(
        address user,
        uint256 criterialId
    ) public view returns (bool) {
        return criterials[criterialId].claimedBy[user];
    }
    
    // function getCriterial(uint256 criterialId) public view returns (address[] memory, uint256) {
    //     // require(criterials[criterialId].unitReward > 0, "Criterial does not exist");
        
    //     address[] memory eligibleAddresses = new address[](criterials[criterialId].unitReward);
    //     uint256 unitReward = criterials[criterialId].unitReward;
        
    //     for (uint256 i = 0; i < unitReward; i++) {
    //         address userAddress = eligibleAddresses[i];
    //         eligibleAddresses[i] = userAddress;
    //     }
    //     return (eligibleAddresses, unitReward);
    // }
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
