const { expect } = require("chai");
const { ethers , utils } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Reward contract", function () {
  async function deployRewardFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const rewardTokenContract = await ethers.deployContract("RewardToken");
    const rewardContract = await ethers.deployContract("Reward",);
    // Fixtures can return anything you consider useful for your tests
    return { rewardContract,rewardTokenContract,owner, addr1, addr2 };
  }

  it("Should set the correct owner", async function () {
    const { rewardContract, owner } = await loadFixture(deployRewardFixture);
    expect(await rewardContract.owner()).to.equal(owner.address);
  });

  it("Should allow only owner to add criterial", async function () {
    const { rewardContract, addr1 } = await loadFixture(deployRewardFixture);

    // Try to add a criterial with addr1 as the caller (not the owner)
    await expect(rewardContract.connect(addr1).addCriterial("Test", [addr1.address], 100))
      .to.be.revertedWith("Only owner can call this function");

    // Verify that criterial was not added
    expect(await rewardContract.getCriterial(1)).to.deep.equal(["", [], 0]);
  });

  it("Should add a criterial with eligible addresses", async function () {
    const { rewardContract, owner, addr1 } = await loadFixture(deployRewardFixture);

    // Add a criterial with addr1 as eligible
    const label = "Test Criterial";
    const unitReward = 100;
    await rewardContract.addCriterial(label, [addr1.address], unitReward);

    // Verify the added criterial
    const criterial = await rewardContract.getCriterial(1);
    console.log("Criterial : ",criterial);
    expect(criterial[0]).to.equal(utils.keccak256(utils.toUtf8Bytes(label)));

    expect(criterial[1]).to.deep.equal([addr1.address]);
    expect(criterial[2]).to.equal(unitReward);
  });

  it("Should allow eligible user to claim reward", async function () {
    const { rewardContract, addr1 } = await loadFixture(deployRewardFixture);

    // Add a criterial with addr1 as eligible
    const label = "Test Criterial";
    const unitReward = ethers.utils.parseEther("1");
    await rewardContract.addCriterial(label, [addr1.address], unitReward);

    // Claim reward for addr1
    await expect(addr1.sendTransaction({
      to: rewardContract.address,
      value: unitReward
    })).to.not.be.reverted;

    // Verify that addr1 claimed the reward
    expect(await rewardContract.claimedRewards(addr1.address)).to.equal(unitReward);
  });

  it("Should not allow ineligible user to claim reward", async function () {
    const { rewardContract, addr2 } = await loadFixture(deployRewardFixture);

    // Try to claim reward for addr2
    await expect(addr2.sendTransaction({
      to: rewardContract.address,
      value: ethers.utils.parseEther("1")
    })).to.be.revertedWith("Not eligible for reward");

    // Verify that addr2 didn't claim the reward
    expect(await rewardContract.claimedRewards(addr2.address)).to.equal(0);
  });
});
