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

    const tx = await Reward.deploy();
    await tx.wait(); // Wait for deployment transaction to be mined

    reward = await ethers.getContractAt("Reward", tx.contractAddress);
  });

  it("Deployment should set the owner", async function () {
    expect(await reward.owner()).to.equal(owner.address);
  });

  // Add other tests...
});
