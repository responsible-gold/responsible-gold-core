import { expect } from "chai";
import { AssetNFT, ERC20Mock, MockERC20HookLogic } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { BURNER_ROLE, MINTER_ROLE, TEST_CHIP1 } from "../constants";
import { NFTTokenConfigStruct } from "../../typechain-types/contracts/ERC721/AssetNFT";
import { BigNumberish } from "ethers";
import { batchMintNFT } from "./setup";
describe("AssetNFT mint", () => {
  const nftName = "testNFT";
  const nftSymbol = "TNFT";
  const testBaseURI = "https://test.com/";
  const testTokenURI = ethers.solidityPackedKeccak256(["string"], ["test"]);
  let ERC20Address: SignerWithAddress;
  let assetGovernor: SignerWithAddress;
  let admin: SignerWithAddress;
  let nftMinter: SignerWithAddress;
  let nftBurner: SignerWithAddress;
  let metaDataOperator: SignerWithAddress;
  let assetNFT: AssetNFT;
  let mockHooks: MockERC20HookLogic;
  // let allocationRegistry: AllocationRegistry;
  let availableTokenIDs: BigNumberish[];
  async function deployFixture() {
    [
      admin,
      ERC20Address,
      assetGovernor,
      nftMinter,
      nftBurner,
      metaDataOperator,
    ] = await ethers.getSigners();
    // deploy assetNFT
    const nftBase = await ethers.getContractFactory("AssetNFT");
    const nftDeployTx = await nftBase.deploy();
    await nftDeployTx.waitForDeployment();
    const nftAddress = await nftDeployTx.getAddress();
    assetNFT = await ethers.getContractAt("AssetNFT", nftAddress);
  }
  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("initialize", () => {
    it("should initialize the contract", async () => {
      const nftConfig: NFTTokenConfigStruct = {
        name: nftName,
        symbol: nftSymbol,
        admin: admin.address,
        minter: nftMinter.address,
        burner: nftBurner.address,
        baseURI: testBaseURI,
        metaDataOperator: metaDataOperator.address,
        assetGovernor: assetGovernor.address,
        ERC20Address: ERC20Address.address,
      };
      await assetNFT.initialize(nftConfig);
      expect(await assetNFT.name()).to.equal(nftName);
      expect(await assetNFT.symbol()).to.equal(nftSymbol);
      expect(await assetNFT.defaultAdmin()).to.equal(admin.address);
      expect(await assetNFT.getRoleMember(MINTER_ROLE)).to.equal(
        nftMinter.address
      );
      expect(await assetNFT.getRoleMember(BURNER_ROLE)).to.equal(
        nftBurner.address
      );
    });

    it("should fail to initialize if missing minter role", async () => {
      const nftConfig: NFTTokenConfigStruct = {
        name: nftName,
        symbol: nftSymbol,
        admin: admin.address,
        minter: ethers.ZeroAddress,
        burner: nftBurner.address,
        metaDataOperator: metaDataOperator.address,
        baseURI: testBaseURI,
        assetGovernor: assetGovernor.address,
        ERC20Address: ERC20Address.address,
      };
      await expect(
        assetNFT.initialize(nftConfig)
      ).to.be.revertedWithCustomError(assetNFT, "MissingMinterAddress");
    });

    it("should fail to initialize if missing burner role", async () => {
      const nftConfig: NFTTokenConfigStruct = {
        name: nftName,
        symbol: nftSymbol,
        admin: admin.address,
        minter: nftMinter.address,
        burner: ethers.ZeroAddress,
        metaDataOperator: metaDataOperator.address,
        baseURI: testBaseURI,
        assetGovernor: assetGovernor.address,
        ERC20Address: ERC20Address.address,
      };
      await expect(
        assetNFT.initialize(nftConfig)
      ).to.be.revertedWithCustomError(assetNFT, "MissingBurnerAddress");
    });

    it("should fail to initialize if missing admin role", async () => {
      const nftConfig: NFTTokenConfigStruct = {
        name: nftName,
        symbol: nftSymbol,
        admin: ethers.ZeroAddress,
        minter: nftMinter.address,
        burner: nftBurner.address,
        metaDataOperator: metaDataOperator.address,
        baseURI: testBaseURI,
        assetGovernor: assetGovernor.address,
        ERC20Address: ERC20Address.address,
      };
      await expect(
        assetNFT.initialize(nftConfig)
      ).to.be.revertedWithCustomError(assetNFT, "MissingAdminAddress");
    });
    it("should fail to initialize if missing metaDataOperator role", async () => {
      const nftConfig: NFTTokenConfigStruct = {
        name: nftName,
        symbol: nftSymbol,
        admin: admin.address,
        minter: nftMinter.address,
        burner: nftBurner.address,
        metaDataOperator: ethers.ZeroAddress,
        baseURI: testBaseURI,
        assetGovernor: assetGovernor.address,
        ERC20Address: ERC20Address.address,
      };
      await expect(
        assetNFT.initialize(nftConfig)
      ).to.be.revertedWithCustomError(
        assetNFT,
        "MissingMetaDataOperatorAddress"
      );
    });

    it("should fail to initialize if missing assetGovernor role", async () => {
      const nftConfig: NFTTokenConfigStruct = {
        name: nftName,
        symbol: nftSymbol,
        admin: admin.address,
        minter: nftMinter.address,
        burner: nftBurner.address,
        metaDataOperator: metaDataOperator.address,
        baseURI: testBaseURI,
        assetGovernor: ethers.ZeroAddress,
        ERC20Address: ERC20Address.address,
      };
      await expect(
        assetNFT.initialize(nftConfig)
      ).to.be.revertedWithCustomError(assetNFT, "MissingAssetGovernorAddress");
    });
  });
});
