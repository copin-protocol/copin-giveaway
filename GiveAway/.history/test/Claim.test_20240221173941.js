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
  it("Should allow eligible user1", async function () {
    const { claimReward, addr1 } = await loadFixture(
      deployTokenFixture
    );

    // Add a criterial with addr1 as eligible
    const label = "Have a girlfriend";
    const unitReward = 100;
    console.log(addr1.address);
    await claimReward.addCriterial(label, [addr1.address], unitReward);
    console.log(addr1.address);
    const bool = await claimReward.isEligible(addr1.address)
    expect(bool).to.equal(true);
  });
});
