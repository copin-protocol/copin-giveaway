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

  it("Check owner", async function () {
    const { claimReward, owner } = await loadFixture(deployTokenFixture);
    expect(await claimReward.owner()).to.equal(owner.address);
  });
  it("Should allow eligible user1 for Criterial -Have a girlfriend-", async function () {
    const { claimReward, addr1 } = await loadFixture(deployTokenFixture);

    // Add a criterial with addr1 as eligible
    const label = "Have a girlfriend";
    const unitReward = 100;
    await claimReward.addCriterial(label, [addr1.address], unitReward);
    const rs = await claimReward.getCriterial(1);
    console.log("Result :",rs);
    const bool = await claimReward.isEligible(addr1.address, 1);
    expect(bool).to.equal(true);
  });
  it("Measures gas cost of addCriterial", async function () {
    const { claimReward ,addr1,addr2 } = await loadFixture(deployTokenFixture);

    const label = "Have a girlfriend";
    const unitReward = 100;
    const eligibleAddresses = [addr1.address, addr2.address];

    const tx = await claimReward.addCriterial(label, eligibleAddresses, unitReward);
    const receipt = await tx.wait();

    const gasUsed = receipt.gasUsed;

    console.log("Gas used for addCriterial:", gasUsed);

    // You can assert on the gasUsed value if you have a specific expectation
    // expect(gasUsed).to.be.lessThan(100000); // Example assertion
  });
});
