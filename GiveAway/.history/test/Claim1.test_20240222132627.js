const { expect } = require("chai");
const { ethers, utils } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Reward contract", function () {
  async function deployRewardFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const RewardPerCriterial = 100;
    const rewardTokenContract = await ethers.deployContract("RewardToken");
    const addr_RewardToken = await rewardTokenContract.getAddress();
    const total = await rewardTokenContract.totalSupply();
    const totalParse = ethers.formatUnits(total.toString(), 18);
    const rewardContract = await ethers.deployContract("Reward", [
      addr_RewardToken,
    ]);
    // Fixtures can return anything you consider useful for your tests
    return { rewardContract, rewardTokenContract,RewardPerCriterial, owner, addr1, addr2, total };
  }

  it("Should set the correct owner", async function () {
    const { rewardContract, owner } = await loadFixture(deployRewardFixture);
    expect(await rewardContract.owner()).to.equal(owner.address);
  });

  it("Should allow only owner to add criterial", async function () {
    const { rewardContract, addr1 } = await loadFixture(deployRewardFixture);

    // Try to add a criterial with addr1 as the caller (not the owner)
    await expect(
      rewardContract.connect(addr1).addCriterial("Test", [addr1.address], 100)
    ).to.be.revertedWith("Only owner can call this function");

    // Verify that criterial was not added
    expect(await rewardContract.getCriterial(1)).to.deep.equal(["", [], 0]);
  });

  // it("Should add a criterial with eligible addresses", async function () {
  //   const { rewardContract, owner, addr1 } = await loadFixture(
  //     deployRewardFixture
  //   );

  //   // Add a criterial with addr1 as eligible
  //   const label = "Test Criterial";
  //   const unitReward = 100;
  //   await rewardContract.addCriterial(label, [addr1.address], unitReward);

  //   // Verify the added criterial
  //   const criterial = await rewardContract.getCriterial(1);
  //   console.log("Criterial : ", criterial);
  //   expect(criterial[0]).to.equal(utils.keccak256(utils.toUtf8Bytes(label)));

  //   expect(criterial[1]).to.deep.equal([addr1.address]);
  //   expect(criterial[2]).to.equal(unitReward);
  // });
  it("Should transfer all tokens from owner to Reward contract", async function () {
    const { rewardContract, rewardTokenContract, total } = await loadFixture(
      deployRewardFixture
    );
    const addrRewardContract = await rewardContract.getAddress();

    // Transfer all tokens from owner to Reward contract
    await rewardTokenContract.transfer(addrRewardContract, total);

    // Get the balance of the owner and Reward contract after the transfer
    const finalBalanceRewardContract = await rewardTokenContract.balanceOf(
      addrRewardContract
    );

    // Assert that the final balances are correct
    expect(finalBalanceRewardContract).to.equal(total);
  });
  it("Should count eligible criteria correctly ", async function () {
    const { rewardContract, total , addr1 , addr2 ,RewardPerCriterial} = await loadFixture(
      deployRewardFixture
    );
    await rewardContract.addCriterial("Copy Trade", [addr1.address,addr2.address], RewardPerCriterial);
    await rewardContract.addCriterial("Copy Trade", [addr1.address], RewardPerCriterial);
    const CC1 = await rewardContract.getEligibleCriteriaCount(addr1.address);
    const CC2 = await rewardContract.getEligibleCriteriaCount(addr2.address);
    console.log("Count Criterial Addr1 :", CC1.toString());
    console.log("Count Criterial Addr2 :", CC2.toString());
    // Assert that the final balances are correct
    expect(CC1).to.equal(2);
    expect(CC2).to.equal(1);
  });
  // it("Should allow eligible user to claim reward", async function () {
  //   const { rewardContract,rewardTokenContract,total, addr1,RewardPerCriterial } = await loadFixture(deployRewardFixture);
  //   const addrRewardContract = await rewardContract.getAddress();
  //   await rewardTokenContract.transfer(addrRewardContract, total);
  //   const finalBalanceRewardContract = await rewardTokenContract.balanceOf(
  //     addrRewardContract
  //   );
  //   // Add a criterial with addr1 as eligible
  //   const label = "Test Criterial";
  //   // const unitReward = ethers.parseUnits(RewardPerCriterial.toString(), 18).toString();
    
  //   await rewardContract.addCriterial(label, [addr1.address], rewardTokenContract);
  //   // Claim reward for addr1
  //   await rewardTokenContract.transferFrom(addrRewardContract,addr1.address, RewardPerCriterial);
  //   // Verify that addr1 claimed the reward
  //   expect(await rewardContract.balanceOf(addr1.address)).to.equal(
  //     RewardPerCriterial
  //   );
  // });

  // it("Should not allow ineligible user to claim reward", async function () {
  //   const { rewardContract, addr2 } = await loadFixture(deployRewardFixture);

  //   // Try to claim reward for addr2
  //   await expect(
  //     addr2.sendTransaction({
  //       to: rewardContract.address,
  //       value: ethers.utils.parseEther("1"),
  //     })
  //   ).to.be.revertedWith("Not eligible for reward");

  //   // Verify that addr2 didn't claim the reward
  //   expect(await rewardContract.claimedRewards(addr2.address)).to.equal(0);
  // });
});
