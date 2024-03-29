import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
// async function v3CoreFactoryFixture([wallet]) {
//   return await waffle.deployContract(wallet, {
//     bytecode: FACTORY_BYTECODE,
//     abi: FACTORY_ABI,
//   });
// }

export async function completeFixture([wallet]: SignerWithAddress[]) {
  const Collection = await ethers.getContractFactory("RewardToken");
  
  const collection = await Collection.deploy(
    wallet.address,
    wallet.address,
    "https://api.copin.io/nft-subscriptions/metadata/"
  );

  return {
    collection,
  };
}