// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "hardhat/console.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// contract GiveAway is ReentrancyGuard {
//     event ArrayAddr(address[] indexed array, string message);
//     event ClaimMade(address user, uint256 criterialId, uint256 amount);

//     error ClaimReward_Failed();

//     IERC20 public I_rewardToken;
//     address public owner;
//     uint256 private nextCriterialId;

//     struct Criterial {
//         bytes32 label;
//         address[] eligibleAddresses;
//         uint256 unitReward;
//         mapping(address => bool) claimedBy;
//     }

//     mapping(uint256 => Criterial) public criterials;

//     constructor(address rewardToken) {
//         I_rewardToken = IERC20(rewardToken);
//         owner = msg.sender;
//         nextCriterialId = 1;
//     }

//     modifier onlyOwner() {
//         require(msg.sender == owner, "Only owner can call this function");
//         _;
//     }

//     // Add a new Criterial 
//     function addCriterial(
//         string calldata _label,
//         address[] calldata _eligibleAddresses,
//         uint256 unitReward
//     ) public onlyOwner {
//         emit ArrayAddr(_eligibleAddresses, "Successfully!");
//         bytes32 label = keccak256(abi.encodePacked(_label));
//         Criterial storage criterial = criterials[nextCriterialId];
//         criterial.label = label;
//         criterial.eligibleAddresses = _eligibleAddresses;
//         criterial.unitReward = unitReward;
//         nextCriterialId++;
//     }
    
//     function claimReward(uint256 criterialId) external nonReentrant {
//       // Check 
//       require(isEligible(msg.sender, criterialId), "Not eligible for reward");
//       require(!criterials[criterialId].claimedBy[msg.sender], "Reward already claimed");

//       uint256 amount = criterials[criterialId].unitReward;
//       // Effects
//       criterials[criterialId].claimedBy[msg.sender] = true; // Mark as claimed
//       // Interactions
//       bool success = I_rewardToken.transfer(msg.sender, amount);
//       if (!success) {
//           revert ClaimReward_Failed();
//       }
//       emit ClaimMade(msg.sender, criterialId, amount);
//     }

//     // Check if a user is eligible to claim reward from a specific criterion
//     function isEligible(
//         address user,
//         uint256 criterialId
//     ) public view returns (bool) {
//         Criterial storage criterial = criterials[criterialId];
//         for (uint256 i = 0; i < criterial.eligibleAddresses.length; i++) {
//             if (criterial.eligibleAddresses[i] == user) {
//                 return true;
//             }
//         }
//         return false;
//     }

//     //  Return the count of criteria that an eligible address can claim reward
//     function getEligibleCriteriaCount(
//         address _walletAddress
//     ) public view returns (uint256) {
//         uint256 count = 0;
//         for (uint256 i = 1; i < nextCriterialId; i++) {
//             if (isEligible(_walletAddress, i)) {
//                 count++;
//             }
//         }
//         return count;
//     }

//     // Return information of a criterion based on ID
//     function getCriterial(
//         uint256 criterialId
//     ) public view returns (bytes32, address[] memory, uint256) {
//         Criterial storage criterial = criterials[criterialId];
//         return (
//             criterial.label,
//             criterial.eligibleAddresses,
//             criterial.unitReward
//         );
//     }

//     function getAddress() public view returns (address) {
//         return address(this);
//     }
// }

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
contract GiveAway is ReentrancyGuard {
    event ArrayAddr(address[] indexed array, string message);
    event ClaimMade(address user, uint256 criterialId, uint256 amount);

    error ClaimReward_Failed();

    IERC20 public I_rewardToken;
    address public owner;
    uint8 private nextCriterialId;

    struct Criterial {
        // bytes32 label;
        // address[] eligibleAddresses;
        mapping(address => bool) eligibleAddresses;
        uint256 unitReward;
        mapping(address => bool) claimedBy;
    }

    mapping(uint256 => Criterial) public criterials;
    mapping(uint256 => criterials[nextCriterialId]) IsEligible;

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
        address[] calldata _eligibleAddresses,
        uint256 unitReward
    ) public onlyOwner {
        emit ArrayAddr(_eligibleAddresses, "Successfully!");
        Criterial storage criterial = criterials[nextCriterialId];
        criterial.eligibleAddresses = _eligibleAddresses;
        criterial.unitReward = unitReward;
        nextCriterialId++;
    }
    
    function claimReward(uint256 criterialId) external nonReentrant {
      // Check 
      require(isEligible(msg.sender, criterialId), "Not eligible for reward");
      require(!criterials[criterialId].claimedBy[msg.sender], "Reward already claimed");

      uint256 amount = criterials[criterialId].unitReward;
      // Effects
      criterials[criterialId].claimedBy[msg.sender] = true; // Mark as claimed
      // Interactions
      bool success = I_rewardToken.transfer(msg.sender, amount);
      if (!success) {
          revert ClaimReward_Failed();
      }
      emit ClaimMade(msg.sender, criterialId, amount);
    }

    //Check if a user is eligible to claim reward from a specific criterion
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
    function userClaimed(
        address user,
        uint256 criterialId
    ) public view returns (bool) {
        return criterials[criterialId].claimedBy[user];
    }
    //  Return the count of criteria that an eligible address can claim reward
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

    // Return information of a criterion based on ID
    function getCriterial(
        uint256 criterialId
    ) public view returns ( address[] memory, uint256) {
        Criterial storage criterial = criterials[criterialId];
        return (
            criterial.eligibleAddresses,
            criterial.unitReward
        );
    }

    function getAddress() public view returns (address) {
        return address(this);
    }
}