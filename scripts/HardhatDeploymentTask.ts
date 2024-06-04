import { task, types } from "hardhat/config";
import {
  DeploymentUtils,
  getERC20FeePercentInteger,
  getGasPrices,
} from "./DeploymentUtils";
import { expect } from "chai";
import fs from "fs";
import { SignerUtil } from "./SignerUtil";
import { getEnvVar } from "./Config";
import { ethers } from "hardhat";
import { TransactionReceipt } from "ethers";
import { UNIT_ONE_FEES } from "./Constants";
type Ethers = typeof import("hardhat").ethers;
task("test-deploy", "Deploy ERC20 factory").setAction(async (args, hre) => {});

task("test-deploy2", "Deploy ERC20 factory").setAction(async (args, hre) => {
  const signers = await hre.ethers.getSigners();
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  console.log(chainId);
  //   const proxyData = await deployUUPSContract("MockUUPSLogic", [], [], signers[0].address, chainId, hre.ethers);
  //     const mockUUPS = await hre.ethers.getContractAt(
  //       "MockUUPSLogic",
  //       proxyData.proxyAddress
});

task(
  "deploy-factories",
  "deploys the rgFactory, ERC20Factory, and ERC721Factory"
)
  .addOptionalParam("erc721FactoryOwner", "the owner of the erc721Factory")
  .addFlag("test", "deploy to hardhat test network")
  .addOptionalParam("deployerAddress", "the address to send transactions from")
  .addOptionalParam("rgFactoryOwner", "the owner of the rgFactory")
  .addOptionalParam("erc20FactoryOwner", "the owner of the erc20Factory")
  .addOptionalParam(
    "signerEnvironment",
    "the environment of the signer, local, staging, or prod"
  )
  .setAction(async (args, hre) => {
    const deployer = new DeploymentUtils(
      args.test,
      hre.ethers,
      undefined,
      false,
      args.signerEnvironment,
      args.deployerAddress
    );
    await deployer.init();
    let rgFactoryOwner: string;
    let erc20FactoryOwner: string;
    let erc721FactoryOwner: string;
    // require deployer, rgFactoryOwner, erc20FactoryOwner, erc721FactoryOwner addresses to be defined if test
    if (args.test) {
      if (args.deployerAddress === undefined) {
        throw new Error("deployerAddress is required");
      }
      if (args.rgFactoryOwner === undefined) {
        throw new Error("rgFactoryOwner is required");
      }
      if (args.erc20FactoryOwner === undefined) {
        throw new Error("erc20FactoryOwner is required");
      }
      if (args.erc721FactoryOwner === undefined) {
        throw new Error("erc721FactoryOwner is required");
      }
      rgFactoryOwner = args.rgFactoryOwner;
      erc20FactoryOwner = args.erc20FactoryOwner;
      erc721FactoryOwner = args.erc721FactoryOwner;
    } else {
      // get the admin address from signer server
      const mainDeployer = await deployer.signer.getKeyAddressFromAlias(
        "main-deployer"
      );
      rgFactoryOwner = mainDeployer;
      erc20FactoryOwner = mainDeployer;
      erc721FactoryOwner = mainDeployer;
    }
    const factoryDeploymentData = await deployer.deployFactories(
      rgFactoryOwner,
      erc20FactoryOwner,
      erc721FactoryOwner
    );
    // write the logic, and proxy address for each factory to a json file
    // get the chain id from the network
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    const outputData = JSON.stringify(factoryDeploymentData, null, 2);
    fs.appendFileSync(`factoryDeploymentData${chainId}.json`, outputData);
    const expectedInitializedState = {
      rgFactory: {
        owner: rgFactoryOwner,
      },
      erc20Factory: {
        owner: erc20FactoryOwner,
        rgFactory: factoryDeploymentData.rgFactory.proxyAddress.toLowerCase(),
      },
      erc721Factory: {
        owner: erc721FactoryOwner,
        rgFactory: factoryDeploymentData.rgFactory.proxyAddress.toLowerCase(),
      },
    };
    const rgFactory = await hre.ethers.getContractAt(
      "RGFactory",
      factoryDeploymentData.rgFactory.proxyAddress
    );
    const erc20Factory = await hre.ethers.getContractAt(
      "ERC20Factory",
      factoryDeploymentData.erc20Factory.proxyAddress
    );
    const erc721Factory = await hre.ethers.getContractAt(
      "ERC721Factory",
      factoryDeploymentData.erc721Factory.proxyAddress
    );
    const actualInitializedState = {
      rgFactory: {
        owner: (await rgFactory.owner()).toLowerCase(),
      },
      erc20Factory: {
        owner: (await erc20Factory.owner()).toLowerCase(),
        rgFactory: (await erc20Factory.rgFactory()).toLowerCase(),
      },
      erc721Factory: {
        owner: (await erc721Factory.owner()).toLowerCase(),
        rgFactory: (await erc721Factory.rgFactory()).toLowerCase(),
      },
    };

    expect(actualInitializedState).to.deep.equal(expectedInitializedState);
    console.log(
      `deployed all factories with ${factoryDeploymentData.gasUsed} gas`
    );
  });

task(
  "deploy-gcoin-contracts",
  "Deploys the assetNFT and genericToken contracts"
)
  .addParam("rgFactoryAddress", "the address of the rgFactory")
  .addParam(
    "assetGovernor",
    "the asset governor this address must be a multisig account on prod"
  )
  .addParam("erc721TokenName", "the name of the erc721 token")
  .addParam("erc721TokenSymbol", "the symbol of the erc721 token")
  .addParam("erc721BaseTokenUri", "the baseURI of the erc721 token")
  .addParam("erc20Name", "the name of the erc20 token")
  .addParam("erc20Symbol", "the symbol of the erc20 token")
  .addParam("erc20Decimals", "the decimals of the erc20 token")
  .addParam(
    "erc20FeePercentage",
    "the fee percentage of the erc20 token as a float, 0.001%",
    undefined,
    types.float
  )
  .addFlag("test", "deploy to hardhat test network")
  .addOptionalParam(
    "signerEnvironment",
    "the environment of the signer, local, staging, or prod"
  )
  .addOptionalParam("deployerAddress", "the address to send transactions from")
  .addOptionalParam("erc20Admin", "the admin of the erc20 contract")
  .addOptionalParam(
    "erc20FeeCollector",
    "the feeCollector of the erc20 contract"
  )
  .addOptionalParam("erc721Admin", "the admin of the erc721 contract")
  .addOptionalParam("erc721Burner", "the burner of the erc721 contract")
  .addOptionalParam("erc721Minter", "the minter of the erc721 contract")
  .addOptionalParam(
    "erc721MetadataOperator",
    "the address of the metadata operator"
  )
  .addOptionalParam(
    "erc20TransferHook",
    "the address of the erc20 transfer hook"
  )
  .addOptionalParam("erc20MintHook", "the address of the erc20 mint hook")
  .addOptionalParam("erc20BurnHook", "the address of the erc20 burn hook")
  .setAction(async (args, hre) => {
    // filter inputs
    const erc20TransferHook =
      args.erc20TransferHook === undefined
        ? hre.ethers.ZeroAddress
        : args.erc20TransferHook;
    const erc20MintHook =
      args.erc20MintHook === undefined
        ? hre.ethers.ZeroAddress
        : args.erc20MintHook;
    const erc20BurnHook =
      args.erc20BurnHook === undefined
        ? hre.ethers.ZeroAddress
        : args.erc20BurnHook;
    const test: boolean = args.test ? args.test : false;
    // convert percentage to decimal value
    const erc20Fee = getERC20FeePercentInteger(args.erc20FeePercentage);

    if (
      args.assetGovernor === undefined ||
      args.assetGovernor === "" ||
      args.assetGovernor === hre.ethers.ZeroAddress
    ) {
      throw new Error("assetGovernor is required");
    }

    const deployer = new DeploymentUtils(
      test,
      hre.ethers,
      args.rgFactoryAddress,
      false,
      args.signerEnvironment,
      args.deployerAddress
    );
    await deployer.init();
    let deployerAddress: string;
    let adminAddress: string;
    let nftBurnerAddress: string;
    let nftMinterAddress: string;
    let nftMetadataOperatorAddress: string;
    let erc20FeeCollectorAddress: string;
    if (args.test) {
      if (args.deployerAddress === undefined) {
        throw new Error("deployerAddress is required");
      }
      if (args.erc20Admin === undefined) {
        throw new Error("erc20Admin is required");
      }
      if (args.erc721Admin === undefined) {
        throw new Error("erc721Admin is required");
      }
      if (args.erc721Burner === undefined) {
        throw new Error("erc721Burner is required");
      }
      if (args.erc721Minter === undefined) {
        throw new Error("erc721Minter is required");
      }
      if (args.erc721MetadataOperator === undefined) {
        throw new Error("erc721MetadataOperator is required");
      }
      if (args.erc20FeeCollector === undefined) {
        throw new Error("erc20FeeCollector is required");
      }
      deployerAddress = args.deployerAddress;
      adminAddress = args.erc20Admin;
      nftBurnerAddress = args.erc721Burner;
      nftMinterAddress = args.erc721Minter;
      nftMetadataOperatorAddress = args.erc721MetadataOperator;
      erc20FeeCollectorAddress = args.erc20FeeCollector;
    } else {
      // get the deployer address from the signer server
      deployerAddress = await deployer.signer.getKeyAddressFromAlias(
        "main-deployer"
      );
      adminAddress = await deployer.signer.getKeyAddressFromAlias(
        "responsible-gold-admin"
      );
      nftMinterAddress = await deployer.signer.getKeyAddressFromAlias(
        "responsible-gold-asset-nft-burner"
      );
      nftBurnerAddress = await deployer.signer.getKeyAddressFromAlias(
        "responsible-gold-asset-nft-burner"
      );
      nftMetadataOperatorAddress = await deployer.signer.getKeyAddressFromAlias(
        "responsible-gold-metadata-operator"
      );
      erc20FeeCollectorAddress = await deployer.signer.getKeyAddressFromAlias(
        "g-coin-fee-collector"
      );
    }

    const tokens = await deployer.deployGcoinContracts(
      adminAddress,
      args.assetGovernor,
      nftMinterAddress,
      nftBurnerAddress,
      nftMetadataOperatorAddress,
      args.erc721BaseTokenUri,
      erc20FeeCollectorAddress,
      args.erc721TokenName,
      args.erc721TokenSymbol,
      adminAddress,
      args.assetGovernor,
      args.erc20Name,
      args.erc20Symbol,
      args.erc20Decimals,
      erc20Fee,
      erc20TransferHook,
      erc20MintHook,
      erc20BurnHook
    );

    // write the output to a json file
    const deploymentData = {
      erc20TokenAddress: {
        tokenName: args.erc20Name,
        address: await tokens.erc20Token.erc20.getAddress(),
      },
      assetNFT: {
        tokenName: args.erc721TokenName,
        address: await tokens.assetNFT.assetNFT.getAddress(),
      },
    };
    const outputData = JSON.stringify(deploymentData, null, 2);
    const networkID = (await hre.ethers.provider.getNetwork()).chainId;
    fs.appendFileSync(
      "gcoinDeploymentData" + networkID.toString() + ".json",
      outputData
    );
    // check if the tokens are initialized correctly
    const actualInitializedState = {
      erc20Token: {
        admin: (
          await tokens.erc20Token.erc20.getRoleMember(
            await tokens.erc20Token.erc20.DEFAULT_ADMIN_ROLE()
          )
        ).toLowerCase(),
        assetGovernor: (
          await tokens.erc20Token.erc20.getRoleMember(
            await tokens.erc20Token.erc20.ASSET_GOVERNOR_ROLE()
          )
        ).toLowerCase(),
        name: await tokens.erc20Token.erc20.name(),
        symbol: await tokens.erc20Token.erc20.symbol(),
        decimals: Number(await tokens.erc20Token.erc20.decimals()),
        feeCollector: (
          await tokens.erc20Token.erc20.feeCollector()
        ).toLowerCase(),
        assetNFT: (await tokens.erc20Token.erc20.assetNFT()).toLowerCase(),
        mintHook: (await tokens.erc20Token.erc20.mintHook()).toLowerCase(),
        burnHook: (await tokens.erc20Token.erc20.burnHook()).toLowerCase(),
        transferHook: (
          await tokens.erc20Token.erc20.transferHook()
        ).toLowerCase(),
        assetNFTAddress: (
          await tokens.erc20Token.erc20.assetNFT()
        ).toLowerCase(),
      },
      assetNFT: {
        minter: (
          await tokens.assetNFT.assetNFT.getRoleMember(
            await tokens.assetNFT.assetNFT.MINTER_ROLE()
          )
        ).toLowerCase(),
        admin: (
          await tokens.assetNFT.assetNFT.getRoleMember(
            await tokens.assetNFT.assetNFT.DEFAULT_ADMIN_ROLE()
          )
        ).toLowerCase(),
        assetGovernor: (
          await tokens.assetNFT.assetNFT.getRoleMember(
            await tokens.assetNFT.assetNFT.ASSET_GOVERNOR_ROLE()
          )
        ).toLowerCase(),
        burner: (
          await tokens.assetNFT.assetNFT.getRoleMember(
            await tokens.assetNFT.assetNFT.BURNER_ROLE()
          )
        ).toLowerCase(),
        metadataOperator: await tokens.assetNFT.assetNFT.getRoleMember(
          await tokens.assetNFT.assetNFT.META_DATA_OPERATOR_ROLE()
        ),
        baseTokenURI: await tokens.assetNFT.assetNFT.baseURI(),
        erc20Address: (
          await tokens.assetNFT.assetNFT.erc20TokenAddress()
        ).toLowerCase(),
      },
    };

    const expectedInitializedState = {
      erc20Token: {
        admin: adminAddress.toLowerCase(),
        assetGovernor: args.assetGovernor.toLowerCase(),
        name: args.erc20Name,
        symbol: args.erc20Symbol,
        decimals: args.erc20Decimals,
        feeCollector: erc20FeeCollectorAddress.toLowerCase(),
        assetNFT: (await tokens.assetNFT.assetNFT.getAddress()).toLowerCase(),
        mintHook: erc20MintHook.toLowerCase(),
        burnHook: erc20BurnHook.toLowerCase(),
        transferHook: erc20TransferHook.toLowerCase(),
        assetNFTAddress: await tokens.assetNFT.assetNFT.getAddress(),
      },
      assetNFT: {
        minter: nftMinterAddress.toLowerCase(),
        admin: adminAddress.toLowerCase(),
        assetGovernor: args.assetGovernor.toLowerCase(),
        burner: nftBurnerAddress.toLowerCase(),
        metadataOperator: nftMetadataOperatorAddress.toLowerCase(),
        baseTokenURI: args.erc721BaseTokenUri,
        erc20Address: await tokens.erc20Token.erc20.getAddress(),
      },
    };
    expect(actualInitializedState).to.deep.equal(expectedInitializedState);
    const totalGasUsed =
      tokens.erc20Token.receipt.gasUsed + tokens.assetNFT.receipt.gasUsed;
    console.log(`deployed all gcoin contracts with ${totalGasUsed} gas`);
    // log the addresses of the deployed contracts
    console.log(
      `ERC20 Token Address: ${deploymentData.erc20TokenAddress.address}`
    );
    // log the actual initialized state of the erc20 token
    console.log(
      `ERC20 Token Admin: ${actualInitializedState.erc20Token.admin}`
    );
    console.log(
      `ERC20 Token AssetGovernor: ${actualInitializedState.erc20Token.assetGovernor}`
    );
    console.log(`ERC20 Token Name: ${actualInitializedState.erc20Token.name}`);
    console.log(
      `ERC20 Token Symbol: ${actualInitializedState.erc20Token.symbol}`
    );
    console.log(
      `ERC20 Token Decimals: ${actualInitializedState.erc20Token.decimals}`
    );
    console.log(
      `ERC20 Token FeeCollector: ${actualInitializedState.erc20Token.feeCollector}`
    );
    console.log(
      "ERC20 Token AssetNFT: ",
      actualInitializedState.erc20Token.assetNFT
    );

    console.log(`AssetNFT Address: ${deploymentData.assetNFT.address}`);
    // log the actual initialized state of the assetNFT
    console.log(`AssetNFT Admin: ${actualInitializedState.assetNFT.admin}`);
    console.log(`AssetNFT Minter: ${actualInitializedState.assetNFT.minter}`);
    console.log(
      `AssetNFT AssetGovernor: ${actualInitializedState.assetNFT.assetGovernor}`
    );
    console.log(`AssetNFT Burner: ${actualInitializedState.assetNFT.burner}`);
    console.log(
      `AssetNFT MetadataOperator: ${actualInitializedState.assetNFT.metadataOperator}`
    );
    console.log(
      `AssetNFT BaseTokenURI: ${actualInitializedState.assetNFT.baseTokenURI}`
    );
  });

task(
  "transfer-funds",
  "Transfers funds from one address to another using the signing server"
)
  .addParam("from", "the address to send the funds from")
  .addParam("to", "the address to send the funds to")
  .addParam("value", "the value to send")
  .addParam(
    "signerEnvironment",
    "the environment of the signer, local, staging, or prod"
  )
  .setAction(async (args, hre) => {
    // get the signing server api url from environment variables
    const apiURL = getEnvVar(args.signerEnvironment, "SIGNER_API_ENDPOINT");
    // get the create api key from environment variables
    const createAPIKey = getEnvVar(
      args.signerEnvironment,
      "SIGNER_API_KEY_DEPLOYER"
    );

    // create a isntance of the signer util
    const signer = new SignerUtil(apiURL, createAPIKey, false, hre.ethers);
    const value = hre.ethers.parseEther(args.value);
    // send the transaction
    const tx = await signer.sendValue(args.to, args.from, value);
    const receipt = await tx.wait();
    if (receipt === null || receipt === undefined) {
      throw new Error("Transaction failed");
    }
    // log the transaction
    console.log(`sent ${args.value} ether from ${args.from} to ${args.to}`);
    // log the transaction hash
    console.log(`transaction hash: ${tx.hash}`);
    // log gas used by the transaction
    console.log(`gas used: ${receipt.gasUsed.toString()} gas`);
  });

task(
  "fund-contract-roles",
  "makes sure the contract roles are funded with ether"
)
  .addParam("assetGovernorAddress", "the address of the asset governor")
  .addOptionalParam(
    "assetGovernorCap",
    "the max amount of funds the asset governor can hold"
  )
  .addOptionalParam("deployerAddress", "the address to send transactions from")
  .addOptionalParam(
    "minterAddress",
    "the address of the assetNFT minter, only needed if in test mode, otherwise the minter address is fetched from the signer server"
  )
  .addOptionalParam("minterCap", "the max amount of funds the minter can hold")
  .addOptionalParam(
    "burnerAddress",
    "the address of the asset nft burner, only needed if in test mode, otherwise the burner address is fetched from the signer server"
  )
  .addOptionalParam("burnerCap", "the max amount of funds the burner can hold")
  .addOptionalParam(
    "adminAddress",
    "the address of the responsible gold admin, only needed if in test mode, otherwise the admin address is fetched from the signer server"
  )
  .addOptionalParam("adminCap", "the max amount of fund the admin can hold")
  .addOptionalParam(
    "feeCollectorAddress",
    "the address of the erc20 fee collector"
  )
  .addOptionalParam(
    "feeCollectorCap",
    "the max amount of funds the fee collector can hold"
  )
  .addOptionalParam(
    "metadataOperatorCap",
    "the max amount of funds the metadata operator can hold"
  )

  .addOptionalParam(
    "environment",
    "the signer environment to use for sending funds"
  )
  .addFlag("test", "deploy to hardhat test network")
  .setAction(async (args, hre) => {
    // get the signer api url from environment variables
    const apiURL = getEnvVar("local", "SIGNER_API_ENDPOINT");
    const createAPIKey = getEnvVar("local", "SIGNER_API_KEY_DEPLOYER");

    let signerUtil = new SignerUtil(
      apiURL,
      createAPIKey,
      args.test,
      hre.ethers
    );
    // get the main deployer address from the local signer server
    let mainDeployer: string;
    if (args.test) {
      if (args.deployerAddress === undefined) {
        throw new Error("deployerAddress is required in test mode");
      }
      mainDeployer = args.deployerAddress;
    } else {
      mainDeployer = await signerUtil.getKeyAddressFromAlias("main-deployer");
    }
    let totalGasUsed: bigint = BigInt(0);
    let receipt: TransactionReceipt | undefined;
    let minter: string;
    if (args.minterCap !== undefined) {
      if (args.test) {
        if (args.minterAddress === undefined) {
          throw new Error("minterAddress is required in test mode");
        }
        minter = args.minterAddress;
      } else {
        // get the minter address from the signer server
        minter = await signerUtil.getKeyAddressFromAlias(
          "responsible-gold-asset-nft-minter"
        );
      }
      const minterCap = hre.ethers.parseEther(args.minterCap);
      receipt = await topUpAccount(
        signerUtil,
        mainDeployer,
        minter,
        minterCap,
        hre.ethers
      );
      totalGasUsed =
        receipt === undefined ? totalGasUsed : totalGasUsed + receipt.gasUsed;
    }
    if (args.burnerCap !== undefined) {
      let burner: string;
      if (args.test) {
        if (args.burnerAddress === undefined) {
          throw new Error("burnerAddress is required in test mode");
        }
        burner = args.burnerAddress;
      } else {
        // get the burner address from the signer server
        burner = await signerUtil.getKeyAddressFromAlias(
          "responsible-gold-asset-nft-burner"
        );
      }
      const burnerCap = hre.ethers.parseEther(args.burnerCap);
      receipt = await topUpAccount(
        signerUtil,
        mainDeployer,
        burner,
        burnerCap,
        hre.ethers
      );
      totalGasUsed =
        receipt === undefined ? totalGasUsed : totalGasUsed + receipt.gasUsed;
    }
    if (args.adminCap !== undefined) {
      let admin: string;
      if (args.test) {
        if (args.adminAddress === undefined) {
          throw new Error("adminAddress is required in test mode");
        }
        admin = args.adminAddress;
      } else {
        // get the admin address from the signer server
        admin = await signerUtil.getKeyAddressFromAlias(
          "responsible-gold-admin"
        );
      }
      const adminCap = hre.ethers.parseEther(args.adminCap);
      receipt = await topUpAccount(
        signerUtil,
        mainDeployer,
        admin,
        adminCap,
        hre.ethers
      );

      totalGasUsed =
        receipt === undefined ? totalGasUsed : totalGasUsed + receipt.gasUsed;
    }
    // ensure the asset governor address is not zero address
    if (
      args.assetGovernorAddress === undefined ||
      args.assetGovernorAddress === "" ||
      args.assetGovernorAddress === hre.ethers.ZeroAddress
    ) {
      throw new Error("assetGovernorAddress is required");
    }
    if (args.assetGovernorCap !== undefined) {
      const assetGovernorCap = hre.ethers.parseEther(args.assetGovernorCap);
      receipt = await topUpAccount(
        signerUtil,
        args.assetGovernorAddress,
        mainDeployer,
        assetGovernorCap,
        hre.ethers
      );
    }
    if (args.feeCollectorCap !== undefined) {
      let feeCollector: string;
      if (args.test) {
        if (args.feeCollectorAddress === undefined) {
          throw new Error("feeCollectorAddress is required in test mode");
        }
        feeCollector = args.feeCollectorAddress;
      } else {
        // get the fee collector address from the signer server
        feeCollector = await signerUtil.getKeyAddressFromAlias(
          "g-coin-fee-collector"
        );
      }
      const feeCollectorCap = hre.ethers.parseEther(args.feeCollectorCap);
      receipt = await topUpAccount(
        signerUtil,
        mainDeployer,
        feeCollector,
        feeCollectorCap,
        hre.ethers
      );
    }

    if (args.metadataOperatorCap !== undefined) {
      let metadataOperator: string;
      if (args.test) {
        if (args.erc721MetadataOperator === undefined) {
          throw new Error("erc721MetadataOperator is required in test mode");
        }
        metadataOperator = args.erc721MetadataOperator;
      } else {
        // get the metadata operator address from the signer server
        metadataOperator = await signerUtil.getKeyAddressFromAlias(
          "responsible-gold-metadata-operator"
        );
      }
      const metadataOperatorCap = hre.ethers.parseEther(
        args.metadataOperatorCap
      );
      receipt = await topUpAccount(
        signerUtil,
        mainDeployer,
        metadataOperator,
        metadataOperatorCap,
        hre.ethers
      );
    }
  });

async function topUpAccount(
  signer: SignerUtil,
  from: string,
  recipientAddress: string,
  valueCap: bigint,
  ethers: Ethers
) {
  // check the balance of the address
  const balance = await ethers.provider.getBalance(recipientAddress);
  // check if the balance is less than the value cap
  if (balance < valueCap) {
    // transfer the difference to the address
    let tx = await signer.sendValue(recipientAddress, from, valueCap - balance);
    const receipt = await tx.wait();
    if (receipt === null || receipt === undefined) {
      throw new Error("Transaction failed");
    }
    // log the transaction
    console.log(
      `sent ${ethers.formatUnits(
        valueCap - balance,
        "ether"
      )} ether to ${recipientAddress}`
    );
    // log the transaction hash
    console.log(`transaction hash: ${tx.hash}`);
    return receipt;
  } else {
    console.log(`address ${recipientAddress} has ${balance} ether already`);
  }
}

task("add-test-funds", "Adds test funds to an address").setAction(
  async (args, hre) => {
    // check if the chain id is a hardhat chain
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    if (chainId !== BigInt(1337)) {
      throw new Error("This task can only be run on a hardhat network");
    }
    const signers = await hre.ethers.getSigners();
    const signer = signers[0];
    // get the signer local api url from environment variables
    const apiURL = getEnvVar("local", "SIGNER_API_ENDPOINT");
    const createAPIKey = getEnvVar("local", "SIGNER_API_KEY_DEPLOYER");

    let signerUtil = new SignerUtil(apiURL, createAPIKey, false, hre.ethers);
    // get the main deployer address from the local signer server
    const mainDeployer = await signerUtil.getKeyAddressFromAlias(
      "main-deployer"
    );
    const gasPrices = await getGasPrices(hre.ethers);
    // transfer 10 ether to the main deployer
    let tx = await signer.sendTransaction({
      to: mainDeployer,
      value: hre.ethers.parseEther("10"),
      gasLimit: 21000,
      maxPriorityFeePerGas: gasPrices.maxPriorityFeePerGas,
      maxFeePerGas: gasPrices.maxFeePerGas,
    });
    await tx.wait();
  }
);

task("encode-get-gcoin-holders", "gets the balance of an address").setAction(
  async (args, hre) => {
    const baseGenericToken = await hre.ethers.getContractFactory(
      "GenericToken"
    );
    const getTokenOwnerCountCallData =
      baseGenericToken.interface.encodeFunctionData("getTokenOwnerCount");
    const getTokenOwnersCallData =
      baseGenericToken.interface.encodeFunctionData("getTokenOwners", [0, 10]);
    console.log(`get token owner count: ${getTokenOwnerCountCallData}`);
    console.log(`get token owners: ${getTokenOwnersCallData}`);
  }
);
