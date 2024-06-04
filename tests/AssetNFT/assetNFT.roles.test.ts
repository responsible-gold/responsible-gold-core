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
  MINT_10GCOIN_AMOUNT,
  TEST_CHIP1,
  TEST_CHIP2,
  TEST_CHIP3,
} from "../constants";
import { NFTTokenConfigStruct } from "../../typechain-types/contracts/ERC721/AssetNFT";
import { solidityPackedKeccak256 } from "ethers";
describe("AssetNFT mint and burn", () => {
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
  let nftBurner: SignerWithAddress;
  let assetGovernor: SignerWithAddress;
  let metaDataOperator: SignerWithAddress;
  let feeCollector: SignerWithAddress;
  let ERC20Address: SignerWithAddress;
  let tokenConfig: GenericTokenConfigStruct;
  let assetNFT: AssetNFT;
  let mockHooks: MockERC20HookLogic;
  // let allocationRegistry: AllocationRegistry;
  let erc20: ERC20Mock;
  let minterRole: string;
  let burnerRole: string;
  let adminRole: string;
  async function deployFixture() {
    [
      nftMinter,
      nftBurner,
      admin,
      user1,
      user2,
      metaDataOperator,
      ERC20Address,
      assetGovernor,
    ] = await ethers.getSigners();
    const nftBase = await ethers.getContractFactory("AssetNFT");
    const nftDeployTx = await nftBase.deploy();
    await nftDeployTx.waitForDeployment();
    const nftAddress = await nftDeployTx.getAddress();
    assetNFT = await ethers.getContractAt("AssetNFT", nftAddress);
    minterRole = await assetNFT.MINTER_ROLE();
    burnerRole = await assetNFT.BURNER_ROLE();
    adminRole = await assetNFT.DEFAULT_ADMIN_ROLE();
    // initialize assetNFT
    const nftConfig: NFTTokenConfigStruct = {
      name: nftName,
      symbol: nftSymbol,
      burner: nftMinter.address,
      admin: admin.address,
      minter: nftMinter.address,
      metaDataOperator: metaDataOperator.address,
      baseURI: testBaseURI,
      assetGovernor: assetGovernor.address,
      ERC20Address: ERC20Address.address,
    };
    const tx = await assetNFT.initialize(nftConfig);
    await tx.wait();
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("minter role", async () => {});
  describe("admin functions", async () => {
    it("should allow admin to set minter role", async () => {
      const tx = await assetNFT.connect(admin).setMinterRole(user1.address);
      await tx.wait();
      expect(await assetNFT.getRoleMember(minterRole)).to.equal(user1.address);
    });
    it("should allow admin to set burner role", async () => {
      const tx = await assetNFT.connect(admin).setBurnerRole(user1.address);
      await tx.wait();
      expect(await assetNFT.getRoleMember(burnerRole)).to.equal(user1.address);
    });
    it("should allow admin to change external mint hook", async () => {
      const tx = await assetNFT.connect(admin).setExtMintHook(user1.address);
      await tx.wait();
      expect(await assetNFT.mintHook()).to.equal(user1.address);
    });
    it("should allow admin to change the external burn hook", async () => {
      const tx = await assetNFT.connect(admin).setExtBurnHook(user1.address);
      await tx.wait();
      expect(await assetNFT.burnHook()).to.equal(user1.address);
    });
    it("should allow admin to change the external transfer hook", async () => {
      const tx = await assetNFT
        .connect(admin)
        .setExtTransferHook(user1.address);
      await tx.wait();
      expect(await assetNFT.transferHook()).to.equal(user1.address);
    });

    it("should allow admin to lock the minter role", async () => {
      const tx = await assetNFT.connect(admin).lockMinterRole();
      await tx.wait();
      const tx2 = assetNFT.connect(admin).setMinterRole(user1.address);
      await expect(tx2)
        .to.be.revertedWithCustomError(assetNFT, "RoleIsLocked")
        .withArgs(minterRole);
      expect(await assetNFT.isLocked(minterRole)).to.be.true;
    });

    it("should allow admin to lock the burner role", async () => {
      const tx = await assetNFT.connect(admin).lockBurnerRole();
      await tx.wait();
      const tx2 = assetNFT.connect(admin).setBurnerRole(user1.address);
      await expect(tx2)
        .to.be.revertedWithCustomError(assetNFT, "RoleIsLocked")
        .withArgs(burnerRole);
      expect(await assetNFT.isLocked(burnerRole)).to.be.true;
    });

    it("should fail to lock the burner role if not admin", async () => {
      const tx = assetNFT.connect(user1).lockBurnerRole();
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${adminRole}`
      );
    });

    it("should fail to lock the minter role if not admin", async () => {
      const tx = assetNFT.connect(user1).lockMinterRole();
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${adminRole}`
      );
    });

    it("should fail to change minter role if locked", async () => {
      const tx = await assetNFT.connect(admin).lockMinterRole();
      await tx.wait();
      const tx2 = assetNFT.connect(admin).setMinterRole(user1.address);
      await expect(tx2)
        .to.be.revertedWithCustomError(assetNFT, "RoleIsLocked")
        .withArgs(minterRole);
    });

    it("should fail to change burner role if locked", async () => {
      const tx = await assetNFT.connect(admin).lockBurnerRole();
      await tx.wait();
      const tx2 = assetNFT.connect(admin).setBurnerRole(user1.address);
      await expect(tx2)
        .to.be.revertedWithCustomError(assetNFT, "RoleIsLocked")
        .withArgs(burnerRole);
    });

    it("should fail to set minter role if not admin", async () => {
      const tx = assetNFT.connect(user1).setMinterRole(user2.address);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${adminRole}`
      );
    });
    it("should fail to set burner role if not admin", async () => {
      const tx = assetNFT.connect(user1).setBurnerRole(user2.address);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${adminRole}`
      );
    });
    it("should fail to change external mint hook if not admin", async () => {
      const tx = assetNFT.connect(user1).setExtMintHook(user2.address);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${adminRole}`
      );
    });
    it("should fail to change external burn hook if not admin", async () => {
      const tx = assetNFT.connect(user1).setExtBurnHook(user2.address);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${adminRole}`
      );
    });
    it("should fail to change external transfer hook if not admin", async () => {
      const tx = assetNFT.connect(user1).setExtTransferHook(user2.address);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${adminRole}`
      );
    });

    it("should fail to renounce admin role", async () => {
      const tx = assetNFT.connect(admin).renounceRole(adminRole, admin.address);
      await expect(tx).to.be.revertedWith("renounceRole is disabled");
    });
  });
});
