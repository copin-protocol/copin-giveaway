import { loadFixture as loadFixtureToolbox } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import "@nomiclabs/hardhat-ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { completeFixture } from "../utils/fixtures";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";

describe("Reward contract", function () {
  describe("Deployment", function () {
    const fixture = async () => {
      const values = [
        ["0x0000000000000000000000000000000000000001", "0", "10000000000000000000"],
        ["0x0000000000000000000000000000000000000002", "1", "20000000000000000000"],
        ["0x0000000000000000000000000000000000000003", "2", "30000000000000000000"],
        ["0x0000000000000000000000000000000000000004", "3", "40000000000000000000"],
        ["0x0000000000000000000000000000000000000005", "4", "50000000000000000000"],
        ["0x0000000000000000000000000000000000000006", "5", "60000000000000000000"],
        ["0x0000000000000000000000000000000000000007", "6", "70000000000000000000"],
        ["0x0000000000000000000000000000000000000008", "7", "80000000000000000000"],
      ];
    };
  });
});