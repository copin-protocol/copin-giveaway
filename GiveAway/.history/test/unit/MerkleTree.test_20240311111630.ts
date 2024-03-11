import { loadFixture as loadFixtureToolbox } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import "@nomiclabs/hardhat-ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { expect } from "chai";
import fs from "fs";
import { ethers } from "hardhat";

describe("Reward contract", function () {
  describe("Deployment", function () {
    let wallets: SignerWithAddress[];
    let merkletreeContract: any;
    let rewardTokenContract: any;
    let rewardCoinAddress: any;
    let tree: any;
    const fixture = async () => {
      wallets = await ethers.getSigners();
      const values = [
        [wallets[1], "0", "11111"],
        [wallets[2], "1", "22222"],
        [wallets[3], "2", "33333"],
        [wallets[4], "3", "44444"],
        [wallets[5], "4", "55555"],
        [wallets[6], "5", "66666"],
        [wallets[7], "6", "77777"],
        [wallets[8], "7", "88888"],
      ];
      //
      const tree = StandardMerkleTree.of(values, [
        "address",
        "uint256",
        "uint256",
      ]);

      //
      console.log("Merkle Root:", tree.root);

      //
      fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));

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

      return {
        merkletreeContract,
        rewardCoinAddress,
        rewardTokenContract,
        tree,
      };
    };
    // beforeEach("load fixture", async () => {
    //   ({ merkletreeContract } = await loadFixtureToolbox(fixture));
    // });
    it("Should initialize contract with correct initial values", async function () {
      const { hardhatToken, owner } = await loadFixtureToolbox(deployTokenFixture);

      expect(await merkletreeContract.I_Optimism()).to.equal(rewardCoinAddress);
      expect(await merkletreeContract.owner()).to.equal(wallets[0].address);
      expect(await merkletreeContract.merkleRoot()).to.equal(tree.root);
    });
  });
});
