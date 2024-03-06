import "@nomiclabs/hardhat-ethers";
import {ethers} from "hardhat";
// async function v3CoreFactoryFixture([wallet]) {
//   return await waffle.deployContract(wallet, {
//     bytecode: FACTORY_BYTECODE,
//     abi: FACTORY_ABI,
//   });
// }

export async function completeFixture() {
  const RewardTokenContract = await ethers.getContractFactory(
    "RewardToken"
  );
  const RewardContract = await ethers.getContractFactory("GiveAway");

  const rewardTokenContract = await RewardTokenContract.deploy();
  const addr_RewardToken = await rewardTokenContract.getAddress();
  const rewardContract = await RewardContract.deploy(addr_RewardToken);
  const addr_RewardContract = await rewardContract.getAddress();
  
  const total = await rewardTokenContract.totalSupply();
  await rewardTokenContract.transfer(addr_RewardContract, total);
  return {
    rewardContract,
    rewardTokenContract,
    total,
  };
}
