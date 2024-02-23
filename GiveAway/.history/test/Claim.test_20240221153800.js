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
  it("Should allow eligible user to claim reward", async function () {
    const { claimReward, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );

    // Add a criterial with addr1 as eligible
    const label = "Have a girlfriend";
    const unitReward = 100;
    await claimReward.addCriterial(label, [addr1], unitReward);

    // Claim reward from addr1
    // await addr1.sendTransaction({
    //   to: claimReward.address,
    //   value: unitReward,
    // });
      
    // Check claimed reward for addr1
    // const claimedAmount = await claimReward.claimedRewards(addr1);
    // CHeck isEligible 
    const bool = await claimReward.isEligible(addr1)
    expect(claimedAmount).to.equal(unitReward);
  });
});
