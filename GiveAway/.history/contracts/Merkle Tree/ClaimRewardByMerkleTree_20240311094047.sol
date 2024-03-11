// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @author TanDlab2k2 
/// @dev Merkle Tree
contract GiveAwayWithMerkleTree {

  bytes32 public immutable merkleRoot;

  BitMaps.BitMap private _airdropList;

  IERC20 public immutable I_Optimism;

  constructor(address rewardCoin,bytes32 _merkleRoot) {
      I_Optimism = IERC20(rewardCoin);
      merkleRoot = _merkleRoot;
  } 
  
  function claimAirdrop(byte32[] calldata proof,uint256 index ,uint256 amount) external {
    // Check if already claimed 
    require(!BitMaps.get(_airdropList,index),"Already claimed");

    // verify proof
    _verifyProof(proof,index,msg.sender);

    // set airdrop as claimed 
    BitMaps.setTo(_airdropList,index,true);

    // mint
  }
}
