const { expect } = require("chai");

describe("Reward contract", function () {
  let Reward;
  let reward;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    Reward = await ethers.getContractFactory("Reward");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    reward = await Reward.deploy();
    await reward.deployed();
  });

  it("Deployment should set the owner", async function () {
    expect(await reward.owner()).to.equal(owner.address);
  });

  it("Should add a criterial", async function () {
    await reward.addCriterial("Test Criterial", [addr1.address], 100);
    const criterial = await reward.criterials(1);
    expect(criterial.label).to.equal(
      ethers.utils.formatBytes32String("Test Criterial")
    );
    expect(criterial.eligibleAddresses).to.eql([addr1.address]);
    expect(criterial.unitReward).to.equal(100);
  });

  it("Should allow eligible user to claim reward", async function () {
    await reward.addCriterial("Test Criterial", [addr1.address], 100);
    const initialBalance = await addr1.getBalance();
    await reward.connect(addr1).claimReward(1, { value: 100 });
    const claimedRewards = await reward.claimedRewards(addr1.address);
    expect(claimedRewards).to.equal(100);
    const finalBalance = await addr1.getBalance();
    expect(finalBalance.sub(initialBalance)).to.equal(100);
  });

  it("Should revert if user is not eligible", async function () {
    await reward.addCriterial("Test Criterial", [addr1.address], 100);
    await expect(
      reward.connect(addr2).claimReward(1, { value: 100 })
    ).to.be.revertedWith("Not eligible for reward");
  });

  it("Should revert if insufficient Ether sent for reward", async function () {
    await reward.addCriterial("Test Criterial", [addr1.address], 100);
    await expect(
      reward.connect(addr1).claimReward(1, { value: 50 })
    ).to.be.revertedWith("Insufficient Ether sent for reward");
  });

  it("Should return true if user is eligible", async function () {
    await reward.addCriterial("Test Criterial", [addr1.address], 100);
    const isEligible = await reward.isEligible(addr1.address, 1);
    expect(isEligible).to.be.true;
  });

  it("Should return false if user is not eligible", async function () {
    await reward.addCriterial("Test Criterial", [addr1.address], 100);
    const isEligible = await reward.isEligible(addr2.address, 1);
    expect(isEligible).to.be.false;
  });
});
