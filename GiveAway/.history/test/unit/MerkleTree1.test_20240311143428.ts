import { keccak256 } from "@ethersproject/keccak256";
import { loadFixture as loadFixtureToolbox } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import "@nomiclabs/hardhat-ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { expect } from "chai";
import fs from "fs";
import { ethers } from "hardhat";
import { encodeBytes32String } from "ethers";
describe("Reward contract", function () {
  describe("Deployment", function () {
    let wallets: SignerWithAddress[];
    let merkletreeContract: any;
    let rewardTokenContract: any;
    let rewardCoinAddress: any;
    let addr_merkletreeContrac: any;
    let tree: any;
    const fixture = async () => {
      wallets = await ethers.getSigners();
      const values = [
        [
          keccak256( encode(["address", "address", "address"], [wallets[0].address, wallets[1].address, wallets[2].address])),
          "1",
          "11111"
        ],
        [
          keccak256( encodeBytes32String(["address", "address", "address"], [wallets[3].address, wallets[4].address, wallets[5].address])),
          "2",
          "22222"
        ],
        [
          keccak256( encodeBytes32String(["address", "address", "address"], [wallets[6].address, wallets[7].address, wallets[8].address])),
          "3",
          "33333"
        ]
      ];
      
      //
      const tree = StandardMerkleTree.of(values, [
        "bytes32",
        "uint256",
        "uint256",
      ]);

      //
      console.log("Merkle Root:", tree.root);

      //
      fs.writeFileSync("tree1.json", JSON.stringify(tree.dump()));

      const RewardTokenContract = await ethers.getContractFactory(
        "RewardToken"
      );

      const rewardTokenContract = await RewardTokenContract.deploy();

      const MerkleTreeContract = await ethers.getContractFactory(
        "GiveAwayWithMerkleTree"
      );
      const rewardCoinAddress = await rewardTokenContract.getAddress();
      const merkletreeContract = await MerkleTreeContract.deploy(
        rewardCoinAddress,
        tree.root
      );
      const addr_merkletreeContract = await merkletreeContract.getAddress();

      const total = await rewardTokenContract.totalSupply();
      await rewardTokenContract.transfer(addr_merkletreeContract, total);
      return {
        merkletreeContract,
        rewardCoinAddress,
        rewardTokenContract,
        addr_merkletreeContract,
        tree,
        wallets,
      };
    };
    it("Should initialize contract with correct initial values", async function () {
      const {
        merkletreeContract,
        rewardCoinAddress,
        tree,
        rewardTokenContract,
      } = await loadFixtureToolbox(fixture);

      expect(await merkletreeContract.I_Optimism()).to.equal(rewardCoinAddress);
      expect(await merkletreeContract.owner()).to.equal(wallets[0].address);
      expect(await merkletreeContract.merkleRoot()).to.equal(tree.root);
    });
    it("Should address 1 claimReward ", async function () {
      const { rewardTokenContract, merkletreeContract,tree,wallets,addr_merkletreeContract } =
        await loadFixtureToolbox(fixture);
      const tree1 = StandardMerkleTree.load(
        JSON.parse(fs.readFileSync("tree.json"))
      );
      let proof: any = null;
      for (const [i, v] of tree1.entries()) {
        if (v[0] === wallets[0].address) {
          proof = tree1.getProof(i);
          console.log("Merkle Root :",tree.root);
          console.log("Value:", v);
          console.log("Proof:", proof);
        }
      }

      const index = 0;
      const amount = 11111;
      expect(await rewardTokenContract.balanceOf(wallets[0].address)).to.equal(
        0
      );

      const tx = await merkletreeContract.claimAirdrop(proof, index, amount);
      await tx.wait();
      
      console.log(await rewardTokenContract.balanceOf(wallets[0].address));
      expect(await rewardTokenContract.balanceOf(wallets[0].address)).to.equal(
        11111
      );
    });
    it("Should address 1 claimReward ", async function () {
      const { rewardTokenContract, merkletreeContract,tree,wallets,addr_merkletreeContract } =
        await loadFixtureToolbox(fixture);
      const tree1 = StandardMerkleTree.load(
        JSON.parse(fs.readFileSync("tree.json"))
      );
      let proof: any = null;
      for (const [i, v] of tree1.entries()) {
        if (v[0] === wallets[1].address) {
          proof = tree1.getProof(i);
          console.log("Merkle Root :",tree.root);
          console.log("Value:", v);
          console.log("Proof:", proof);
        }
      }

      const index = 1;
      const amount = 22222;
      expect(await rewardTokenContract.balanceOf(wallets[1].address)).to.equal(
        0
      );

      const tx = await merkletreeContract.connect(wallets[1]).claimAirdrop(proof, index, amount);
      await tx.wait();
    
      console.log(await rewardTokenContract.balanceOf(wallets[1].address));
      expect(await rewardTokenContract.balanceOf(wallets[1].address)).to.equal(
        22222
      );
    });
  });
});
