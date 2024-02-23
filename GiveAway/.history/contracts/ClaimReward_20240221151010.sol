// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "hardhat/console.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Reward {
    // using SafeMath for uint256;

    address public owner;
    uint256 private nextCriterialId;

    event ClaimMade(address user, uint256 criterialId, uint256 amount);

    struct Criterial {
        bytes32 label;
        address[] eligibleAddresses; // Change type to bytes32[]
        uint256 unitReward;
    }

    mapping(uint256 => Criterial) public criterials;
    mapping(address => uint256) public claimedRewards;

    constructor() {
        owner = msg.sender;
        nextCriterialId = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function addCriterial(
        string memory _label,
        address[] memory _eligibleAddresses,
        uint256 unitReward
    ) public onlyOwner {
        require(
            _eligibleAddresses.length > 0,
            "At least one eligible address is required"
        );

        bytes32 label = keccak256(abi.encodePacked(_label));
        // bytes32[] eligibleAddresses = keccak256(abi.encodePacked(_eligibleAddresses));
        Criterial storage criterial = criterials[nextCriterialId];
        criterial.label = label;
        criterial.eligibleAddresses = _eligibleAddresses;
        criterial.unitReward = unitReward;
        nextCriterialId++;
    }

    function claimReward(uint256 criterialId) public payable {
        require(isEligible(msg.sender, criterialId), "Not eligible for reward");

        uint256 amount = criterials[criterialId].unitReward;
        require(msg.value >= amount, "Insufficient Ether sent for reward");

        claimedRewards[msg.sender] += amount;
        payable(msg.sender).transfer(amount);

        emit ClaimMade(msg.sender, criterialId, amount);
    }
    
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
}
