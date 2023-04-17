require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

const mnemonic = process.env.MNEMONIC_PHRASE;
const apiKey = process.env.INFURA_API_KEY;

// Import ABIs
const mainnetTokenABI = require("./build/contracts/ABITokenMainnet.json");
const sepoliaTokenABI = require("./build/contracts/ABITokenSepolia.json");

const sepoliaTokenAddress = "0x11d41428173f7be020198788f0ed29818a4dac96";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    sepolia: {
      provider: () => new HDWalletProvider({
        mnemonic: process.env.MNEMONIC_PHRASE,
        providerOrUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      }),
      network_id: 11155111,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    mainnet: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: process.env.MNEMONIC_PHRASE,
          },
          providerOrUrl: `https://mainnet.infura.io/v3/${apiKey}`,
        }),
      network_id: 1,
      gasPrice: 23000000000, // 23 Gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },

  sepoliaTokenAddress: sepoliaTokenAddress,

  mocha: {
  },

  compilers: {
    solc: {
      version: "0.8.19",
    }
  },

  // Custom function to get the appropriate ABI based on the network
  getABI: function(network) {
    if (network === 'mainnet') {
      return mainnetTokenABI;
    } else if (network === 'sepolia') {
      return sepoliaTokenABI;
    } else {
      throw new Error('Unsupported network');
    }
  },
};
