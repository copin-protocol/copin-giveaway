const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
describe("Token contract", function () {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const claimReward = await ethers.deployContract("Reward");

    // Fixtures can return anything you consider useful for your tests
    return { claimReward, owner, addr1, addr2 };
  }

  it("Should owner", async function () {
    const { claimReward, owner } = await loadFixture(deployTokenFixture);
    expect(await claimReward.owner()).to.equal(owner.address);
  });
  it("Should allow eligible user1 for ", async function () {
    const { claimReward, addr1 } = await loadFixture(
      deployTokenFixture
    );

    // Add a criterial with addr1 as eligible
    const label = "Have a girlfriend";
    const unitReward = 100;
    await claimReward.addCriterial("ANH YEU EM", [addr1.address], 123);
    const bool = await claimReward.isEligible(addr1.address, 1);
    expect(bool).to.equal(true);
  });
  it("Show all ")
});
