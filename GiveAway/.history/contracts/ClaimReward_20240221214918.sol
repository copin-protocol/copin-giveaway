// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "hardhat/console.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";
interface USDC {
  function totalSupply() external view returns(uint256);
  function balanceOf(address account) external view returns(uint256);
  function allowance(address owner, address spender) external returns (bool);
  function approve(address spender,uint256 amount) external returns (bool);
  function transferFrom(address sender,address recipient,uint256 amount) external returns(bool);

  event Transfer(address indexed from ,address )
}
contract Reward {
    USDC public usdc;

    event ArrayAddr(address[] indexed array, string message);

    address public owner;
    uint256 private nextCriterialId;
    event ClaimMade(address user, uint256 criterialId, uint256 amount);

    struct Criterial {
        bytes32 label;
        address[] eligibleAddresses;
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

    // function addCriterial(
    //     string memory _label,
    //     uint256 unitReward,
    //     string memory _newEligibleAddress
    // ) public onlyOwner {
    //     require(
    //         bytes(_newEligibleAddress).length == 42, // Đảm bảo chuỗi hex có đúng độ dài
    //         "Invalid address format"
    //     );

    //     bytes32 label = keccak256(abi.encodePacked(_label));

    //     // Copy existing eligible addresses
    //     address[] memory _eligibleAddresses = new address[](1);
    //     // Convert the hex string to address
    //     address newAddress = address(
    //         uint160(uint256(bytes32(bytes(_newEligibleAddress))))
    //     );
    //     // Add the new eligible address
    //     _eligibleAddresses[0] = newAddress;

    //     Criterial storage criterial = criterials[nextCriterialId];
    //     criterial.label = label;
    //     criterial.eligibleAddresses = _eligibleAddresses;
    //     criterial.unitReward = unitReward;
    //     nextCriterialId = nextCriterialId.add(1);
    // }
    //  function addCriterial(
    //     string memory _label,
    //     uint256 unitReward
    // ) public onlyOwner {
    //     address[3] memory _eligibleAddresses = [0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2,0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db,0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB];
    //     require(
    //         _eligibleAddresses.length > 0,
    //         "At least one eligible address is required"
    //     );

    //     bytes32 label = keccak256(abi.encodePacked(_label));
    //     // bytes32[] eligibleAddresses = keccak256(abi.encodePacked(_eligibleAddresses));
    //     Criterial storage criterial = criterials[nextCriterialId];
    //     criterial.label = label;
    //     criterial.eligibleAddresses = _eligibleAddresses;
    //     criterial.unitReward = unitReward;
    //     nextCriterialId = nextCriterialId.add(1);
    // }
    function addCriterial(
        string calldata _label,
        address[] calldata _eligibleAddresses,
        uint256 unitReward
    ) public onlyOwner {
        require(
            _eligibleAddresses.length > 0,
            "At least one eligible address is required"
        );
        emit ArrayAddr(_eligibleAddresses, "Successfully!");
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
}
