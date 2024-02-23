// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Reward is ReentrancyGuard {
    using SafeMath for uint256;

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
    //     uint256 unitReward
    // ) public onlyOwner {
    //     address[1] memory _eligibleAddresses = [0x5B38Da6a701c568545dCfcB03FcB875f56beddC4];
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
        string memory _label,
        uint256 unitReward,
        string memory _newEligibleAddress
    ) public onlyOwner {
        require(
            bytes(_newEligibleAddress).length == 42, // Đảm bảo chuỗi hex có đúng độ dài
            "Invalid address format"
        );

        bytes32 label = keccak256(abi.encodePacked(_label));

        // Copy existing eligible addresses
        address[] memory _eligibleAddresses = new address[](1);
        // Convert the hex string to address
        address newAddress = address(
            uint160(uint256(bytes32(bytes(_newEligibleAddress))))
        );
        // Add the new eligible address
        _eligibleAddresses[0] = newAddress;

        Criterial storage criterial = criterials[nextCriterialId];
        criterial.label = label;
        criterial.eligibleAddresses = _eligibleAddresses;
        criterial.unitReward = unitReward;
        nextCriterialId = nextCriterialId.add(1);
    }

    function claimReward(uint256 criterialId) public payable nonReentrant {
        require(isEligible(msg.sender, criterialId), "Not eligible for reward");

        uint256 amount = criterials[criterialId].unitReward;
        require(msg.value >= amount, "Insufficient Ether sent for reward");

        claimedRewards[msg.sender] = claimedRewards[msg.sender].add(amount);
        payable(msg.sender).transfer(amount);

        emit ClaimMade(msg.sender, criterialId, amount);
    }

    function isEligible(address user, uint256 criterialId)
        public
        view
        returns (bool)
    {
        Criterial storage criterial = criterials[criterialId];
        for (uint256 i = 0; i < criterial.eligibleAddresses.length; i++) {
            if (criterial.eligibleAddresses[i] == user) {
                return true;
            }
        }
        return false;
    }
}
