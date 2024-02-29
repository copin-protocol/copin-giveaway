import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

type SignerWithAddress = {
  address: string;
};

describe("Reward contract", function () {
  async function deployRewardFixture(): Promise<{
    rewardContract: any;
    rewardTokenContract: any;
    RewardPerCriterial: number;
    owner: SignerWithAddress;
    addr1: SignerWithAddress;
    addr2: SignerWithAddress;
    total: bigint;
  }> {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const RewardPerCriterial = 100;
    const RewardTokenContract = await ethers.getContractFactory("RewardToken");
    const rewardToken = await RewardTokenContract.deploy();
    const addr_RewardToken = await rewardToken.getAddress();
    const total = await rewardToken.totalSupply();
    const RewardContract = await ethers.getContractFactory("GiveAway");
    const rewardContract = await RewardContract.deploy(addr_RewardToken);
    return {
      rewardContract,
      rewardTokenContract: rewardToken,
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

  //============================================================================================================
  // AddCriterial 
  
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
    const { rewardContract, addr1 } = await loadFixture(deployRewardFixture);

    // Add a criterial with addr1 as eligible
    const unitReward = 100;
    await rewardContract.addCriterial([addr1.address], unitReward);
    expect(await rewardContract.isEligible(addr1.address, 1)).to.equal(true);
  });

  it("Should add a criterial with 200 eligible addresses", async function () {
    const { rewardContract, rewardTokenContract, total } = await loadFixture(
      deployRewardFixture
    );

    // Transfer tokens to the reward contract
    const addrRewardContract = await rewardContract.getAddress();
    await rewardTokenContract.transfer(addrRewardContract, total);

    // Add a criterial
    const unitReward = 100;
    const claims : string[] = [];

    // Get 200 accounts from Hardhat
    const signers = await ethers.getSigners();
    const eligibleAddresses = signers.slice(0, 200);

    // Add eligible addresses to the criterial and claim reward for each address
    for (let i = 0; i < 200; i++) {
      await rewardContract.addCriterial(eligibleAddresses[i].address, unitReward);
      expect(await)
    }

  });
  //============================================================================================================
  // transfer
  
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

  //============================================================================================================
  // getEligibleCriteriaCount
  it("Should count eligible criteria correctly ", async function () {
    const { rewardContract, addr1, addr2, RewardPerCriterial } =
      await loadFixture(deployRewardFixture);
    await rewardContract.addCriterial(
      [addr1.address, addr2.address],
      RewardPerCriterial
    );
    await rewardContract.addCriterial([addr1.address], RewardPerCriterial);
    const CC1 = await rewardContract.getEligibleCriteriaCount(addr1.address);
    const CC2 = await rewardContract.getEligibleCriteriaCount(addr2.address);
    // Assert that the final balances are correct
    expect(CC1).to.equal(2);
    expect(CC2).to.equal(1);
  });

  //============================================================================================================
  // Delete 
  it("Should delete address 2 from eligible Addresses", async function () {
    const { rewardContract, addr1, addr2 } = await loadFixture(
      deployRewardFixture
    );

    // Add a criterial with addr1 as eligible
    const unitReward = 100;
    await rewardContract.addCriterial(
      [addr1.address, addr2.address],
      unitReward
    );
    // Delete user from eligible Addresses
    await rewardContract.removeAddress(addr2.address, 1);
    expect(await rewardContract.isEligible(addr2.address, 1)).to.deep.equal(
      false
    );
    expect(await rewardContract.isEligible(addr1.address, 1)).to.deep.equal(
      true
    );
  });

  it("Should emit AddressRemoved event", async function () {
    const { rewardContract, addr1, addr2 } = await loadFixture(
      deployRewardFixture
    );
    // Add a criterial with addr1 and addr2 as eligible
    const unitReward = 100;
    await rewardContract.addCriterial([addr1.address, addr2.address], unitReward);
  
    // Delete address 2 from eligible Addresses
    const tx = await rewardContract.removeAddress(addr2.address, 1);
  
    await tx.wait();
  
    expect(tx)
      .to.emit(rewardContract, "AddressRemoved")
      .withArgs(addr2.address, 1);
  });

  it("Should revert if address is not eligible for criterial", async function () {
    const { rewardContract, addr1, addr2 } = await loadFixture(
      deployRewardFixture
    );
  
    // Add a criterial with addr1 as eligible
    const unitReward = 100;
    await rewardContract.addCriterial([addr1.address], unitReward);
  
    // Try to remove addr2 which is not eligible from eligible Addresses
    await expect(rewardContract.removeAddress(addr2.address, 1)).to.be.revertedWith("Address is not eligible for this criterial");
  });
  
  it("Should revert if non-owner tries to remove address", async function () {
    const { rewardContract, addr1, addr2 } = await loadFixture(
      deployRewardFixture
    );
    // Add a criterial with addr1 and addr2 as eligible
    const unitReward = 100;
    await rewardContract.addCriterial([addr1.address, addr2.address], unitReward);

    // Attempt to remove address 2 from eligible Addresses by non-owner
    await expect(
      rewardContract.connect(addr1).removeAddress(addr2.address, 1)
    ).to.be.revertedWith("Only owner can call this function");
  });

  //============================================================================================================
  // Claim Reward
  
  it("Should allow eligible user to claim reward", async function () {
    const {
      rewardContract,
      rewardTokenContract,
      total,
      addr1,
      RewardPerCriterial,
    } = await loadFixture(deployRewardFixture);
    const addrRewardContract = await rewardContract.getAddress();

    // Transfer tokens to the reward contract
    await rewardTokenContract.transfer(addrRewardContract, total);

    // Add a criterial with addr1 as eligible
    await rewardContract.addCriterial([addr1.address], RewardPerCriterial);
    await rewardContract.connect(addr1).claimReward(1);
    const balanceOfAddr1 = await rewardTokenContract.balanceOf(addr1.address);
    expect(balanceOfAddr1).to.equal(RewardPerCriterial);
  });
  
  it("Should allow 200 eligible users to claim reward", async function () {
    const { rewardContract, rewardTokenContract, total } = await loadFixture(
      deployRewardFixture
    );

    // Transfer tokens to the reward contract
    const addrRewardContract = await rewardContract.getAddress();
    await rewardTokenContract.transfer(addrRewardContract, total);

    // Add a criterial
    const unitReward = 100;
    const claims : string[] = [];

    // Get 200 accounts from Hardhat
    const signers = await ethers.getSigners();
    const eligibleAddresses = signers.slice(0, 200);
    const addresses : string[] = [];

    // Add eligible addresses to the criterial and claim reward for each address
    for (let i = 0; i < 200; i++) {
      addresses.push(eligibleAddresses[i].address);
    }
    await Promise.all(addresses);
    await rewardContract.addCriterial(addresses, unitReward);
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
  
  it("Should emit ClaimMade event", async function () {
    const { rewardContract, rewardTokenContract, total } = await loadFixture(
      deployRewardFixture
    );

    // Transfer tokens to the reward contract
    const addrRewardContract = await rewardContract.getAddress();
    await rewardTokenContract.transfer(addrRewardContract, total);

    // Add a criterial
    const unitReward = 100;
    const claims : string[] = [];

    // Get 200 accounts from Hardhat
    const signers = await ethers.getSigners();
    const eligibleAddresses = signers.slice(0, 200);
    const addresses : string[] = [];

    // Add eligible addresses to the criterial and claim reward for each address
    for (let i = 0; i < 200; i++) {
      addresses.push(eligibleAddresses[i].address);
    }
    await Promise.all(addresses);
    await rewardContract.addCriterial(addresses, unitReward);
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
      expect(balanceOfAddress).to.emit(rewardContract,"ClaimMade").withArgs(eligibleAddresses[i].address,1,unitReward);
    }
  });
  
  it("Should revert if user is not eligible", async function () {
    const { rewardContract, rewardTokenContract, total, addr1 } = await loadFixture(
      deployRewardFixture
    );
  
    // Transfer tokens to the reward contract
    const addrRewardContract = await rewardContract.getAddress();
    await rewardTokenContract.transfer(addrRewardContract, total);
  
    // Try to claim reward for addr1 which is not eligible
    await expect(rewardContract.connect(addr1).claimReward(1)).to.be.revertedWith("Not eligible for reward");
  });
  
  it("Should revert if reward already claimed", async function () {
    const { rewardContract, rewardTokenContract, total, addr1 } = await loadFixture(
      deployRewardFixture
    );
  
    // Transfer tokens to the reward contract
    const addrRewardContract = await rewardContract.getAddress();
    await rewardTokenContract.transfer(addrRewardContract, total);
  
    // Add a criterial with addr1 as eligible
    const unitReward = 100;
    await rewardContract.addCriterial([addr1.address], unitReward);
  
    // Claim reward for addr1
    await rewardContract.connect(addr1).claimReward(1);
  
    // Try to claim reward again for addr1
    await expect(rewardContract.connect(addr1).claimReward(1)).to.be.revertedWith("Reward already claimed");
  });
  
  it("Should revert if contract doesn't have enough balance", async function () {
    const { rewardContract, rewardTokenContract, addr1 } = await loadFixture(
      deployRewardFixture
    );
  
    // Add a criterial with addr1 as eligible
    const unitReward = 100;
    await rewardContract.addCriterial([addr1.address], unitReward);
  
    await expect(rewardContract.connect(addr1).claimReward(1)).to.be.revertedWith("Not enough balance");
  });  
});
