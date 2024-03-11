// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Arrays.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GiveAwayWithMerkleTree {
    event ClaimMade(address user, uint256 criterialId, uint256 amount);
    event MerkleRootUpdated(bytes32 newMerkleRoot);

    IERC20 public immutable I_Optimism;
    bytes32 public merkleRoot;
    

    struct Criterial {
        uint256 unitReward;
    }

    mapping(uint256 => Criterial) public criterials;

    constructor(address rewardCoin) {
        I_Optimism = IERC20(rewardCoin);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function updateMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        emit MerkleRootUpdated(_merkleRoot);
    }

    function claimReward(uint256 criterialId, address account, bytes32[] calldata merkleProof) external {
        require(isEligible(criterialId, account, merkleProof), "Not eligible for reward");
        require(!hasClaimed(criterialId, account), "Reward already claimed");

        uint256 amount = criterials[criterialId].unitReward;
        require(amount <= I_Optimism.balanceOf(address(this)), "Not enough balance");

        criterials[criterialId].claimedBy[account] = true;

        require(I_Optimism.transfer(account, amount), "Failed to transfer tokens");

        emit ClaimMade(account, criterialId, amount);
    }

    function isEligible(uint256 criterialId, address account, bytes32[] calldata merkleProof) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(account));
        return MerkleProof.verify(merkleProof, merkleRoot, leaf);
   }

    function hasClaimed(uint256 criterialId, address account) public view returns (bool) {
        return criterials[criterialId].claimedBy[account];
    }

    function setCriterial(uint256 criterialId, uint256 unitReward) external onlyOwner {
        criterials[criterialId].unitReward = unitReward;
    }
}
