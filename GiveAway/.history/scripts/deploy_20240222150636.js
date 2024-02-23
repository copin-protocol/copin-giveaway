const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  const rewardTokenContract = await ethers.deployContract("RewardToken");
  const addr_RewardToken = await rewardTokenContract.getAddress();
  const rewardContract = await ethers.deployContract("Reward",[addr_RewardToken]);
  console.log("Address RewardC" await rewardContract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });