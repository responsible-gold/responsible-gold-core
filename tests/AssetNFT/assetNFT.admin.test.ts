import { expect } from "chai";
import {
  AssetNFT,
  ERC20Mock,
  GenericToken,
  MockERC20HookLogic,
} from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { GenericTokenConfigStruct } from "../../typechain-types/contracts/ERC20/GenericToken";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import {
  DEFAULT_ADMIN_ROLE,
  META_DATA_OPERATOR_ROLE,
  MINT_10GCOIN_AMOUNT,
  TEST_CHIP1,
  TEST_CHIP2,
  TEST_CHIP3,
} from "../constants";
import { NFTTokenConfigStruct } from "../../typechain-types/contracts/ERC721/AssetNFT";
import { batchMintNFT } from "./setup";
describe("AssetNFT mint", () => {
  const erc20Name = "ERC20Mock";
  const erc20Symbol = "ERC";
  const nftName = "testNFT";
  const nftSymbol = "TNFT";
  const testBaseURI = "https://test.com/";
  const testTokenURI = ethers.solidityPackedKeccak256(["string"], ["test"]);
  let token: GenericToken;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let admin: SignerWithAddress;
  let nftMinter: SignerWithAddress;
  let qenta: SignerWithAddress;
  let metaDataOperator: SignerWithAddress;
  let assetGovernor: SignerWithAddress;
  let feeCollector: SignerWithAddress;
  let ERC20Address: SignerWithAddress;
  let nftBurner: SignerWithAddress;
  let assetNFT: AssetNFT;
  let mockHooks: MockERC20HookLogic;
  // let allocationRegistry: AllocationRegistry;
  let erc20: ERC20Mock;
  async function deployFixture() {
    [
      admin,
      feeCollector,
      user1,
      user2,
      metaDataOperator,
      ERC20Address,
      qenta,
      nftMinter,
      nftBurner,
      assetGovernor,
    ] = await ethers.getSigners();
    // deploy a mock erc20 token
    const erc20Base = await ethers.getContractFactory("ERC20Mock");
    let erc20deployTx = await erc20Base.deploy(erc20Name, erc20Symbol);
    await erc20deployTx.waitForDeployment();
    const erc20Address = await erc20deployTx.getAddress();
    erc20 = await ethers.getContractAt("ERC20Mock", erc20Address);
    // deploy assetNFT
    const nftBase = await ethers.getContractFactory("AssetNFT");
    const nftDeployTx = await nftBase.deploy();
    await nftDeployTx.waitForDeployment();
    const nftAddress = await nftDeployTx.getAddress();
    assetNFT = await ethers.getContractAt("AssetNFT", nftAddress);
    // initialize assetNFT
    const nftConfig: NFTTokenConfigStruct = {
      name: nftName,
      symbol: nftSymbol,
      admin: admin.address,
      minter: nftMinter.address,
      burner: nftBurner.address,
      metaDataOperator: metaDataOperator.address,
      baseURI: testBaseURI,
      assetGovernor: assetGovernor.address,
      ERC20Address: erc20Address,
    };
    const tx = await assetNFT.initialize(nftConfig);
    // deploy mock external hook logic
    const mockHookLogicBase = await ethers.getContractFactory(
      "MockERC20HookLogic"
    );
    const mockHookLogicDeployTx = await mockHookLogicBase.deploy(nftAddress);
    await mockHookLogicDeployTx.waitForDeployment();
    const mockHookLogicAddress = await mockHookLogicDeployTx.getAddress();
    mockHooks = await ethers.getContractAt(
      "MockERC20HookLogic",
      mockHookLogicAddress
    );
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("setMetaDataOperatorRole", async () => {
    it("should fail to set meta data operator as non-admin", async () => {
      const tx = assetNFT.connect(user1).setMetaDataOperatorRole(user1.address);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLocaleLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });

    it("should set meta data operator as admin", async () => {
      await assetNFT.connect(admin).setMetaDataOperatorRole(user1.address);
      const metaDataOperatorRole = await assetNFT.getRoleMember(
        META_DATA_OPERATOR_ROLE
      );
      expect(metaDataOperatorRole).to.equal(user1.address);
    });
  });

  describe("changeBaseURI", async () => {
    it("should fail to change base URI as non-admin", async () => {
      const tx = assetNFT.connect(user1).changeBaseURI(testBaseURI);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLocaleLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });

    it("should successfully change base URI as admin", async () => {
      await assetNFT.connect(admin).changeBaseURI(testBaseURI);
      const baseURI = await assetNFT.baseURI();
      expect(baseURI).to.equal(testBaseURI);
    });
  });

  describe("lockMetadataOperatorRole", async () => {
    it("should fail to lock meta data operator role as non-admin", async () => {
      const tx = assetNFT.connect(user1).lockMetaDataOperatorRole();
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLocaleLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });

    it("should sucessfully lock meta data operator role as admin", async () => {
      await assetNFT.connect(admin).lockMetaDataOperatorRole();
      const isMetaDataOperatorRoleLocked = await assetNFT.isLocked(
        META_DATA_OPERATOR_ROLE
      );
      expect(isMetaDataOperatorRoleLocked).to.be.true;
    });
  });

  describe("lockExtMintHook", async () => {
    it("it should fail to lock mint hook as non-admin", async () => {
      const tx = assetNFT.connect(user1).lockExtMintHook();
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLocaleLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });

    it("should sucessfully lock mint hook as admin", async () => {
      await assetNFT.connect(admin).lockExtMintHook();
      const isMintHookLocked = await assetNFT.mintHookIsLocked();
      expect(isMintHookLocked).to.be.true;
    });
  });
});
