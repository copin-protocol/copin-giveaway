import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
// import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers

import "dotenv/config";
module.exports = {
  solidity: "0.8.24",
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPrice: 35,
  },
  networks: {
    OPsepolia: {
      url: `https://optimism-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    hardhat: {
      blockGasLimit: 20000000,
      accounts: {
        count: 1000,
      },
    },
  },
  etherscan: {
    apiKey: process.env.OP_ETHERSCAN_API,
    customChains: [
      {
        network: "OPsepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
          browserURL: "https://sepolia.optimism.io",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
    apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
    browserURL: "https://sepolia.optimism.io",
  },
  mocha: {
    timeout: 20000000,
  },
};
