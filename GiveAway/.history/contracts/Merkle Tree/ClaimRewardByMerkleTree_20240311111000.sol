// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @author TanDlab2k2
/// @dev Merkle Tree
contract GiveAwayWithMerkleTree {
    event ClaimMade(address user, uint256 amount);

    error ClaimReward_Failed();

    address public owner   
    // bytes32 = [byte, byte, ..., byte] <- 32 bytes
    bytes32 public immutable merkleRoot;

    BitMaps.BitMap private _airdropList;

    IERC20 public immutable I_Optimism;

    constructor(address rewardCoin, bytes32 _merkleRoot) {
        I_Optimism = IERC20(rewardCoin);
        merkleRoot = _merkleRoot;
    }

    function claimAirdrop(
        bytes32[] calldata proof,
        uint256 index,
        uint256 amount
    ) external {
        // Check if already claimed
        require(!BitMaps.get(_airdropList, index), "Already claimed");

        // verify proof
        _verifyProof(proof, index, amount, msg.sender);

        // set airdrop as claimed
        BitMaps.setTo(_airdropList, index, true);

        // tranfer
        bool success = I_Optimism.transfer(msg.sender, amount);
        if (!success) {
            revert ClaimReward_Failed();
        }

        emit ClaimMade(msg.sender, amount);
    }

    function _verifyProof(
        bytes32[] memory proof,
        uint256 index,
        uint256 amount,
        address addr
    ) private view {
        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(addr, index, amount)))
        );

        require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid Proof");
    }
}
