import { loadFixture as loadFixtureToolbox } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import "@nomiclabs/hardhat-ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { completeFixture } from "../utils/fixtures";

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
        wallets,
      };
    };

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

    // ============================================================================================================
    // transfer

    describe("Transfer all Reward Token", function () {
      it("Should transfer all tokens from owner to Reward contract", async function () {
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
        await expect(
          rewardContract
            .connect(wallets[1])
            .addCriterial([wallets[1].address], 100)
        ).to.be.rejectedWith("Only owner can call this function");

        await expect(
          rewardContract.isEligible(wallets[1].address, 1)
        ).to.be.rejectedWith("Criterial does not exist");
      });

      it("Should add a criterial with eligible addresses", async function () {
        await rewardContract.addCriterial([wallets[1].address], unitReward);
        expect(await rewardContract.isEligible(wallets[1].address, 1)).to.equal(
          true
        );
      });

      it("Should add a criterial with 200 eligible addresses", async function () {
        const addrRewardContract = await rewardContract.getAddress();

        await rewardTokenContract.transfer(addrRewardContract, total);

        const eligibleAddresses = wallets.slice(0, 200);
        const addresses: string[] = [];

        for (let i = 0; i < 200; i++) {
          addresses.push(eligibleAddresses[i].address);
        }

        await Promise.all(addresses);
        await rewardContract.addCriterial(addresses, unitReward);

        for (let i = 0; i < 200; i++) {
          await rewardContract.isEligible()
        }
      });
      it("Should revert if trying to add a criterial with unit reward less than or equal to 0 ", async function () {
        await expect(
          rewardContract.addCriterial([wallets[1].address], 0)
        ).to.be.rejectedWith("Unit reward must be greater than 0");
      });

      it("Should revert if no eligible addresses are provided when adding a criterial ", async function () {
        await expect(rewardContract.addCriterial([], 123)).to.be.rejectedWith(
          "At least one eligible address must be provided"
        );
      });
    });

    it("Should revert if not enough gas to add criterial", async function () {
      const tx = await rewardContract.addCriterial(
        [wallets[1].address],
        unitReward
      );
      const tx1 = await tx.wait();
      const estimatedGasCost = Number(tx1.gasUsed);

      const gasLimit = estimatedGasCost - 1000;

      await expect(
        rewardContract
          .connect(wallets[0])
          .addCriterial([wallets[1].address], unitReward, { gasLimit })
      ).to.be.rejectedWith("out of gas");
    });

    //     //============================================================================================================
    //     // addAddressToCriterial

    //     describe("Additional Addresses", function () {
    //       it("Should allow only owner to addAddressToCriterial", async function () {
    //         await rewardContract.addCriterial([wallets[2].address], unitReward);
    //         await expect(
    //           rewardContract.connect(wallets[1]).addCriterial([wallets[1].address], 1)
    //         ).to.be.rejectedWith("Only owner can call this function");

    //         expect(await rewardContract.isEligible(wallets[1].address, 1)).to.equal(
    //           false
    //         );
    //       });

    //       it("Should additional eligible addresses into criterial", async function () {
    //         await rewardContract.addCriterial([wallets[1].address], unitReward);
    //         await rewardContract.addAddressToCriterial([wallets[2].address], 1);

    //         expect(await rewardContract.isEligible(wallets[2].address, 1)).to.equal(
    //           true
    //         );
    //       });

    //       it("Should revert if Criterial does not exist ", async function () {
    //         await rewardContract.addCriterial([wallets[1].address], unitReward);

    //         await expect(
    //           rewardContract.addAddressToCriterial([wallets[2].address], 2)
    //         ).to.be.rejectedWith("Criterial does not exist");
    //       });

    //       it("Should revert if no eligible addresses are provided when adding a criterial ", async function () {
    //         await rewardContract.addCriterial([wallets[1].address], unitReward);

    //         await expect(
    //           rewardContract.addAddressToCriterial([], 1)
    //         ).to.be.rejectedWith("At least one eligible address must be provided");
    //       });
    //     });

    //     //============================================================================================================
    //     // Remove

    //     describe("Remove address", function () {
    //       it("Should Remove address 2 from eligible Addresses", async function () {
    //         await rewardContract.addCriterial(
    //           [wallets[1].address, wallets[2].address],
    //           unitReward
    //         );
    //         await rewardContract.removeAddress(wallets[2].address, 1);

    //         expect(await rewardContract.isEligible(wallets[2].address, 1)).to.deep.equal(
    //           false
    //         );
    //         expect(await rewardContract.isEligible(wallets[1].address, 1)).to.deep.equal(
    //           true
    //         );
    //       });

    //       it("Should emit AddressRemoved event", async function () {
    //         await rewardContract.addCriterial(
    //           [wallets[1].address, wallets[2].address],
    //           unitReward
    //         );

    //         const tx = await rewardContract.removeAddress(wallets[2].address, 1);

    //         await tx.wait();

    //         expect(tx)
    //           .to.emit(rewardContract, "AddressRemoved")
    //           .withArgs(wallets[2].address, 1);
    //       });

    //       it("Should revert if address is not eligible for criterial", async function () {
    //         await rewardContract.addCriterial([wallets[1].address], unitReward);

    //         await expect(
    //           rewardContract.removeAddress(wallets[2].address, 1)
    //         ).to.be.rejectedWith("Address is not eligible for this criterial");
    //       });

    //       it("Should revert if non-owner tries to remove address", async function () {
    //         await rewardContract.addCriterial(
    //           [wallets[1].address, wallets[2].address],
    //           unitReward
    //         );

    //         await expect(
    //           rewardContract.connect(wallets[1]).removeAddress(wallets[2].address, 1)
    //         ).to.be.rejectedWith("Only owner can call this function");
    //       });
    //     });

    //     //============================================================================================================
    //     // Claim Reward

    //     describe("Claim Reward", function () {
    //       it("Should allow eligible user to claim reward", async function () {
    //         const addrRewardContract = await rewardContract.getAddress();

    //         await rewardTokenContract.transfer(addrRewardContract, total);
    //         await rewardContract.addCriterial([wallets[1].address], unitReward);
    //         await rewardContract.connect(wallets[1]).claimReward(1);

    //         const balanceOfWallet1 = await rewardTokenContract.balanceOf(
    //           wallets[1].address
    //         );

    //         expect(balanceOfWallet1).to.equal(unitReward);
    //       });

    //       it("Should allow 200 eligible users to claim reward", async function () {
    //         const addrRewardContract = await rewardContract.getAddress();

    //         await rewardTokenContract.transfer(addrRewardContract, total);

    //         const claims: string[] = [];
    //         const signers = await ethers.getSigners();
    //         const eligibleAddresses = signers.slice(0, 200);
    //         const addresses: string[] = [];

    //         for (let i = 0; i < 200; i++) {
    //           addresses.push(eligibleAddresses[i].address);
    //         }
    //         await Promise.all(addresses);
    //         await rewardContract.addCriterial(addresses, unitReward);
    //         for (let i = 0; i < 200; i++) {
    //           claims.push(
    //             rewardContract.connect(eligibleAddresses[i]).claimReward(1)
    //           );
    //         }

    //         await Promise.all(claims);

    //         for (let i = 0; i < 200; i++) {
    //           const balanceOfAddress = await rewardTokenContract.balanceOf(
    //             eligibleAddresses[i].address
    //           );
    //           expect(balanceOfAddress).to.equal(unitReward);
    //         }
    //       });

    //       it("Should emit ClaimMade event", async function () {
    //         const addrRewardContract = await rewardContract.getAddress();

    //         await rewardTokenContract.transfer(addrRewardContract, total);

    //         const claims: string[] = [];
    //         const signers = await ethers.getSigners();
    //         const eligibleAddresses = signers.slice(0, 200);
    //         const addresses: string[] = [];

    //         for (let i = 0; i < 200; i++) {
    //           addresses.push(eligibleAddresses[i].address);
    //         }

    //         await Promise.all(addresses);
    //         await rewardContract.addCriterial(addresses, unitReward);

    //         for (let i = 0; i < 200; i++) {
    //           claims.push(
    //             rewardContract.connect(eligibleAddresses[i]).claimReward(1)
    //           );
    //         }

    //         await Promise.all(claims);

    //         for (let i = 0; i < 200; i++) {
    //           const balanceOfAddress = await rewardTokenContract.balanceOf(
    //             eligibleAddresses[i].address
    //           );

    //           expect(balanceOfAddress)
    //             .to.emit(rewardContract, "ClaimMade")
    //             .withArgs(eligibleAddresses[i].address, 1, unitReward);
    //         }
    //       });

    //       it("Should revert if user is not eligible", async function () {
    //         const addrRewardContract = await rewardContract.getAddress();

    //         await rewardTokenContract.transfer(addrRewardContract, total);

    //         await expect(
    //           rewardContract.connect(wallets[1]).claimReward(1)
    //         ).to.be.rejectedWith("Criterial does not exist");
    //       });

    //       it("Should revert if reward already claimed", async function () {
    //         // Transfer tokens to the reward contract
    //         const addrRewardContract = await rewardContract.getAddress();

    //         await rewardTokenContract.transfer(addrRewardContract, total);
    //         await rewardContract.addCriterial([wallets[1].address], unitReward);
    //         await rewardContract.connect(wallets[1]).claimReward(1);

    //         await expect(
    //           rewardContract.connect(wallets[1]).claimReward(1)
    //         ).to.be.rejectedWith("Reward already claimed");
    //       });

    //       it("Should revert if contract doesn't have enough balance", async function () {
    //         await rewardContract.addCriterial([wallets[1].address], unitReward);

    //         await expect(
    //           rewardContract.connect(wallets[1]).claimReward(1)
    //         ).to.be.rejectedWith("Not enough balance");
    //       });
    //     });

    //     //============================================================================================================
    //     // isEligible

    //     describe("isEligible", function () {
    //       it("Should return true if Address Eligible", async function () {
    //         await rewardContract.addCriterial([wallets[1].address], unitReward);

    //         expect(await rewardContract.isEligible(wallets[1].address, 1)).to.be.equal(
    //           true
    //         );
    //       });

    //       it("Should return false if Address not Eligible", async function () {
    //         await rewardContract.addCriterial([wallets[1].address], unitReward);

    //         expect(await rewardContract.isEligible(wallets[2].address, 1)).to.be.equal(
    //           false
    //         );
    //       });

    //       it("Should revert if Criterial does not exist to check isEligible", async function () {
    //         await rewardContract.addCriterial([wallets[1].address], unitReward);

    //         await expect(
    //           rewardContract.isEligible(wallets[1].address, 2)
    //         ).to.be.rejectedWith("Criterial does not exist");
    //       });
    //     });

    //     //============================================================================================================
    //     // userClaimed

    //     describe("Check userClaimed", function () {
    //       it("Should return true if user claimed reward", async function () {
    //         const addrRewardContract = await rewardContract.getAddress();

    //         await rewardTokenContract.transfer(addrRewardContract, total);

    //         await rewardContract.addCriterial([wallets[1].address], unitReward);
    //         await rewardContract.connect(wallets[1]).claimReward(1);

    //         expect(await rewardContract.userClaimed(wallets[1].address, 1)).to.be.equal(
    //           true
    //         );
    //       });

    //       it("Should return false if user not claim reward yet", async function () {
    //         const addrRewardContract = await rewardContract.getAddress();

    //         await rewardTokenContract.transfer(addrRewardContract, total);

    //         await rewardContract.addCriterial([wallets[1].address], unitReward);

    //         expect(await rewardContract.userClaimed(wallets[1].address, 1)).to.be.equal(
    //           false
    //         );
    //       });

    //       it("Should revert if Address Not eligible for reward to check userClaimed", async function () {
    //         const addrRewardContract = await rewardContract.getAddress();

    //         await rewardTokenContract.transfer(addrRewardContract, total);

    //         await rewardContract.addCriterial([wallets[1].address], unitReward);
    //         await rewardContract.connect(wallets[1]).claimReward(1);

    //         await expect(
    //           rewardContract.userClaimed(wallets[2].address, 1)
    //         ).to.be.rejectedWith("Not eligible for reward");
    //       });

    //       it("Should revert if Criterial does not exist to check userClaimed", async function () {
    //         const addrRewardContract = await rewardContract.getAddress();

    //         await rewardTokenContract.transfer(addrRewardContract, total);

    //         await rewardContract.addCriterial([wallets[1].address], unitReward);
    //         await rewardContract.connect(wallets[1]).claimReward(1);

    //         await expect(
    //           rewardContract.userClaimed(wallets[1].address, 2)
    //         ).to.be.rejectedWith("Criterial does not exist");
    //       });
    //     });

    //     //============================================================================================================
    //     // getEligibleCriteriaCount

    //     describe("getEligibleCriteriaCount", function () {
    //       it("Should Check Eligible Criteria Count", async function () {
    //         await rewardContract.addCriterial(
    //           [wallets[1].address, wallets[2].address],
    //           unitReward
    //         );
    //         await rewardContract.addCriterial([wallets[1].address], unitReward);

    //         expect(
    //           await rewardContract.getEligibleCriteriaCount(wallets[1].address)
    //         ).to.be.equal(2);
    //         expect(
    //           await rewardContract.getEligibleCriteriaCount(wallets[2].address)
    //         ).to.be.equal(1);
    //       });

    //       it("Should return 0 if Address not eligible for reward", async function () {
    //         await rewardContract.addCriterial([wallets[1].address], unitReward);

    //         expect(
    //           await rewardContract.getEligibleCriteriaCount(wallets[2].address)
    //         ).to.be.equal(0);
    //       });
    //     });

    //     // ============================================================================================================
    //     // getCriterial

    //     describe("getCriterial", function () {
    //       it("Should return eligible addresses and unit reward for an existing criterial", async function () {
    //         await rewardContract.addCriterial([wallets[1].address, wallets[2].address], 100);

    //         const [addresses, unitReward] = await rewardContract.getCriterial(1);

    //         expect(addresses.length).to.equal(2);
    //         expect(unitReward).to.equal(100);

    //         expect(addresses[0]).to.equal(wallets[1].address);
    //         expect(addresses[1]).to.equal(wallets[2].address);
    //       });

    //       it("Should revert if trying to get non-existing criterial", async function () {
    //         await expect(rewardContract.getCriterial(1)).to.be.rejectedWith(
    //           "Criterial does not exist"
    //         );
    //       });
    //     });
  });
});
