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
        ["0x0000000000000000000000000000000000000002", "1", "22222"],
        ["0x0000000000000000000000000000000000000003", "2", "33333"],
        ["0x0000000000000000000000000000000000000004", "3", "44444"],
        ["0x0000000000000000000000000000000000000005", "4", "55555"],
        ["0x0000000000000000000000000000000000000006", "5", "66666"],
        ["0x0000000000000000000000000000000000000007", "6", "77777"],
        ["0x0000000000000000000000000000000000000008", "7", "88888"],
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