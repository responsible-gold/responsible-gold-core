import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import os from "os";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "hardhat/config";
import "solidity-coverage";
import "./scripts/HardhatDeploymentTask.ts";
import "./scripts/MintTokensHardhatTask.ts";
import "./scripts/ExternalSignerServerHardhatTasks.ts";
import "./scripts/HardhatDeploymentTask.ts";
import "solidity-docgen";
const config: HardhatUserConfig = {
  networks: {
    polygonPOS: {
      url: process.env.POLYGON_POS_RPC_HTTP_URL || "",
      gas: "auto",
      gasPrice: "auto",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_HTTP_URL || "",
      gas: "auto",
      gasPrice: "auto",
    },
    dev: {
      url: "http://127.0.0.1:8545/",
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      blockGasLimit: 30_000_000,
    },
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: false,
      mining: {
        auto: true,
        interval: 5000,
      },
      blockGasLimit: 1000000000,
      accounts: [
        {
          // address: 0x546F99F244b7B58B855330AE0E2BC1b30b41302F
          privateKey:
            "0x6aea45ee1273170fb525da34015e4f20ba39fe792f486ba74020bcacc9badfc1",
          balance: "1500000000000000000000000000000", //  1500000000000 eth
        },
        {
          // address: 0x9AC1c9afBAec85278679fF75Ef109217f26b1417
          privateKey:
            "0x8de84c4eb40a9d32804ebc4005075eed5d64efc92ba26b6ec04d399f5a9b7bd1",
          balance: "10000000000000000000000", // 10000 eth
        },
        {
          // address: 0x615695C4a4D6a60830e5fca4901FbA099DF26271
          privateKey:
            "0x65a81057728efda8858d5d53094a093203d35cb7437d16f7635594788517bdd2",
          balance: "10000000000000000000000", // 10000 eth
        },
        {
          // address: 0x63a6627b79813A7A43829490C4cE409254f64177
          privateKey:
            "0xd599743b90304946278b39c8d51b240c0bde4c6603fe47b2b6b131509feca7fc",
          balance: "10000000000000000000000", // 10000 eth
        },
        {
          // address: 0x16564cF3e880d9F5d09909F51b922941EbBbC24d
          privateKey:
            "0xa7b4595b0697fcae35046b6d532d17d2f134c9c5e9a5d202ae4b7c83fa85399e",
          balance: "10000000000000000000000", // 10000 eth
        },
        {
          // address: 0xde2328CE51AaB2087Bc60b46E00F4cE587C7a8A9
          privateKey:
            "0x7253354503676cad1165425f4a528369991ca6931afe88d3e82c2edfdbef64f7",
          balance: "10000000000000000000000", // 10000 eth
        },
        {
          // address: 0x44A9cE0Afd70ccAE70b8Ab5b6772E5ed8D695Ea7
          privateKey:
            "0x32a7f91d96f1f2f9926e0e4ec3d6af78b54d679509853125a7d0259be438b41a",
          balance: "10000000000000000000000", // 10000 eth
        },
        {
          // address: 0x7fAE97e8EF6abC96456b60BD6E97523e4C6Fc9A2
          privateKey:
            "0x99e883ac5e9135559842aac297319914fb89efc066975b69bffe82697d10fd9b",
          balance: "10000000000000000000000", // 10000 eth
        },
        {
          // address: 0x23EA3Bad9115d436190851cF4C49C1032fA7579A
          privateKey:
            "0xbc676d5eb82c6356ac53d46124fa01755cb6268b6a5ad51a648d69f9411c3257",
          balance: "10000000000000000000000", // 10000 eth
        },
        {
          // address: 0x33d0141B5647D554c5481204473fd81850F2970d
          privateKey:
            "0x009ab9b374ada80e33c4efcf5a16ed4235b327d5319532ff8cf39024e36cf9b9",
          balance: "10000000000000000000000", // 10000 eth
        },
        {
          // address: 0xebA70dc631eA59a2201Ee0B3213DCa1549fFAB48
          privateKey:
            "0x264d19b082060f127bdcf6bdee7db0244c4b5a762f686d0fc865bb6e64b3e743",
          balance: "10000000000000000000000", // 10000 eth
        },
        {
          // address: 0x26D3D8Ab74D62C26f1ACc220dA1646411c9880Ac
          privateKey:
            "0xc62fd5e127b007a90478de7259b20b0281d20e8c8aa713bdbf819337cf8712df",
          balance: "10000000000000000000000", // 10000 eth
        },
        {
          // address: 0x18be4d5d73995fe29149f7ab48c614ddedc7a2fa
          privateKey:
            "0xff030000000000000000000000000000000000000000000000000000000000ff",
          balance: "10000000000000000000000", // 10000 eth
        },
      ],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.23",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 2200000,
    jobs: os.cpus().length / 2 > 1 ? os.cpus().length / 2 : 1,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
    strict: true,
  },
  gasReporter: {
    currency: "ETH",
    gasPrice: 1000000,
    excludeContracts: ["*.t.sol"],
    enabled: true, // : false
  },
  docgen: {},
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
