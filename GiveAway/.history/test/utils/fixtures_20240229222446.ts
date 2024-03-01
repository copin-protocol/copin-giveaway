import  hre  from "hardhat";
import '@nomiclabs/hardhat-ethers'
// async function v3CoreFactoryFixture([wallet]) {
//   return await waffle.deployContract(wallet, {
//     bytecode: FACTORY_BYTECODE,
//     abi: FACTORY_ABI,
//   });
// }

export async function completeFixture() {
  const RewardTokenContract = await hre.ethers.getContractFactory("RewardToken");
  const RewardContract = await hre.ethers.getContractFactory("GiveAway");

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
