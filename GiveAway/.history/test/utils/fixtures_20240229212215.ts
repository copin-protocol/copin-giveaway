import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
// async function v3CoreFactoryFixture([wallet]) {
//   return await waffle.deployContract(wallet, {
//     bytecode: FACTORY_BYTECODE,
//     abi: FACTORY_ABI,
//   });
// }

export async function completeFixture([wallet]: SignerWithAddress[]) {
  const RewardTokenContract = await ethers.getContractFactory("RewardToken");
  const RewardContract = await ethers.getContractFactory("GiveAway");

  const rewardToken = await RewardTokenContract.deploy();
  const rewardContract = await RewardContract.deploy(addr_RewardToken);
  const total = await rewardToken.totalSupply();

  const collection = await Collection.deploy(
    wallet.address,
    wallet.address,

  );

  return {
    collection,
  };
}