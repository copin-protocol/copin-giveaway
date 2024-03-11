import "@nomiclabs/hardhat-ethers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

describe("Reward contract", function () {
  describe("Deployment", function () {
    let wallets: SignerWithAddress[]; 
    const fixture = async () => {
      wallets = await ethers.getSigners();
      const values = [
        [wallets[1], "0", "11111"],
        [wallets[], "1", "22222"],
        [wallets[], "2", "33333"],
        [wallets[], "3", "44444"],
        [wallets[], "4", "55555"],
        [wallets[], "5", "66666"],
        [wallets[], "6", "77777"],
        [wallets[], "7", "88888"],
      ];
      // (2)
      const tree = StandardMerkleTree.of(values, ["address", "uint256", "uint256"]);

      // (3)
      console.log("Merkle Root:", tree.root);

      // (4)
      fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));
    };
    fixture();
  });
});