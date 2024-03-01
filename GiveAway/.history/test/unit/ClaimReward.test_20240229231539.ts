import { loadFixture as loadFixtureToolbox } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import "@nomiclabs/hardhat-ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { completeFixture } from "../utils/fixtures";
import { expect } from "chai";
describe("Reward contract", function () {
  describe("Deployment", function () {
    let rewardContract: any;
    let rewardTokenContract: any;
    let total: bigint;
    let wallets: SignerWithAddress[];
    let unitReward: Number;
    const fixture = async () => {
      const { rewardContract, rewardTokenContract, total } =
        await completeFixture();
      unitReward = 100;
      wallets = await ethers.getSigners();
      return {
        rewardContract,
        rewardTokenContract,
        total,
        unitReward,
        wallets
      };
    };
    // let loadFixture: any;
    // let rewardContract: Contract;
    // let rewardTokenContract: Contract;
    // let total: bigint;
    // let wallets: SignerWithAddress[];
    // let unitReward: Number;
    // const fixture = async () => {
    //   const { rewardContract, rewardTokenContract, total } =
    //     await completeFixture();
    //   unitReward = 100;
    //   return {
    //     rewardContract,
    //     rewardTokenContract,
    //     total,
    //     unitReward,
    //     wallets
    //   };
    // };
    // before("create fixture loader", async () => {
    //   wallets = await ethers.getSigners();
    //   loadFixture = createFixtureLoader(wallets as any[]);
    // });
    beforeEach("load fixture", async () => {
      ({ unitReward, rewardContract, rewardTokenContract, total, wallets } =
        await loadFixtureToolbox(fixture));
    });
    it("Should initialize contract with correct initial values", async function () {
      

      const rewardCoinAddress = await rewardTokenContract.getAddress();

      expect(await rewardContract.I_Optimism()).to.equal(rewardCoinAddress);
      expect(await rewardContract.owner()).to.equal(wallets[0].address);
      expect(await rewardContract.getCurrentCriteriaId()).to.equal(1);
    });

    ============================================================================================================
    transfer
    describe("Transfer all Reward Token", function () {
      it("Should transfer all tokens from owner to Reward contract", async function () {
        const { rewardContract, rewardTokenContract, total } =
          await loadFixture(deployRewardFixture);
        const addrRewardContract = await rewardContract.getAddress();

        await rewardTokenContract.transfer(addrRewardContract, total);

        const finalBalanceRewardContract = await rewardTokenContract.balanceOf(
          addrRewardContract
        );

        expect(finalBalanceRewardContract).to.equal(total);
      });
    });

    //============================================================================================================
    // AddCriterial

    describe("AddCriterial", function () {
      it("Should allow only owner to add criterial", async function () {
        const { rewardContract, addr1 } = await loadFixture(
          deployRewardFixture
        );

        await expect(
          rewardContract.connect(addr1).addCriterial([addr1.address], 100)
        ).to.be.rejectedWith("Only owner can call this function");

        await expect(
          rewardContract.isEligible(addr1.address, 1)
        ).to.be.rejectedWith("Criterial does not exist");
      });

      it("Should add a criterial with eligible addresses", async function () {
        const { rewardContract, addr1, unitReward } = await loadFixture(
          deployRewardFixture
        );

        await rewardContract.addCriterial([addr1.address], unitReward);
        expect(await rewardContract.isEligible(addr1.address, 1)).to.equal(
          true
        );
      });

      it("Should revert if trying to add a criterial with unit reward less than or equal to 0 ", async function () {
        const { rewardContract, addr1 } = await loadFixture(
          deployRewardFixture
        );

        await expect(
          rewardContract.addCriterial([addr1.address], 0)
        ).to.be.rejectedWith("Unit reward must be greater than 0");
      });

      it("Should revert if no eligible addresses are provided when adding a criterial ", async function () {
        const { rewardContract } = await loadFixture(deployRewardFixture);

        await expect(rewardContract.addCriterial([], 123)).to.be.rejectedWith(
          "At least one eligible address must be provided"
        );
      });
    });

    //============================================================================================================
    // addAddressToCriterial

    describe("Additional Addresses", function () {
      it("Should allow only owner to addAddressToCriterial", async function () {
        const { rewardContract, addr1, addr2, unitReward } = await loadFixture(
          deployRewardFixture
        );

        await rewardContract.addCriterial([addr2.address], unitReward);
        await expect(
          rewardContract.connect(addr1).addCriterial([addr1.address], 1)
        ).to.be.rejectedWith("Only owner can call this function");

        expect(await rewardContract.isEligible(addr1.address, 1)).to.equal(
          false
        );
      });

      it("Should additional eligible addresses into criterial", async function () {
        const { rewardContract, unitReward, addr1, addr2 } = await loadFixture(
          deployRewardFixture
        );

        await rewardContract.addCriterial([addr1.address], unitReward);
        await rewardContract.addAddressToCriterial([addr2.address], 1);

        expect(await rewardContract.isEligible(addr2.address, 1)).to.equal(
          true
        );
      });

      it("Should revert if Criterial does not exist ", async function () {
        const { rewardContract, unitReward, addr1, addr2 } = await loadFixture(
          deployRewardFixture
        );

        await rewardContract.addCriterial([addr1.address], unitReward);

        await expect(
          rewardContract.addAddressToCriterial([addr2.address], 2)
        ).to.be.rejectedWith("Criterial does not exist");
      });

      it("Should revert if no eligible addresses are provided when adding a criterial ", async function () {
        const { rewardContract, addr1, unitReward } = await loadFixture(
          deployRewardFixture
        );

        await rewardContract.addCriterial([addr1.address], unitReward);

        await expect(
          rewardContract.addAddressToCriterial([], 1)
        ).to.be.rejectedWith("At least one eligible address must be provided");
      });
    });
    //============================================================================================================
    // Remove
    describe("Remove address", function () {
      it("Should Remove address 2 from eligible Addresses", async function () {
        const { rewardContract, addr1, addr2, unitReward } = await loadFixture(
          deployRewardFixture
        );

        await rewardContract.addCriterial(
          [addr1.address, addr2.address],
          unitReward
        );
        await rewardContract.removeAddress(addr2.address, 1);

        expect(await rewardContract.isEligible(addr2.address, 1)).to.deep.equal(
          false
        );
        expect(await rewardContract.isEligible(addr1.address, 1)).to.deep.equal(
          true
        );
      });

      it("Should emit AddressRemoved event", async function () {
        const { rewardContract, addr1, addr2, unitReward } = await loadFixture(
          deployRewardFixture
        );

        await rewardContract.addCriterial(
          [addr1.address, addr2.address],
          unitReward
        );

        const tx = await rewardContract.removeAddress(addr2.address, 1);

        await tx.wait();

        expect(tx)
          .to.emit(rewardContract, "AddressRemoved")
          .withArgs(addr2.address, 1);
      });

      it("Should revert if address is not eligible for criterial", async function () {
        const { rewardContract, addr1, addr2, unitReward } = await loadFixture(
          deployRewardFixture
        );

        await rewardContract.addCriterial([addr1.address], unitReward);

        await expect(
          rewardContract.removeAddress(addr2.address, 1)
        ).to.be.rejectedWith("Address is not eligible for this criterial");
      });

      it("Should revert if non-owner tries to remove address", async function () {
        const { rewardContract, addr1, addr2, unitReward } = await loadFixture(
          deployRewardFixture
        );

        await rewardContract.addCriterial(
          [addr1.address, addr2.address],
          unitReward
        );

        await expect(
          rewardContract.connect(addr1).removeAddress(addr2.address, 1)
        ).to.be.rejectedWith("Only owner can call this function");
      });
    });
    //============================================================================================================
    // Claim Reward
    describe("Claim Reward", function () {
      it("Should allow eligible user to claim reward", async function () {
        const {
          rewardContract,
          rewardTokenContract,
          total,
          addr1,
          unitReward,
        } = await loadFixture(deployRewardFixture);
        const addrRewardContract = await rewardContract.getAddress();

        await rewardTokenContract.transfer(addrRewardContract, total);
        await rewardContract.addCriterial([addr1.address], unitReward);
        await rewardContract.connect(addr1).claimReward(1);

        const balanceOfAddr1 = await rewardTokenContract.balanceOf(
          addr1.address
        );

        expect(balanceOfAddr1).to.equal(unitReward);
      });

      it("Should allow 200 eligible users to claim reward", async function () {
        const { rewardContract, rewardTokenContract, total, unitReward } =
          await loadFixture(deployRewardFixture);

        const addrRewardContract = await rewardContract.getAddress();

        await rewardTokenContract.transfer(addrRewardContract, total);

        const claims: string[] = [];
        const signers = await ethers.getSigners();
        const eligibleAddresses = signers.slice(0, 200);
        const addresses: string[] = [];

        for (let i = 0; i < 200; i++) {
          addresses.push(eligibleAddresses[i].address);
        }
        await Promise.all(addresses);
        await rewardContract.addCriterial(addresses, unitReward);
        for (let i = 0; i < 200; i++) {
          claims.push(
            rewardContract.connect(eligibleAddresses[i]).claimReward(1)
          );
        }

        await Promise.all(claims);

        for (let i = 0; i < 200; i++) {
          const balanceOfAddress = await rewardTokenContract.balanceOf(
            eligibleAddresses[i].address
          );
          expect(balanceOfAddress).to.equal(unitReward);
        }
      });

      it("Should emit ClaimMade event", async function () {
        const { rewardContract, rewardTokenContract, total, unitReward } =
          await loadFixture(deployRewardFixture);

        const addrRewardContract = await rewardContract.getAddress();

        await rewardTokenContract.transfer(addrRewardContract, total);

        const claims: string[] = [];
        const signers = await ethers.getSigners();
        const eligibleAddresses = signers.slice(0, 200);
        const addresses: string[] = [];

        for (let i = 0; i < 200; i++) {
          addresses.push(eligibleAddresses[i].address);
        }

        await Promise.all(addresses);
        await rewardContract.addCriterial(addresses, unitReward);

        for (let i = 0; i < 200; i++) {
          claims.push(
            rewardContract.connect(eligibleAddresses[i]).claimReward(1)
          );
        }

        await Promise.all(claims);

        for (let i = 0; i < 200; i++) {
          const balanceOfAddress = await rewardTokenContract.balanceOf(
            eligibleAddresses[i].address
          );

          expect(balanceOfAddress)
            .to.emit(rewardContract, "ClaimMade")
            .withArgs(eligibleAddresses[i].address, 1, unitReward);
        }
      });

      it("Should revert if user is not eligible", async function () {
        const { rewardContract, rewardTokenContract, total, addr1 } =
          await loadFixture(deployRewardFixture);
        const addrRewardContract = await rewardContract.getAddress();

        await rewardTokenContract.transfer(addrRewardContract, total);

        await expect(
          rewardContract.connect(addr1).claimReward(1)
        ).to.be.rejectedWith("Criterial does not exist");
      });

      it("Should revert if reward already claimed", async function () {
        const {
          rewardContract,
          rewardTokenContract,
          total,
          addr1,
          unitReward,
        } = await loadFixture(deployRewardFixture);

        // Transfer tokens to the reward contract
        const addrRewardContract = await rewardContract.getAddress();

        await rewardTokenContract.transfer(addrRewardContract, total);
        await rewardContract.addCriterial([addr1.address], unitReward);
        await rewardContract.connect(addr1).claimReward(1);

        await expect(
          rewardContract.connect(addr1).claimReward(1)
        ).to.be.rejectedWith("Reward already claimed");
      });

      it("Should revert if contract doesn't have enough balance", async function () {
        const { rewardContract, addr1, unitReward } = await loadFixture(
          deployRewardFixture
        );

        await rewardContract.addCriterial([addr1.address], unitReward);

        await expect(
          rewardContract.connect(addr1).claimReward(1)
        ).to.be.rejectedWith("Not enough balance");
      });
    });
    //============================================================================================================
    // isEligible
    describe("isEligible", function () {
      it("Should return true if Address Eligible", async function () {
        const { rewardContract, addr1, unitReward } = await loadFixture(
          deployRewardFixture
        );

        await rewardContract.addCriterial([addr1.address], unitReward);

        expect(await rewardContract.isEligible(addr1.address, 1)).to.be.equal(
          true
        );
      });

      it("Should return false if Address not Eligible", async function () {
        const { rewardContract, addr1, addr2, unitReward } = await loadFixture(
          deployRewardFixture
        );

        await rewardContract.addCriterial([addr1.address], unitReward);

        expect(await rewardContract.isEligible(addr2.address, 1)).to.be.equal(
          false
        );
      });

      it("Should revert if Criterial does not exist to check isEligible", async function () {
        const { rewardContract, addr1, unitReward } = await loadFixture(
          deployRewardFixture
        );

        await rewardContract.addCriterial([addr1.address], unitReward);

        await expect(
          rewardContract.isEligible(addr1.address, 2)
        ).to.be.rejectedWith("Criterial does not exist");
      });
    });
    //============================================================================================================
    // userClaimed
    describe("Check userClaimed", function () {
      it("Should return true if user claimed reward", async function () {
        const {
          rewardContract,
          rewardTokenContract,
          total,
          addr1,
          unitReward,
        } = await loadFixture(deployRewardFixture);
        const addrRewardContract = await rewardContract.getAddress();

        await rewardTokenContract.transfer(addrRewardContract, total);

        await rewardContract.addCriterial([addr1.address], unitReward);
        await rewardContract.connect(addr1).claimReward(1);

        expect(await rewardContract.userClaimed(addr1.address, 1)).to.be.equal(
          true
        );
      });

      it("Should return false if user not claim reward yet", async function () {

        const addrRewardContract = await rewardContract.getAddress();

        await rewardTokenContract.transfer(addrRewardContract, total);

        await rewardContract.addCriterial([addr1.address], unitReward);

        expect(await rewardContract.userClaimed(addr1.address, 1)).to.be.equal(
          false
        );
      });

      it("Should revert if Address Not eligible for reward to check userClaimed", async function () {

        const addrRewardContract = await rewardContract.getAddress();

        await rewardTokenContract.transfer(addrRewardContract, total);

        await rewardContract.addCriterial([addr1.address], unitReward);
        await rewardContract.connect(addr1).claimReward(1);

        await expect(
          rewardContract.userClaimed(addr2.address, 1)
        ).to.be.rejectedWith("Not eligible for reward");
      });

      it("Should revert if Criterial does not exist to check userClaimed", async function () {
        const addrRewardContract = await rewardContract.getAddress();

        await rewardTokenContract.transfer(addrRewardContract, total);

        await rewardContract.addCriterial([addr1.address], unitReward);
        await rewardContract.connect(addr1).claimReward(1);

        await expect(
          rewardContract.userClaimed(addr1.address, 2)
        ).to.be.rejectedWith("Criterial does not exist");
      });
    });
    //============================================================================================================
    // getEligibleCriteriaCount
    describe("getEligibleCriteriaCount", function () {
      it("Should Check Eligible Criteria Count", async function () {

        await rewardContract.addCriterial(
          [addr1.address, addr2.address],
          unitReward
        );
        await rewardContract.addCriterial([addr1.address], unitReward);

        expect(
          await rewardContract.getEligibleCriteriaCount(addr1.address)
        ).to.be.equal(2);
        expect(
          await rewardContract.getEligibleCriteriaCount(addr2.address)
        ).to.be.equal(1);
      });

      it("Should return 0 if Address not eligible for reward", async function () {

        await rewardContract.addCriterial([addr1.address], unitReward);

        expect(
          await rewardContract.getEligibleCriteriaCount(addr2.address)
        ).to.be.equal(0);
      });
    });
    // ============================================================================================================
    // getCriterial
    describe("getCriterial", function () {
      it("Should return eligible addresses and unit reward for an existing criterial", async function () {

        await rewardContract.addCriterial([addr1.address, addr2.address], 100);

        const [addresses, unitReward] = await rewardContract.getCriterial(1);

        expect(addresses.length).to.equal(2);
        expect(unitReward).to.equal(100);

        expect(addresses[0]).to.equal(addr1.address);
        expect(addresses[1]).to.equal(addr2.address);
      });

      it("Should revert if trying to get non-existing criterial", async function () {

        await expect(rewardContract.getCriterial(1)).to.be.rejectedWith(
          "Criterial does not exist"
        );
      });
    });
  });
});
