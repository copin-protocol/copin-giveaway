// File: test/Reward.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reward", function () {
  let Reward;
  let reward;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    Reward = await ethers.getContractFactory("Reward");
    [owner, addr1, addr2] = await ethers.getSigners();

    reward = await Reward.deploy();
    await reward.deployed();
  });

  it("Should add criterial", async function () {
    await reward.addCriterial("Test", [addr1.address], 100);
    const criterial = await reward.criterials(1);
    expect(criterial.label).to.equal(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Test")));
    expect(criterial.eligibleAddresses[0]).to.equal(addr1.address);
    expect(criterial.unitReward).to.equal(100);
  });

  it("Should not add criterial with empty eligible addresses", async function () {
    await expect(reward.addCriterial("Test", [], 100)).to.be.revertedWith("At least one eligible address is required");
  });

  it("Should allow eligible address to claim reward", async function () {
    await reward.addCriterial("Test", [addr1.address], 100);
    await reward.connect(addr1).claimReward(1, { value: 100 });
    const claimedAmount = await reward.claimedRewards(addr1.address);
    expect(claimedAmount).to.equal(100);
  });

  it("Should not allow ineligible address to claim reward", async function () {
    await reward.addCriterial("Test", [addr1.address], 100);
    await expect(reward.connect(addr2).claimReward(1, { value: 100 })).to.be.revertedWith("Not eligible for reward");
  });

  it("Should revert if insufficient Ether sent for reward", async function () {
    await reward.addCriterial("Test", [addr1.address], 100);
    await expect(reward.connect(addr1).claimReward(1, { value: 50 })).to.be.revertedWith("Insufficient Ether sent for reward");
  });
});
