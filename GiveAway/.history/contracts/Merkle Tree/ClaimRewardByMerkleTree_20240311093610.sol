// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @author TanDlab2k2 
/// @dev Merkle Tree
contract GiveAwayWithMerkleTree {
  byte32
  IERC20 public immutable I_Optimism;
  constructor(address rewardCoin) {
      I_Optimism = IERC20(rewardCoin);
  } 
}
