import hre from "hardhat";
import {
  Block,
  ContractTransactionReceipt,
  ContractTransactionResponse,
  TransactionRequest,
  TransactionResponse,
  Wallet,
} from "ethers";
import {
  ERC20Factory,
  ERC721Factory,
  GenericToken,
  RGFactory,
} from "../typechain-types";
import * as dotenv from "dotenv";
import testAccounts from "../testPrivateKeys.json";

import { GenericTokenConfigStruct } from "../typechain-types/contracts/ERC20/GenericToken";

import {
  AssetNFT,
  NFTTokenConfigStruct,
} from "../typechain-types/contracts/ERC721/AssetNFT";
import { SignerUtil } from "./SignerUtil";
import { getEnvVar } from "./Config";
import { BigIntStatsListener } from "fs";
import { UNIT_ONE_FEES } from "./Constants";
dotenv.config();
export type ProxyData = {
  proxyAddress: string;
  proxyLogicAddress: string;
  gasUsed: string;
};
type Ethers = typeof hre.ethers;

type TxRequest = {
  to: string | null;
  from: string;
  gas: number;
  gasPrice: string;
  value: string;
  data: string;
};

export type SignedTxResponse = {
  signedTx: string;
  nonce: number;
  from: string;
  to: string | null;
};

export class DeploymentUtils {
  public ethers: Ethers;
  public test: boolean;
  public rgFactory?: RGFactory;
  public rgFactoryAddress?: string;
  public erc20TokenFactory?: ERC20Factory;
  public erc721Factory?: ERC721Factory;
  public silenceLogs: boolean = false;
  public tokenFactoryName: string = "ERC20Factory";
  public bridgePoolFactoryName: string = "BridgePoolFactory";
  public deployerAddress?: string;
  rgFactoryName: string = "RGFactory";
  ERC20ContractName: string = "GenericToken";
  ERC721ContractName: string = "AssetNFT";
  bridgePoolContractName: string = "TokenBridgePool";
  signer: SignerUtil;
  constructor(
    test: boolean,
    ethers: Ethers,
    rgFactoryAddress?: string,
    silenceLogs?: boolean,
    signerEnv?: string,
    deployerAddress?: string
  ) {
    this.ethers = ethers;
    this.test = test;
    this.silenceLogs = silenceLogs || false;
    this.rgFactoryAddress = rgFactoryAddress;

    if (test) {
      if (deployerAddress === undefined) {
        throw new Error("Deployer address must be set in test mode");
      }
      this.deployerAddress = deployerAddress;
      this.signer = new SignerUtil("", "", test, ethers);
    } else {
      if (signerEnv === undefined) {
        throw new Error("Signer environment not set");
      }
      // Get the signer API endpoint from .env
      const signerAPI = getEnvVar(signerEnv, "SIGNER_API_ENDPOINT");
      if (signerAPI === undefined || signerAPI === "") {
        throw new Error("Signer API endpoint not set");
      }
      // Get the signer create API key from .env
      const signerCreatorAPIKey = getEnvVar(
        signerEnv,
        "SIGNER_API_KEY_DEPLOYER"
      );
      if (signerCreatorAPIKey === undefined || signerCreatorAPIKey === "") {
        throw new Error("Signer create key not set");
      }
      this.signer = new SignerUtil(
        signerAPI,
        signerCreatorAPIKey,
        test,
        ethers
      );
    }
  }

  async init() {
    if (!this.test) {
      try {
        this.deployerAddress = await this.signer.getKeyAddressFromAlias(
          "main-deployer"
        );
      } catch (error) {
        throw new Error("Failed to get deployer address from signer");
      }
    }

    if (this.rgFactoryAddress !== undefined) {
      this.ethers
        .getContractAt("RGFactory", this.rgFactoryAddress)
        .then((factory: RGFactory) => {
          this.rgFactory = factory;
        })
        .catch((error) => {
          throw new Error("Failed to get RGFactory contract");
        });
    }
  }

  logMessage(loglevel: string, message: string) {
    this.silenceLogs === false ? console.log(loglevel + ": " + message) : null;
  }

  async deployFactories(
    rgFactoryOwner: string,
    erc20FactoryOwner: string,
    erc721FactoryOwner: string
  ) {
    let rgProxyData: ProxyData;
    let erc20FactoryProxyData: ProxyData;
    let erc721FactoryProxyData: ProxyData;
    rgProxyData = await this.deployRGFactory(rgFactoryOwner);
    erc20FactoryProxyData = await this.deployERC20Factory(erc20FactoryOwner);
    erc721FactoryProxyData = await this.deployERC721Factory(erc721FactoryOwner);
    this.rgFactory = await this.ethers.getContractAt(
      "RGFactory",
      rgProxyData.proxyAddress
    );
    this.erc20TokenFactory = await this.ethers.getContractAt(
      "ERC20Factory",
      erc20FactoryProxyData.proxyAddress
    );
    this.erc721Factory = await this.ethers.getContractAt(
      "ERC721Factory",
      erc721FactoryProxyData.proxyAddress
    );
    return {
      rgFactory: rgProxyData,
      erc20Factory: erc20FactoryProxyData,
      erc721Factory: erc721FactoryProxyData,
      gasUsed: (
        BigInt(rgProxyData.gasUsed) +
        BigInt(erc20FactoryProxyData.gasUsed) +
        BigInt(erc721FactoryProxyData.gasUsed)
      ).toString(),
    };
  }
  /**
   * Deploys the RGFactory, all contract deployment will be done with this factory.
   *
   *
   * @returns {Promise<ProxyData>} A promise that resolves to an object containing the proxy address and the proxy logic address.
   */
  async deployRGFactory(factoryOwner: string): Promise<ProxyData> {
    if (this.deployerAddress === undefined) {
      throw new Error("Deployer address not set");
    }
    if (this.rgFactory !== undefined || this.rgFactoryAddress !== undefined) {
      throw new Error("RGFactory already deployed");
    }
    let proxyData = await this.deployUUPSContract(
      "RGFactory",
      [],
      [factoryOwner],
      this.deployerAddress
    );
    this.logMessage(
      "info",
      "Deployed RGFactory logic at " + proxyData.proxyLogicAddress
    );
    this.logMessage("info", "Deployed RGFactory at " + proxyData.proxyAddress);
    this.rgFactory = await this.ethers.getContractAt(
      "RGFactory",
      proxyData.proxyAddress
    );
    this.rgFactoryAddress = proxyData.proxyAddress;
    return proxyData;
  }

  /**
   * Deploys the ERC20Factory contract and initializes it.
   *
   *
   * @returns {Promise<ProxyData>} A promise that resolves to an object containing the proxy address and the proxy logic address.
   */
  async deployERC20Factory(factoryOwner: string): Promise<ProxyData> {
    if (this.deployerAddress === undefined) {
      throw new Error("Deployer address not set");
    }
    if (this.rgFactory === undefined) {
      throw new Error("RGFactory not deployed");
    }

    const factoryName = "ERC20Factory";
    const proxyName = "UUPSProxy";
    // deploy the logic contract for the erc20 factory
    const logicContract = await this.deployContractRaw(factoryName, []);
    this.logMessage(
      "info",
      "Deployed" +
        factoryName +
        " logic contract at " +
        (await logicContract.contract.getAddress())
    );
    // encode the call data to initialize the erc20 factory
    const initCallData = await this.encodeInitializeCalldata(factoryName, [
      factoryOwner,
      await this.rgFactory?.getAddress(),
    ]);
    // deploy the uups proxy contract and initialize it
    let tx = await this.deployCustomContractFromRGFactory(
      proxyName,
      [await logicContract.contract.getAddress(), initCallData],
      "0x"
    );
    let receipt = await tx.wait();
    // get the address of the deployed contract from the event DeployedCustomContract
    if (receipt === null) {
      throw new Error("No events in receipt");
    }

    let topic = this.rgFactory.interface.getEvent(
      "DeployedCustomContract"
    ).topicHash;
    // extract the contract address from the event DeployedCustomContract(address)
    const deployedProxyAddress = await this.getAddressFromEvent(
      receipt,
      topic,
      1
    );
    this.logMessage(
      "info",
      "Deployed " + factoryName + " at " + deployedProxyAddress
    );
    // register the deployed contract factory with the RGFactory
    this.logMessage("info", "Registering " + factoryName + " with RGFactory");
    this.erc20TokenFactory = await this.ethers.getContractAt(
      factoryName,
      deployedProxyAddress
    );
    tx = await this.signer.callContract(
      "RGFactory",
      await this.rgFactory.getAddress(),
      "updateDeployers",
      [0, deployedProxyAddress],
      this.deployerAddress
    );
    receipt = await tx.wait();
    if (receipt === null) {
      throw new Error("tx-failed");
    }
    return {
      proxyAddress: deployedProxyAddress,
      proxyLogicAddress: await logicContract.contract.getAddress(),
      gasUsed: (receipt.gasUsed + logicContract.receipt.gasUsed).toString(),
    };
  }
  /**
   * Deploys the ERC721Factory contract and initializes it.
   *
   *
   * @returns {Promise<ProxyData>} A promise that resolves to an object containing the proxy address and the proxy logic address.
   */
  async deployERC721Factory(factoryOwner: string): Promise<ProxyData> {
    if (this.rgFactoryAddress === undefined) {
      throw new Error("RGFactory not deployed");
    }
    if (this.deployerAddress === undefined) {
      throw new Error("Deployer address not set");
    }
    this.rgFactory = await this.ethers.getContractAt(
      "RGFactory",
      this.rgFactoryAddress
    );
    const factoryName = "ERC721Factory";
    const proxyName = "UUPSProxy";
    // deploy the GenericToken factory contract
    const logicContract = await this.deployContractRaw(factoryName, []);
    this.logMessage(
      "info",
      "Deployed" +
        factoryName +
        " logic contract at " +
        (await logicContract.contract.getAddress())
    );
    const initCallData = await this.encodeInitializeCalldata(factoryName, [
      factoryOwner,
      await this.rgFactory?.getAddress(),
    ]);
    let tx = await this.deployCustomContractFromRGFactory(
      proxyName,
      [await logicContract.contract.getAddress(), initCallData],
      "0x"
    );
    let receipt = await tx.wait();
    // get the address of the deployed contract from the event DeployedCustomContract
    if (receipt === null) {
      throw new Error("No events in receipt");
    }

    let topic = this.rgFactory.interface.getEvent(
      "DeployedCustomContract"
    ).topicHash;
    // extract the contract address from the event DeployedCustomContract(address)
    const deployedProxyAddress = await this.getAddressFromEvent(
      receipt,
      topic,
      1
    );
    this.logMessage(
      "info",
      "Deployed " + factoryName + " at " + deployedProxyAddress
    );
    // register the deployed contract factory with the RGFactory
    this.logMessage("info", "Registering " + factoryName + " with RGFactory");
    tx = await this.signer.callContract(
      "RGFactory",
      await this.rgFactory.getAddress(),
      "updateDeployers",
      [1, deployedProxyAddress],
      this.deployerAddress
    );
    receipt = await tx.wait();
    this.erc721Factory = await this.ethers.getContractAt(
      factoryName,
      deployedProxyAddress
    );
    if (receipt === null) {
      throw new Error("tx-failed");
    }
    return {
      proxyAddress: deployedProxyAddress,
      proxyLogicAddress: await logicContract.contract.getAddress(),
      gasUsed: (receipt.gasUsed + logicContract.receipt.gasUsed).toString(),
    };
  }
  /**
   * @description goes through the receipt from the
   * transaction and extract the specified event name and variable
   * @param receipt tx object returned from the tran
   * @param eventName
   * @param varIndex index of event var starting with 1
   * @returns
   */
  async getEventVar(
    receipt: ContractTransactionReceipt,
    topicHash: string,
    varIndex: number
  ) {
    let item: string | undefined;
    receipt.logs.forEach((log) => {
      if (log.topics[0] === topicHash) {
        item = log.topics[varIndex];
      }
    });
    if (item !== undefined) {
      return item;
    } else {
      throw new Error(`failed to find event: ${topicHash}`);
    }
  }

  async getAddressFromEvent(
    receipt: ContractTransactionReceipt,
    topicHash: string,
    varIndex: number
  ): Promise<string> {
    const addr = await this.getEventVar(receipt, topicHash, varIndex);
    return "0x" + addr.substring(addr.length - 40);
  }

  private async deployCustomContractFromRGFactory(
    contractName: string,
    constructorArgs: any[],
    initcallData: string
  ): Promise<ContractTransactionResponse> {
    if (this.deployerAddress === undefined) {
      throw new Error("Deployer address not set");
    }
    if (this.rgFactoryAddress === undefined) {
      throw new Error("RGFactory not deployed");
    }
    this.rgFactory = await this.ethers.getContractAt(
      "RGFactory",
      this.rgFactoryAddress
    );
    const contractBase = await this.ethers.getContractFactory(contractName);
    const deployTx = await contractBase.getDeployTransaction(
      ...constructorArgs
    );
    // encode function call to rgFactory.deployCreateCustomContract
    const calldata = await this.rgFactory.interface.encodeFunctionData(
      "deployCreateCustomContract",
      [0, deployTx.data, initcallData]
    );

    const gas = await this.ethers.provider.estimateGas({
      from: this.deployerAddress,
      to: await this.rgFactory.getAddress(),
      data: calldata,
    });
    return this.signer.sendRawTxWithData(
      await this.rgFactory.getAddress(),
      this.deployerAddress,
      BigInt(0),
      calldata,
      gas
    );
  }

  async deployUUPSThroughRGFactoryCreate(
    logicContractName: string,
    constructorArgs: any[],
    initializerArgs: any[]
  ) {
    if (this.rgFactoryAddress === undefined) {
      throw new Error("RGFactory not deployed");
    }
    this.rgFactory = await this.ethers.getContractAt(
      "RGFactory",
      this.rgFactoryAddress
    );
    let tx = await this.deployCustomContractFromRGFactory(
      logicContractName,
      constructorArgs,
      "0x"
    );
    let receipt = await tx.wait();
    if (receipt === null) {
      throw new Error("tx-failed");
    }
    const topic = this.rgFactory.interface.getEvent(
      "DeployedCustomContract"
    ).topicHash;
    // extract the contract address from the event DeployedCustomContract(address)
    const deployedLogicAddress = await this.getAddressFromEvent(
      receipt,
      topic,
      1
    );
    const initCallData = await this.encodeInitializeCalldata(
      logicContractName,
      initializerArgs
    );
    tx = await this.deployCustomContractFromRGFactory(
      "UUPSProxy",
      [deployedLogicAddress, initCallData],
      "0x"
    );
    receipt = await tx.wait();
    if (receipt === null) {
      throw new Error("tx-failed");
    }
    const deployedProxyAddress = await this.getAddressFromEvent(
      receipt,
      topic,
      1
    );
    return {
      proxyAddress: deployedProxyAddress,
      proxyLogicAddress: deployedLogicAddress,
    };
  }

  async deployGcoinContracts(
    erc721Admin: string,
    erc721AssetGovernor: string,
    erc721MinterAddress: string,
    erc721BurnerAddress: string,
    erc721MetadataOperator: string,
    erc721BaseTokenURI: string,
    feeCollector: string,
    nftName: string,
    nftSymbol: string,
    erc20Admin: string,
    erc20AssetGovernor: string,
    erc20Name: string,
    erc20Symbol: string,
    erc20Decimals: number,
    feePercent: number,
    erc20TransferHook?: string,
    erc20MintHook?: string,
    erc20BurnHook?: string
  ) {
    if (this.rgFactoryAddress === undefined) {
      throw new Error("RGFactory not deployed");
    }
    this.rgFactory = await this.ethers.getContractAt(
      "RGFactory",
      this.rgFactoryAddress
    );
    // check if the erc20 factory is deployed
    const erc20FactoryAddress = await this.rgFactory.deployers(0);
    if (erc20FactoryAddress === this.ethers.ZeroAddress) {
      throw new Error("ERC20 factory not deployed");
    }
    if (this.erc20TokenFactory === undefined) {
      this.erc20TokenFactory = await this.ethers.getContractAt(
        "ERC20Factory",
        erc20FactoryAddress
      );
    }
    // check if the erc721 factory is deployed
    const erc721FactoryAddress = await this.rgFactory.deployers(1);
    if (erc721FactoryAddress === this.ethers.ZeroAddress) {
      throw new Error("ERC721 factory not deployed");
    }
    const erc20Salt = await this.erc20TokenFactory.calcSalt(erc20Symbol);
    // calculate the ERC20 address
    const erc20Address = await this.erc20TokenFactory.addressFor(erc20Salt);

    // deploy the asset nft
    const assetNFT = await this.deployAssetNFT(
      erc721Admin,
      erc721AssetGovernor,
      erc721MinterAddress,
      erc721BurnerAddress,
      nftName,
      nftSymbol,
      erc721MetadataOperator,
      erc721BaseTokenURI,
      erc20Address
    );
    // deploy the erc20 token
    const erc20Token = await this.deployGenericToken(
      erc20Admin,
      erc20AssetGovernor,
      await assetNFT.assetNFT.getAddress(),
      feeCollector,
      erc20Name,
      erc20Symbol,
      erc20Decimals,
      feePercent,
      erc20MintHook,
      erc20BurnHook,
      erc20TransferHook
    );
    return {
      assetNFT: assetNFT,
      erc20Token: erc20Token,
      gasUsed: (
        assetNFT.receipt.gasUsed + erc20Token.receipt.gasUsed
      ).toString(),
    };
  }

  async deployAssetNFT(
    admin: string,
    assetGovernor: string,
    minter: string,
    burner: string,
    tokenName: string,
    tokenSymbol: string,
    metaDataOperator: string,
    baseTokenURI: string,
    erc20Address: string
  ): Promise<{ assetNFT: AssetNFT; receipt: ContractTransactionReceipt }> {
    let tokenConfig: NFTTokenConfigStruct = {
      admin: admin,
      assetGovernor: assetGovernor,
      minter: minter,
      burner: burner,
      name: tokenName,
      symbol: tokenSymbol,
      metaDataOperator: metaDataOperator,
      baseURI: baseTokenURI,
      ERC20Address: erc20Address,
    };
    if (this.rgFactoryAddress === undefined) {
      throw new Error("RGFactory not deployed");
    }
    if (this.deployerAddress === undefined) {
      throw new Error("Deployer address not set");
    }
    this.rgFactory = await this.ethers.getContractAt(
      "RGFactory",
      this.rgFactoryAddress
    );
    const tokenFactoryAddress = await this.rgFactory.deployers(0);
    if (tokenFactoryAddress === this.ethers.ZeroAddress) {
      throw new Error("Token factory not deployed");
    }
    // encode initialize data
    const initCallData = await this.encodeInitializeCalldata(
      this.ERC721ContractName,
      [tokenConfig]
    );
    // calls the method deployAssetNFT on the rgFactory
    let tx = await this.signer.callContract(
      this.rgFactoryName,
      await this.rgFactory.getAddress(),
      "deployAssetNFT",
      [tokenName, tokenSymbol, initCallData],
      this.deployerAddress
    );
    // extract the address of the deployed token from the event DeployedToken(address tokenAddress, string name, string symbol)
    const receipt = await tx.wait();
    if (receipt === null) {
      throw new Error("No events in receipt");
    }
    let topic = this.rgFactory.interface.getEvent("DeployedERC721").topicHash;
    const tokenAddress = await this.getAddressFromEvent(receipt, topic, 1);
    const assetNFT = await this.ethers.getContractAt("AssetNFT", tokenAddress);
    return { assetNFT, receipt };
  }

  /**
   *
   * @param admin address of the admin
   * @param assetNFT address of the asset nft
   * @param feeCollector address of the fee collector
   * @param tokenName token name to use, this will show on uniswap
   * @param tokenSymbol token symbol to use, this will show on uniswap
   * @param decimals decimal places for the token
   * @param feePercent percentage is expressed in integer for  10 : 0.01% 100: 0.1% 1000: 1%
   * @param mintHook address of the mint hook contract
   * @param burnHook address of the burn hook contract
   * @param transferHook address of the transfer hook contract
   * @returns the deployed generic token
   */
  async deployGenericToken(
    admin: string,
    assetGovernor: string,
    assetNFT: string,
    feeCollector: string,
    tokenName: string,
    tokenSymbol: string,
    decimals: number,
    feePercent: number,
    mintHook?: string,
    burnHook?: string,
    transferHook?: string
  ): Promise<{ erc20: GenericToken; receipt: ContractTransactionReceipt }> {
    let tokenConfig: GenericTokenConfigStruct = {
      name: tokenName,
      symbol: tokenSymbol,
      decimals: decimals,
      admin: admin,
      assetGovernor: assetGovernor,
      assetNFT: assetNFT,
      transferHook: transferHook ? transferHook : this.ethers.ZeroAddress,
      mintHook: mintHook ? mintHook : this.ethers.ZeroAddress,
      burnHook: burnHook ? burnHook : this.ethers.ZeroAddress,
      feeCollector: feeCollector,
      feePercent: feePercent,
    };
    if (this.deployerAddress === undefined) {
      throw new Error("Deployer address not set");
    }
    if (this.rgFactoryAddress === undefined) {
      throw new Error("RGFactory not deployed");
    }
    this.rgFactory = await this.ethers.getContractAt(
      "RGFactory",
      this.rgFactoryAddress
    );
    const tokenFactoryAddress = await this.rgFactory.deployers(0);
    if (tokenFactoryAddress === this.ethers.ZeroAddress) {
      throw new Error("Token factory not deployed");
    }
    // encode initialize data
    const initCallData = await this.encodeInitializeCalldata(
      this.ERC20ContractName,
      [tokenConfig]
    );
    let tx = await this.signer.callContract(
      this.rgFactoryName,
      await this.rgFactory.getAddress(),
      "deployGenericToken",
      [tokenName, tokenSymbol, initCallData],
      this.deployerAddress
    );
    // extract the address of the deployed token from the event DeployedToken(address tokenAddress, string name, string symbol)
    const receipt = await tx.wait();
    if (receipt === null) {
      throw new Error("No events in receipt");
    }
    const topic = await this.rgFactory.getEvent("DeployedERC20").fragment
      .topicHash;
    const tokenAddress = await this.getAddressFromEvent(receipt, topic, 1);
    const erc20 = await this.ethers.getContractAt("GenericToken", tokenAddress);
    return { erc20, receipt };
  }

  async deployUUPSContract(
    logicContractName: string,
    constructorArgs: any[],
    initializerArgs: any[],
    deployerAddress: string
  ): Promise<ProxyData> {
    let logicContract = await this.deployContractRaw(
      logicContractName,
      constructorArgs
    );
    const initCallData = await this.encodeInitializeCalldata(
      logicContractName,
      initializerArgs
    );
    const proxy = await this.deployContractRaw("UUPSProxy", [
      await logicContract.contract.getAddress(),
      initCallData,
    ]);
    return {
      proxyAddress: await proxy.contract.getAddress(),
      proxyLogicAddress: await logicContract.contract.getAddress(),
      gasUsed: (
        proxy.receipt.gasUsed + logicContract.receipt.gasUsed
      ).toString(),
    };
  }

  public async upgradeUUPSContract(
    previousLogicContractName: string,
    newLogicContractName: string,
    deployerAddress: string,
    proxyAddress: string,
    constructorArgs: any[],
    initializerArgs: any[],
    gas: bigint
  ): Promise<ProxyData> {
    // get the binding for the logic contract
    let logicBase = await this.ethers.getContractFactory(newLogicContractName);
    let newLogicContract = (
      await this.deployContractRaw(newLogicContractName, constructorArgs)
    ).contract;
    newLogicContract = await newLogicContract.waitForDeployment();
    let initializeData = "0x";
    try {
      // encode initialize data
      initializeData = logicBase.interface.encodeFunctionData(
        "initialize",
        ...initializerArgs
      );
    } catch (error) {}
    const proxy = await this.ethers.getContractAt(
      previousLogicContractName,
      proxyAddress
    );
    let txdata = proxy.interface.encodeFunctionData("upgradeTo", [
      await newLogicContract.getAddress(),
    ]);

    let tx = await this.signer.sendRawTxWithData(
      proxyAddress,
      deployerAddress,
      BigInt(0),
      txdata,
      gas
    );
    await tx.wait();
    let receipt;
    try {
      txdata = await this.encodeInitializeCalldata(
        newLogicContractName,
        initializerArgs
      );
      tx = await this.signer.sendRawTxWithData(
        proxyAddress,
        deployerAddress,
        BigInt(0),
        txdata,
        gas
      );
      receipt = await tx.wait();
    } catch (error) {}
    return {
      proxyAddress: await proxy.getAddress(),
      proxyLogicAddress: await newLogicContract.getAddress(),
      gasUsed:
        receipt !== undefined && receipt !== null
          ? receipt.gasUsed.toString()
          : "0",
    };
  }

  public async encodeInitializeCalldata(contractName: string, args: any[]) {
    const contractBase = await this.ethers.getContractFactory(contractName);
    let initCalldata = "0x";

    try {
      // encode initialize data
      initCalldata = contractBase.interface.encodeFunctionData(
        "initialize",
        args
      );
    } catch (error) {
      // throw error if initialize function exists
      if (error !== "no matching function") {
        throw error;
      }
    }
    return initCalldata;
  }

  async initializeContract(
    contractName: string,
    contractAddress: string,
    from: string,
    args: any[]
  ) {
    const data = await this.encodeInitializeCalldata(contractName, args);
    if (data !== "0x") {
      let gas: bigint;
      try {
        gas = await this.ethers.provider.estimateGas({ data: data });
      } catch (error) {
        gas = BigInt(100000);
      }
      const tx = await this.signer.sendRawTxWithData(
        contractAddress,
        from,
        BigInt(0),
        data,
        gas
      );
      return await tx.wait();
    }
  }

  public async deployContractRaw(contractName: string, args: any[]) {
    const contractBase = await this.ethers.getContractFactory(contractName);
    let deploymentTx = await contractBase.getDeployTransaction(...args);
    const gas = await this.ethers.provider.estimateGas({
      data: deploymentTx.data,
    });
    const gasPrices = await getGasPrices(this.ethers);
    // todo add  auth token and chain id
    if (this.deployerAddress === undefined) {
      throw new Error("Deployer address not set");
    }
    const deployerAddress = this.deployerAddress;
    const signedDeployTxRes = await this.signer.signTransaction(
      null,
      deployerAddress,
      BigInt(0),
      gas,
      gasPrices.maxPriorityFeePerGas,
      gasPrices.maxFeePerGas,
      deploymentTx.data
    );
    // calculate deployment address
    const contractAddress = this.ethers.getCreateAddress({
      from: signedDeployTxRes.from,
      nonce: signedDeployTxRes.nonce,
    });

    const tx = await sendTransaction(signedDeployTxRes.signedTx, this.ethers);
    const receipt = await tx.wait();
    const contract = await this.ethers.getContractAt(
      contractName,
      contractAddress
    );
    if (receipt === null) {
      throw new Error("tx-failed");
    }
    return { contract, receipt };
  }
}

// export async function getGasPrices(test: Boolean, ethers: Ethers) {
//   // get the connected chainID
//   const chainId = (await ethers.provider.getNetwork()).chainId;
//   if (test) {
//     // get the latest block
//     const latestBlock = (await ethers.provider.getBlock("latest")) as Block;
//     // get the previous basefee from the latest block
//     let blockBaseFee = latestBlock.baseFeePerGas;
//     if (blockBaseFee === undefined || blockBaseFee === null) {
//       blockBaseFee = 7n;
//     }
//     // miner tip
//     let maxPriorityFeePerGas: bigint;
//     const network = await ethers.provider.getNetwork();
//     const minValue = ethers.parseUnits("2.0", "gwei");
//     if (network.chainId === BigInt(1337)) {
//       maxPriorityFeePerGas = minValue;
//     } else {
//       maxPriorityFeePerGas = BigInt(
//         await ethers.provider.send("eth_maxPriorityFeePerGas", [])
//       );
//     }
//     maxPriorityFeePerGas = (maxPriorityFeePerGas * 125n) / 100n;
//     maxPriorityFeePerGas =
//       maxPriorityFeePerGas < minValue ? minValue : maxPriorityFeePerGas;
//     const maxFeePerGas = 2n * blockBaseFee + maxPriorityFeePerGas;
//     return { maxPriorityFeePerGas, maxFeePerGas };
//   } else {
//     return { maxPriorityFeePerGas: 0n, maxFeePerGas: 0n };
//   }
// }

export async function getGasPrices(ethers: Ethers) {
  // get the latest block
  const latestBlock = (await ethers.provider.getBlock("latest")) as Block;
  // get the previous basefee from the latest block
  const _blockBaseFee = latestBlock.baseFeePerGas;
  if (_blockBaseFee === undefined || _blockBaseFee === null) {
    throw new Error("undefined block base fee per gas");
  }
  const blockBaseFee = _blockBaseFee;
  // miner tip
  let maxPriorityFeePerGas: bigint;
  const network = await ethers.provider.getNetwork();
  const minValue = ethers.parseUnits("2.0", "gwei");
  if (network.chainId === BigInt(1337)) {
    maxPriorityFeePerGas = minValue;
  } else {
    maxPriorityFeePerGas = BigInt(
      await ethers.provider.send("eth_maxPriorityFeePerGas", [])
    );
  }
  maxPriorityFeePerGas = (maxPriorityFeePerGas * 125n) / 100n;
  maxPriorityFeePerGas =
    maxPriorityFeePerGas < minValue ? minValue : maxPriorityFeePerGas;
  const maxFeePerGas = 2n * blockBaseFee + maxPriorityFeePerGas;
  return { maxPriorityFeePerGas, maxFeePerGas };
}

export async function simulateServerSigning(
  to: string | null,
  from: string,
  value: bigint,
  gas: bigint,
  gasPrice: bigint,
  data: string,
  chainID: bigint,
  ethers: Ethers
): Promise<SignedTxResponse> {
  from = from.toLowerCase();
  // import the keys from the hardhat config
  const privateKeys: {
    accounts: Array<{ address: string; privateKey: string }>;
  } = testAccounts as any;
  if (privateKeys === undefined) {
    throw new Error("undefined accounts");
  }
  // find the wallet that corresponds to the from address

  const account = privateKeys.accounts.find(
    (account) => account.address.toLowerCase() === from
  );
  if (account === undefined) {
    throw new Error("account not found");
  }

  const nonce = await ethers.provider.getTransactionCount(from);
  const wallet = new Wallet(account.privateKey, ethers.provider);
  const transaction: TransactionRequest = {
    to: to,
    value: value,
    gasLimit: gas,
    maxFeePerGas: gasPrice,
    data: data,
    nonce: nonce,
    chainId: chainID,
  };
  const signedTX = await wallet.signTransaction(transaction);
  return {
    signedTx: signedTX,
    nonce: nonce,
    from: from,
    to: to,
  };
}

export async function sendTransaction(
  signedTx: string,
  ethers: Ethers
): Promise<TransactionResponse> {
  return await ethers.provider.broadcastTransaction(signedTx);
}

export function getERC20FeePercentInteger(feePercent: number): number {
  const fee = feePercent / 100;
  if (feePercent === 0.0) {
    return 0;
  } else if (fee < 1 / UNIT_ONE_FEES || fee > 1) {
    throw new Error(
      "Invalid fee percentage fee must be either 0 or between 0.0001% and 100%"
    );
  } else {
    return Math.floor(fee * UNIT_ONE_FEES);
  }
}
