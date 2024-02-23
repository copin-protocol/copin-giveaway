// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
contract Reward is ReentrancyGuard {
    event ArrayAddr(address[] indexed array, string message);
    event ClaimMade(address user, uint256 criterialId, uint256 amount);

    error ClaimReward_Failed();

    IERC20 public I_rewardToken;
    address public owner;
    uint256 private nextCriterialId;

    struct Criterial {
        bytes32 label;
        address[] eligibleAddresses;
        uint256 unitReward;
    }

    mapping(uint256 => Criterial) public criterials;
    mapping(address => uint256) public claimedRewards;

    constructor(address rewardToken) {
        I_rewardToken = IERC20(rewardToken);
        owner = msg.sender;
        nextCriterialId = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Add a new Criterial 
    function addCriterial(
        string calldata _label,
        address[] calldata _eligibleAddresses,
        uint256 unitReward
    ) public onlyOwner {
        // require(
        //     _eligibleAddresses.length > 0,
        //     "At least one eligible address is required"
        // );
        emit ArrayAddr(_eligibleAddresses, "Successfully!");
        bytes32 label = keccak256(abi.encodePacked(_label));
        Criterial storage criterial = criterials[nextCriterialId];
        criterial.label = label;
        criterial.eligibleAddresses = _eligibleAddresses;
        criterial.unitReward = unitReward;
        nextCriterialId++;
    }

    // Claim reward from a specific criterion
    function claimReward(uint256 criterialId) public payable nonReentrant {
        require(isEligible(msg.sender, criterialId), "Not eligible for reward");

        uint256 amount = criterials[criterialId].unitReward;
        require(msg.value >= amount, "Insufficient Ether sent for reward");

        claimedRewards[msg.sender] += amount;
        bool success = I_rewardToken.transfer(msg.sender, amount);
        if (!success) {
            revert ClaimReward_Failed();
        }
        emit ClaimMade(msg.sender, criterialId, amount);
    }

    // 
    function isEligible(
        address user,
        uint256 criterialId
    ) public view returns (bool) {
        Criterial storage criterial = criterials[criterialId];
        for (uint256 i = 0; i < criterial.eligibleAddresses.length; i++) {
            if (criterial.eligibleAddresses[i] == user) {
                return true;
            }
        }
        return false;
    }

    function getCriterial(
        uint256 criterialId
    ) public view returns (bytes32, address[] memory, uint256) {
        Criterial storage criterial = criterials[criterialId];
        return (
            criterial.label,
            criterial.eligibleAddresses,
            criterial.unitReward
        );
    }
    function getEligibleCriteriaCount(
        address _walletAddress
    ) public view returns (uint256) {
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