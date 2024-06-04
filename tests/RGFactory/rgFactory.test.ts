import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { DeploymentUtils } from "../../scripts/DeploymentUtils";
import { ERC20Factory, RGFactory } from "../../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { deployInternalFactories } from "../setup";
import { NFTTokenConfigStruct } from "../../typechain-types/contracts/ERC721/AssetNFT";
import { expect } from "chai";
import { AddressLike } from "ethers";
import { GenericTokenConfigStruct } from "../../typechain-types/contracts/ERC20/GenericToken";
import { ERC20 } from "../../typechain-types/@openzeppelin/contracts/token/ERC20/ERC20";
describe("rgFactory", () => {
  const testTokenURI = ethers.solidityPackedKeccak256(["string"], ["test"]);
  let factory: ERC20Factory;
  let mockAssetNFT: SignerWithAddress;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let burner: SignerWithAddress;
  let feeCollector: SignerWithAddress;
  let badActor: SignerWithAddress;
  let metaDataOperator: SignerWithAddress;
  let assetGovernor: SignerWithAddress;
  let ERC20Address: SignerWithAddress;
  let newLogicAddress: string;

  let deployer: DeploymentUtils;

  async function deployFixture() {
    [
      owner,
      mockAssetNFT,
      feeCollector,
      badActor,
      minter,
      burner,
      metaDataOperator,
      assetGovernor,
      ERC20Address,
    ] = await ethers.getSigners();
    deployer = await deployInternalFactories(owner.address);
    if (deployer.erc20TokenFactory === undefined) {
      throw new Error("failed to deploy ERC20Factory");
    }
    const ERC20FactoryBase = await ethers.getContractFactory("ERC20Factory");
    const erc20Factory = await ERC20FactoryBase.deploy();
    newLogicAddress = await erc20Factory.getAddress();
    factory = deployer.erc20TokenFactory;
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("deployAssetNFT", async () => {
    it("should deploy asset nft as owner", async () => {
      const nftConfig: NFTTokenConfigStruct = {
        name: "TestNFT",
        symbol: "TNFT",
        admin: owner.address,
        minter: minter.address,
        burner: burner.address,
        metaDataOperator: metaDataOperator.address,
        baseURI: testTokenURI,
        assetGovernor: assetGovernor.address,
        ERC20Address: ERC20Address.address,
      };
      const expectedTokenAddress = await deployer.erc721Factory?.addressFor(
        ethers.solidityPackedKeccak256(["string"], [nftConfig.symbol])
      );
      const initCalldata = await deployer.encodeInitializeCalldata("AssetNFT", [
        nftConfig,
      ]);
      const tx = deployer.rgFactory?.deployAssetNFT(
        nftConfig.name,
        nftConfig.symbol,
        initCalldata
      );
      await expect(tx)
        .to.emit(deployer.rgFactory, "DeployedERC721")
        .withArgs(expectedTokenAddress, nftConfig.name, nftConfig.symbol);
    });
    it("should fail to deploy asset nft as non-owner", async () => {
      const tx = deployer.rgFactory
        ?.connect(badActor)
        .deployAssetNFT("TestNFT", "TNFT", "0x");
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("should fail to deploy asset nft without init calldata", async () => {
      const tx = deployer.rgFactory?.deployAssetNFT("TestNFT", "TNFT", "0x");
      await expect(tx).to.be.revertedWithCustomError(
        deployer.rgFactory as RGFactory,
        "MissingInitCallData"
      );
    });
    it("should fail to deploy asset nft if deployer is not set", async () => {
      // update deployer to address 0
      await deployer.rgFactory?.updateDeployers(1, ethers.ZeroAddress);
      const nftConfig: NFTTokenConfigStruct = {
        name: "TestNFT",
        symbol: "TNFT",
        admin: owner.address,
        minter: minter.address,
        burner: burner.address,
        metaDataOperator: metaDataOperator.address,
        baseURI: testTokenURI,
        assetGovernor: assetGovernor.address,
        ERC20Address: ERC20Address.address,
      };
      const initCalldata = await deployer.encodeInitializeCalldata("AssetNFT", [
        nftConfig,
      ]);
      const tx = deployer.rgFactory?.deployAssetNFT(
        nftConfig.name,
        nftConfig.symbol,
        initCalldata
      );
      await expect(tx).to.be.revertedWithCustomError(
        deployer.rgFactory as RGFactory,
        "ERC721DeployerNotSet"
      );
    });
  });

  describe("deployGenericToken", async () => {
    it("should deploy generic token as owner", async () => {
      const tokenConfig: GenericTokenConfigStruct = {
        name: "TestToken",
        symbol: "TEST",
        decimals: 18,
        transferHook: ethers.ZeroAddress,
        mintHook: ethers.ZeroAddress,
        burnHook: ethers.ZeroAddress,
        feeCollector: feeCollector.address,
        admin: owner.address,
        assetNFT: mockAssetNFT.address,
        feePercent: 0,
        assetGovernor: assetGovernor.address,
      };
      const expectedTokenAddress = await deployer.erc20TokenFactory?.addressFor(
        ethers.solidityPackedKeccak256(["string"], [tokenConfig.symbol])
      );
      const initCalldata = await deployer.encodeInitializeCalldata(
        "GenericToken",
        [tokenConfig]
      );
      const tx = deployer.rgFactory?.deployGenericToken(
        tokenConfig.name,
        tokenConfig.symbol,
        initCalldata
      );
      await expect(tx)
        .to.emit(deployer.rgFactory, "DeployedERC20")
        .withArgs(expectedTokenAddress, tokenConfig.name, tokenConfig.symbol);
    });
    it("should fail to deploy generic token as non-owner", async () => {
      const tx = deployer.rgFactory
        ?.connect(badActor)
        .deployGenericToken("TestToken", "TEST", "0x");
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should fail to deploy generic token without init calldata", async () => {
      const tx = deployer.rgFactory?.deployGenericToken(
        "TestToken",
        "TEST",
        "0x"
      );
      await expect(tx).to.be.revertedWithCustomError(
        deployer.rgFactory as RGFactory,
        "MissingInitCallData"
      );
    });

    it("should fail to deploy generic token if deployer is not set", async () => {
      // update deployer to address 0
      await deployer.rgFactory?.updateDeployers(0, ethers.ZeroAddress);
      const tokenConfig: GenericTokenConfigStruct = {
        name: "TestToken",
        symbol: "TEST",
        decimals: 18,
        transferHook: ethers.ZeroAddress,
        mintHook: ethers.ZeroAddress,
        burnHook: ethers.ZeroAddress,
        feeCollector: feeCollector.address,
        admin: owner.address,
        assetNFT: mockAssetNFT.address,
        feePercent: 0,
        assetGovernor: assetGovernor.address,
      };
      const initCalldata = await deployer.encodeInitializeCalldata(
        "GenericToken",
        [tokenConfig]
      );
      const tx = deployer.rgFactory?.deployGenericToken(
        tokenConfig.name,
        tokenConfig.symbol,
        initCalldata
      );
      await expect(tx).to.be.revertedWithCustomError(
        deployer.rgFactory as RGFactory,
        "ERC20DeployerNotSet"
      );
    });

    describe("deployCreateCustomContract", async () => {
      it("should deploy custom contract as owner and initialize", async () => {
        const MockInitializableBase = await ethers.getContractFactory(
          "MockInitializable"
        );
        const deployTx = await MockInitializableBase.getDeployTransaction();
        const initCalldata = MockInitializableBase.interface.encodeFunctionData(
          "initialize",
          []
        );
        let address = (await deployer.rgFactory?.getAddress()) as AddressLike;
        let nonce = await ethers.provider.getTransactionCount(address);
        const expectedAddress = await ethers.getCreateAddress({
          from: address.toString(),
          nonce: nonce,
        });
        const tx = deployer.rgFactory?.deployCreateCustomContract(
          0,
          deployTx.data,
          initCalldata
        );
        await expect(tx)
          .to.emit(deployer.rgFactory, "DeployedCustomContract")
          .withArgs(expectedAddress);

        const isInitialized = await (
          await ethers.getContractAt("MockInitializable", expectedAddress)
        ).initialized();
        expect(isInitialized).to.be.true;
      });
      it("should deploy custom contract as owner and not initialize", async () => {
        const MockInitializableBase = await ethers.getContractFactory(
          "MockInitializable"
        );
        const deployTx = await MockInitializableBase.getDeployTransaction();
        const initCalldata = "0x";
        let address = (await deployer.rgFactory?.getAddress()) as AddressLike;
        let nonce = await ethers.provider.getTransactionCount(address);
        const expectedAddress = await ethers.getCreateAddress({
          from: address.toString(),
          nonce: nonce,
        });
        const tx = deployer.rgFactory?.deployCreateCustomContract(
          0,
          deployTx.data,
          initCalldata
        );
        await expect(tx)
          .to.emit(deployer.rgFactory, "DeployedCustomContract")
          .withArgs(expectedAddress);
        const isInitialized = await (
          await ethers.getContractAt("MockInitializable", expectedAddress)
        ).initialized();
        expect(isInitialized).to.be.false;
      });
      it("should fail to deploy custom contract as non-owner", async () => {
        const tx = deployer.rgFactory
          ?.connect(badActor)
          .deployCreateCustomContract(0, "0x", "0x");
        await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("should fail to deploy empty bytecode", async () => {
        const tx = deployer.rgFactory?.deployCreateCustomContract(
          0,
          "0x",
          "0x"
        );
        await expect(tx).to.be.revertedWithCustomError(
          deployer.rgFactory as RGFactory,
          "CreateEmptyBytecode"
        );
      });

      it("should fail to deploy with invalid bytecode", async () => {
        const tx = deployer.rgFactory?.deployCreateCustomContract(
          0,
          "0x00",
          "0x"
        );
        await expect(tx).to.be.revertedWithCustomError(
          deployer.rgFactory as RGFactory,
          "CreateFailedDeployment"
        );
      });
    });

    describe("deployCreate2CustomContract", async () => {
      it("should deploy custom contract as owner using create2 and initialize", async () => {
        const MockInitializableBase = await ethers.getContractFactory(
          "MockInitializable"
        );
        const deployTx = await MockInitializableBase.getDeployTransaction();
        const initCalldata = MockInitializableBase.interface.encodeFunctionData(
          "initialize",
          []
        );
        const initcodeHash = ethers.solidityPackedKeccak256(
          ["bytes"],
          [deployTx.data]
        );
        const salt = ethers.solidityPackedKeccak256(["string"], ["test"]);
        const expectedAddress = await ethers.getCreate2Address(
          (await deployer.rgFactory?.getAddress()) as string,
          salt,
          initcodeHash
        );
        const tx = deployer.rgFactory?.deployCreate2CustomContract(
          0,
          salt,
          deployTx.data,
          initCalldata
        );
        await expect(tx)
          .to.emit(deployer.rgFactory, "DeployedCustomContract")
          .withArgs(expectedAddress);
        const isInitialized = await (
          await ethers.getContractAt("MockInitializable", expectedAddress)
        ).initialized();
        expect(isInitialized).to.be.true;
      });
      it("should deploy custom contract as owner using create2 and not initialize", async () => {
        const MockInitializableBase = await ethers.getContractFactory(
          "MockInitializable"
        );
        const deployTx = await MockInitializableBase.getDeployTransaction();
        const initCalldata = "0x";
        const initcodeHash = ethers.solidityPackedKeccak256(
          ["bytes"],
          [deployTx.data]
        );
        const salt = ethers.solidityPackedKeccak256(["string"], ["test"]);
        const expectedAddress = await ethers.getCreate2Address(
          (await deployer.rgFactory?.getAddress()) as string,
          salt,
          initcodeHash
        );
        const tx = deployer.rgFactory?.deployCreate2CustomContract(
          0,
          salt,
          deployTx.data,
          initCalldata
        );
        await expect(tx)
          .to.emit(deployer.rgFactory, "DeployedCustomContract")
          .withArgs(expectedAddress);
        const isInitialized = await (
          await ethers.getContractAt("MockInitializable", expectedAddress)
        ).initialized();
        expect(isInitialized).to.be.false;
      });
      it("should fail to deploy custom contract as non-owner", async () => {
        const salt = ethers.solidityPackedKeccak256(["string"], ["test"]);
        const tx = deployer.rgFactory
          ?.connect(badActor)
          .deployCreate2CustomContract(0, salt, "0x", "0x");
        await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("should fail to deploy empty bytecode", async () => {
        const salt = ethers.solidityPackedKeccak256(["string"], ["test"]);
        const tx = deployer.rgFactory?.deployCreate2CustomContract(
          0,
          salt,
          "0x",
          "0x"
        );
        await expect(tx).to.be.revertedWithCustomError(
          deployer.rgFactory as RGFactory,
          "CreateEmptyBytecode"
        );
      });

      it("should fail to deploy with invalid bytecode", async () => {
        const salt = ethers.solidityPackedKeccak256(["string"], ["test"]);
        const tx = deployer.rgFactory?.deployCreate2CustomContract(
          0,
          salt,
          "0x00",
          "0x"
        );
        await expect(tx).to.be.revertedWithCustomError(
          deployer.rgFactory as RGFactory,
          "CreateFailedDeployment"
        );
      });

      it("should fail to deploy with invalid salt", async () => {
        const tx = deployer.rgFactory?.deployCreate2CustomContract(
          0,
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x00",
          "0x"
        );
        await expect(tx).to.be.revertedWithCustomError(
          deployer.rgFactory as RGFactory,
          "CreateFailedDeployment"
        );
      });
    });

    describe("upgradeLogic", async () => {
      it("should upgrade logic as owner", async () => {
        const tx = deployer.rgFactory?.upgradeTo(newLogicAddress);
        await expect(tx)
          .to.emit(deployer.rgFactory, "Upgraded")
          .withArgs(newLogicAddress);
      });
      it("should fail to upgrade logic as non-owner", async () => {
        const tx = deployer.rgFactory
          ?.connect(badActor)
          .upgradeTo(newLogicAddress);
        await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });
});
