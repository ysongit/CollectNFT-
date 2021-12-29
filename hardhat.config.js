require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.6.12",
  defaultNetwork: "hardhat",
  networks: {
    // npx hardhat run scripts/sample-script.js --network mumbai
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMYAPI_KEY}`,
      accounts: [process.env.PRIVATEKEY],
      chainId: 80001,
      gasPrice: 8000000000
    },
    // npx hardhat run scripts/sample-script.js --network rinkeby
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMYAPI_KEY2}`,
      accounts: [process.env.PRIVATEKEY],
      chainId: 4,
      gasPrice: 8000000000
    },
    // npx hardhat run scripts/sample-script.js --network bsctestnet
    bsctestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: [process.env.PRIVATEKEY],
      chainId: 97,
      gasPrice: 20000000000,
    },
    // npx hardhat run scripts/metis-script.js --network metis
    metis: {
      url: "https://stardust.metis.io/?owner=588",
      accounts: [process.env.PRIVATEKEY],
    },
  },
};
