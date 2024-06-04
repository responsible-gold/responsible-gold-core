import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { deployGenericToken, deployMockERC20HookLogic } from "../setup";
import { GenericToken, MockERC20HookLogic } from "../../typechain-types";
import { DEFAULT_ADMIN_ROLE } from "../constants";
import { GenericTokenConfigStruct } from "../../typechain-types/contracts/ERC20/GenericToken";

describe("GenericTokenHookTarget", () => {
  let token: GenericToken;
  let mockTransferHookLogic: MockERC20HookLogic;
  let assetGovernor: SignerWithAddress;
  let admin: SignerWithAddress;
  let minter: SignerWithAddress;
  let burner: SignerWithAddress;
  let feeCollector: SignerWithAddress;
  let badActor: SignerWithAddress;

  async function deployFixture() {
    [assetGovernor, admin, minter, burner, feeCollector, badActor] =
      await ethers.getSigners();
    // deploy mock erc721
    const mockAssetNFTBase = await ethers.getContractFactory("MockAssetNFT");
    const mockAssetNFTDeployTx = await mockAssetNFTBase.deploy();
    await mockAssetNFTDeployTx.waitForDeployment();
    const mockAssetNFTAddress = await mockAssetNFTDeployTx.getAddress();
    const tokenConfig: GenericTokenConfigStruct = {
      name: "TestToken",
      symbol: "TEST",
      decimals: 18,
      feeCollector: feeCollector.address,
      transferHook: ethers.ZeroAddress,
      mintHook: ethers.ZeroAddress,
      burnHook: ethers.ZeroAddress,
      admin: admin.address,
      assetNFT: mockAssetNFTAddress,
      feePercent: 0,
      assetGovernor: assetGovernor.address,
    };
    token = await deployGenericToken("GenericToken", tokenConfig);
    mockTransferHookLogic = await deployMockERC20HookLogic(
      await token.getAddress()
    );
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("lockTransferHook", async () => {
    it("should fail to lock hook as bad actor", async () => {
      const tx = token.connect(badActor).lockExtTransferHook();
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${badActor.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });
    it("should lock TransferHook as admin", async () => {
      const tx = token.connect(admin).lockExtTransferHook();
      await expect(tx).to.not.be.reverted;
      const isLocked = await token.transferHookIsLocked();
      expect(isLocked).to.be.true;
    });

    it("should successfully change TransferHook as admin", async () => {
      const tx = token
        .connect(admin)
        .setExtTransferHook(await mockTransferHookLogic.getAddress());
      await expect(tx).to.not.be.reverted;
      const hook = await token.transferHook();
      expect(hook).to.equal(await mockTransferHookLogic.getAddress());
    });
  });
  describe("setExtTransferHook", async () => {
    it("should fail to change transferHook if locked", async () => {
      await token.connect(admin).lockExtTransferHook();
      const tx = token
        .connect(admin)
        .setExtTransferHook(await mockTransferHookLogic.getAddress());
      await expect(tx).to.be.revertedWithCustomError(token, "HookLocked");
    });

    it("should fail to change transfer hook as bad actor", async () => {
      const tx = token
        .connect(badActor)
        .setExtTransferHook(await mockTransferHookLogic.getAddress());
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${badActor.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });
    it("should change erc20 hook as admin", async () => {
      const tx = token
        .connect(admin)
        .setExtTransferHook(await mockTransferHookLogic.getAddress());
      await expect(tx).to.not.be.reverted;
      const hook = await token.transferHook();
      expect(hook).to.equal(await mockTransferHookLogic.getAddress());
    });
  });

  describe("lockExtBurnHook", async () => {
    it("should fail to lock hook as bad actor", async () => {
      const tx = token.connect(badActor).lockExtBurnHook();
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${badActor.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });
    it("should lock BurnHook as admin", async () => {
      const tx = await token.connect(admin).lockExtBurnHook();
      const isLocked = await token.burnHookIsLocked();
      expect(isLocked).to.be.true;
    });
  });

  describe("setExtBurnHook", async () => {
    it("should fail to change burnHook if locked", async () => {
      await token.connect(admin).lockExtBurnHook();
      const tx = token
        .connect(admin)
        .setExtBurnHook(await mockTransferHookLogic.getAddress());
      await expect(tx).to.be.revertedWithCustomError(token, "HookLocked");
    });

    it("should fail to change burn hook as bad actor", async () => {
      const tx = token
        .connect(badActor)
        .setExtBurnHook(await mockTransferHookLogic.getAddress());
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${badActor.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });
    it("should change erc20 hook as admin", async () => {
      const tx = token
        .connect(admin)
        .setExtBurnHook(await mockTransferHookLogic.getAddress());
      await expect(tx).to.not.be.reverted;
      const hook = await token.burnHook();
      expect(hook).to.equal(await mockTransferHookLogic.getAddress());
    });
  });

  describe("lockExtMintHook", async () => {
    it("should fail to lock hook as bad actor", async () => {
      const tx = token.connect(badActor).lockExtMintHook();
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${badActor.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });
    it("should lock MintHook as admin", async () => {
      const tx = await token.connect(admin).lockExtMintHook();
      const isLocked = await token.mintHookIsLocked();
      expect(isLocked).to.be.true;
    });
  });

  describe("setExtMintHook", async () => {
    it("should fail to change mintHook if locked", async () => {
      await token.connect(admin).lockExtMintHook();
      const tx = token
        .connect(admin)
        .setExtMintHook(await mockTransferHookLogic.getAddress());
      await expect(tx).to.be.revertedWithCustomError(token, "HookLocked");
    });

    it("should fail to change mint hook as bad actor", async () => {
      const tx = token
        .connect(badActor)
        .setExtMintHook(await mockTransferHookLogic.getAddress());
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${badActor.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });
    it("should change erc20 hook as admin", async () => {
      const tx = await token
        .connect(admin)
        .setExtMintHook(await mockTransferHookLogic.getAddress());
      const hook = await token.mintHook();
      expect(hook).to.equal(await mockTransferHookLogic.getAddress());
    });
  });
});
