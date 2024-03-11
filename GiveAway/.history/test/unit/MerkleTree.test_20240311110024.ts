import { loadFixture as loadFixtureToolbox } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import "@nomiclabs/hardhat-ethers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Reward contract", function () {
  describe("Deployment", function () {
    let wallets: SignerWithAddress[]; 
    let merkletreeContract: any;
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
      const tree = StandardMerkleTree.of(values, ["address", "uint256", "uint256"]);

      // 
      console.log("Merkle Root:", tree.root);
      
      // 
      fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));

      const MerkleTreeContract = await ethers.getContractFactory("GiveAwayWithMerkleTree");

      const merkletreeContract = await MerkleTreeContract.deploy();

      
      return {
        merkletreeContract
      }
    };
    beforeEach("load fixture", async () => {
      ({ merkletreeContract } =
        await loadFixtureToolbox(fixture));
    });
    it("Should initialize contract with correct initial values", async function () {
      expect(await merkletreeContract.I_Optimism()).to.equal(rewardCoinAddress);
      expect(await merkletreeContract.owner()).to.equal(wallets[0].address);
    });
  });
});