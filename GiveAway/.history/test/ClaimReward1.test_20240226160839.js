const { expect } = require("chai");
const { ethers} = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
describe("Reward contract", function () {
  async function deployRewardFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const RewardPerCriterial = 100;
    const rewardTokenContract = await ethers.deployContract("RewardToken");
    const addr_RewardToken = rewardTokenContract.addressSC;
    const total = await rewardTokenContract.totalSupply();
    const rewardContract = await ethers.deployContract("GiveAway", [
      addr_RewardToken,
    ]);
    return {
      rewardContract,
      rewardTokenContract,
      RewardPerCriterial,
      owner,
      addr1,
      addr2,
      total,
    };
  }

  it("Should set the correct owner", async function () {
    const { rewardContract, owner } = await loadFixture(deployRewardFixture);
    expect(await rewardContract.owner()).to.equal(owner.address);
  });

  it("Should allow only owner to add criterial", async function () {
    const { rewardContract, addr1 } = await loadFixture(deployRewardFixture);

    // Try to add a criterial with addr1 as the caller (not the owner)
    await expect(
      rewardContract.connect(addr1).addCriterial([addr1.address], 100)
    ).to.be.revertedWith("Only owner can call this function");
    // Verify that criterial was not added
    expect(await rewardContract.isEligible(addr1.address, 1)).to.equal(false);
  });

  it("Should add a criterial with eligible addresses", async function () {
    const { rewardContract, addr1 } = await loadFixture(
      deployRewardFixture
    );

    // Add a criterial with addr1 as eligible
    const unitReward = 100;
    await rewardContract.addCriterial([addr1.address], unitReward);
    expect(await rewardContract.isEligible(addr1.address, 1)).to.equal(true);
  });
  it("Should transfer all tokens from owner to Reward contract", async function () {
    const { rewardContract, rewardTokenContract, total } = await loadFixture(
      deployRewardFixture
    );
    const addrRewardContract = await rewardContractaddressSC;

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
    const { rewardContract, addr1, addr2, RewardPerCriterial } =
      await loadFixture(deployRewardFixture);
    await rewardContract.addCriterial(
      [addr1.address, addr2.address],
      RewardPerCriterial
    );
    await rewardContract.addCriterial(
      [addr1.address],
      RewardPerCriterial
    );
    const CC1 = await rewardContract.getEligibleCriteriaCount(addr1.address);
    const CC2 = await rewardContract.getEligibleCriteriaCount(addr2.address);
    // Assert that the final balances are correct
    expect(CC1).to.equal(2);
    expect(CC2).to.equal(1);
  });
  // it("Should add 200 addresses to a criterial", async function () {
  //   const { rewardContract, addr1 } = await loadFixture(deployRewardFixture);

  //   // Add a criterial
  //   const label = "Co nguoi yeu";
  //   const unitReward = 100;
  //   // Generate 200 addresses
  //   const addresses = [];
  //   for (let i = 0; i < 200; i++) {
  //     const wallet = ethers.Wallet.createRandom();
  //     addresses.push(wallet.address);
  //   }
  //   const tx = await rewardContract.addCriterial(label, addresses, unitReward);
  //   const receipt = await tx.wait();

  //   const gasUsed = receipt.gasUsed;
  //   console.log("Gas used for adding 200 address : ", gasUsed);
  //   // Verify that the addresses were added correctly
  //   const criterial = await rewardContract.getCriterial(1);
  //   expect(criterial[1].length).to.equal(200);
  // });
  it("Should delete address 2 from eligible Addresses", async function () {
    const { rewardContract, addr1 ,addr2 } = await loadFixture(
      deployRewardFixture
    );

    // Add a criterial with addr1 as eligible
    const unitReward = 100;
    await rewardContract.addCriterial([addr1.address, addr2.address], unitReward);
    // Delete user from eligible Addresses 
    await rewardContract.removeAddress(addr2.address, 1);
    expect(await rewardContract.isEligible(addr2.address, 1)).to.deep.equal(false);
    expect(await rewardContract.isEligible(addr1.address, 1)).to.deep.equal(true);
  });
  it("Should allow eligible user to claim reward", async function () {
    const {
      rewardContract,
      rewardTokenContract,
      total,
      addr1,
      RewardPerCriterial,
    } = await loadFixture(deployRewardFixture);
    const addrRewardContract = rewardContract.addressSC;

    // Transfer tokens to the reward contract
    await rewardTokenContract.transfer(addrRewardContract, total);

    // Add a criterial with addr1 as eligible
    await rewardContract.addCriterial(
      [addr1.address],
      RewardPerCriterial
    );
    await rewardContract.connect(addr1).claimReward(1);
    const balanceOfAddr1 = await rewardTokenContract.balanceOf(addr1.address);
    expect(balanceOfAddr1).to.equal(RewardPerCriterial);
  });
  it("Should allow 200 eligible users to claim reward", async function () {
    const { rewardContract, rewardTokenContract, total } = await loadFixture(
      deployRewardFixture
    );

    // Transfer tokens to the reward contract
    const addrRewardContract = rewardContract.addressSC;
    await rewardTokenContract.transfer(addrRewardContract, total);

    // Add a criterial
    const unitReward = 100;
    const claims = [];

    // Get 200 accounts from Hardhat
    const signers = await ethers.getSigners();
    const eligibleAddresses = signers.slice(0, 200);
    const addresses = []

    // Add eligible addresses to the criterial and claim reward for each address
    for (let i = 0; i < 200; i++) {
      addresses.push(eligibleAddresses[i].address);
    }
    await Promise.all(addresses);
    await rewardContract.addCriterial(
      addresses,
      unitReward
    );
    for (let i = 0; i < 200; i++) {
      claims.push(rewardContract.connect(eligibleAddresses[i]).claimReward(1));
    }

    // Wait for all claims to be processed
    await Promise.all(claims);

    // Verify that each eligible address received the correct reward
    for (let i = 0; i < 200; i++) {
      const balanceOfAddress = await rewardTokenContract.balanceOf(
        eligibleAddresses[i].address
      );
      expect(balanceOfAddress).to.equal(unitReward);
    }
  });
});
