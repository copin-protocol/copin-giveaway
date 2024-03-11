import { loadFixture as loadFixtureToolbox } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import "@nomiclabs/hardhat-ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { completeFixture } from "../utils/fixtures";

describe("Reward contract", function () {
  describe("Deployment", function () {
    let rewardContract: any;
    let rewardTokenContract: any;
    let total: bigint;
    let wallets: SignerWithAddress[];
    let unitReward: Number;
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

    beforeEach("load fixture", async () => {
      ({ unitReward, rewardContract, rewardTokenContract, total, wallets } =
        await loadFixtureToolbox(fixture));
    });

    it("Should initialize contract with correct initial values", async function () {
      const rewardCoinAddress = await rewardTokenContract.getAddress();
      expect(await rewardContract.I_Optimism()).to.equal(rewardCoinAddress);
      expect(await rewardContract.owner()).to.equal(wallets[0].address);
      expect(await rewardContract.getCurrentCriteriaId()).to.equal(1);
    });
