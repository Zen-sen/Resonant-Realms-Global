require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-network-helpers");

const config = {
  solidity: "0.8.20",
  mocha: {
    timeout: 60000,
  },
};

module.exports = config;
