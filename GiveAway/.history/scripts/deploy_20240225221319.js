const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  const rewardTokenContract = await ethers.deployContract("RewardToken");
  const rewardContract = await ethers.deployContract("GiveAway", [await rewardTokenContract.getAddress()]);
  const rewardContract = await ethers.deployContract("GiveAway",[await rewardTokenContract.getAddress()]);
  
  // await rewardTokenContract.transfer(await rewardContract.getAddress(), await rewardTokenContract.totalSupply());
  console.log("Address Reward Contract :" ,await rewardContract.getAddress());
  console.log("Address RewardToken Contract :" ,await rewardTokenContract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });