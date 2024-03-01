import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

// async function v3CoreFactoryFixture([wallet]) {
//   return await waffle.deployContract(wallet, {
//     bytecode: FACTORY_BYTECODE,
//     abi: FACTORY_ABI,
//   });
// }

export async function completeFixture() {
  const RewardTokenContract = await ethers.getContractFactory("RewardToken");
  const RewardContract = await ethers.getContractFactory("GiveAway");

  const rewardTokenContract = await RewardTokenContract.deploy();
  const addr_RewardToken = await rewardTokenContract.getAddress();
  const rewardContract = await RewardContract.deploy(addr_RewardToken);
  
  const total = await rewardTokenContract.totalSupply();

  return {
    rewardContract,
    rewardTokenContract,
    total,
  };
}