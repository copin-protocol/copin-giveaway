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
      const { rewardContract, rewardTokenContract, total } =
        await completeFixture();
      unitReward = 100;
      wallets = await ethers.getSigners();
      return {
        rewardContract,
        rewardTokenContract,
        total,
        unitReward,
        wallets,
      };
    };
  });
});