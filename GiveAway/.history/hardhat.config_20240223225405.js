require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPrice : 35
  },
  networks: {
    OPsepolia: {
      url: `https://optimism-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    hardhat: {
      blockGasLimit: 20000000,
      accounts: {
        count: 1000
    }
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API
  },
  mocha: {
    timeout: 20000000
  }
};
