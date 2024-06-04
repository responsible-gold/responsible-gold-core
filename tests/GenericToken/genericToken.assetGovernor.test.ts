import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { deployGenericToken, deployMockERC20HookLogic } from "../setup";
import { ASSET_GOVERNOR_ROLE, BURNER_ROLE, MINTER_ROLE } from "../constants";
import {
  GenericToken,
  MockAssetNFT,
  MockERC20HookLogic,
} from "../../typechain-types";
import { GenericTokenConfigStruct } from "../../typechain-types/contracts/ERC20/GenericToken";

describe("GenericTokenMint", () => {
  const MINT_AMOUNT = ethers.parseEther("100");
  const burnAmount = ethers.parseEther("50");
  let mockERC20HookLogic: MockERC20HookLogic;
  let token: GenericToken;
  let assetGovernor: SignerWithAddress;
  let admin: SignerWithAddress;
  let minter: SignerWithAddress;
  let burner: SignerWithAddress;
  let feeCollector: SignerWithAddress;
  let badActor: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let mockAssetNFT: MockAssetNFT;
  const tokenID = 1;
  const tokenValue = ethers.parseEther("100");
  async function deployFixture() {
    [
      assetGovernor,
      admin,
      minter,
      burner,
      feeCollector,
      user1,
      user2,
      badActor,
    ] = await ethers.getSigners();
    // deploy mock erc721
    const mockAssetNFTBase = await ethers.getContractFactory("MockAssetNFT");
    const mockAssetNFTDeployTx = await mockAssetNFTBase.deploy();
    await mockAssetNFTDeployTx.waitForDeployment();
    const mockAssetNFTAddress = await mockAssetNFTDeployTx.getAddress();
    mockAssetNFT = await ethers.getContractAt(
      "MockAssetNFT",
      mockAssetNFTAddress
    );
    const tokenConfig: GenericTokenConfigStruct = {
      name: "TestToken",
      symbol: "TEST",
      decimals: 18,
      transferHook: ethers.ZeroAddress,
      mintHook: ethers.ZeroAddress,
      burnHook: ethers.ZeroAddress,
      feeCollector: feeCollector.address,
      admin: admin.address,
      assetNFT: mockAssetNFTAddress,
      feePercent: 0,
      assetGovernor: assetGovernor.address,
    };
    token = await deployGenericToken("GenericToken", tokenConfig);
    mockERC20HookLogic = await deployMockERC20HookLogic(
      await token.getAddress()
    );
    // mint assetNFT to user
    await mockAssetNFT.mint(tokenValue, 0, user1.address);
    //mint asset nft to minter
    await mockAssetNFT.mint(tokenValue, tokenID, user1.address);
    // approve token to spend nft
    await mockAssetNFT.connect(user1).approve(await token.getAddress(), 0);

    await token.connect(user1)["mint(uint256)"](0);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("setAssetGovernorRole", async () => {
    it("should allow the asset governor to set the asset governor role", async () => {
      await token.connect(assetGovernor).setAssetGovernorRole(user2.address);
      expect(await token.getRoleMember(ASSET_GOVERNOR_ROLE)).to.equal(
        user2.address
      );
    });
    it("should fail to set the asset governor role if not the asset governor", async () => {
      const tx = token.connect(user1).setAssetGovernorRole(user2.address);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${ASSET_GOVERNOR_ROLE}`
      );
    });
  });
  describe("lockAssetGovernorRole", async () => {
    it("should allow the asset governor to lock the asset governor role", async () => {
      await token.connect(assetGovernor).lockAssetGovernorRole();
      const isRoleLocked = await token.isLocked(ASSET_GOVERNOR_ROLE);
      expect(isRoleLocked).to.equal(true);
    });
    it("should fail to lock the asset governor role if not the asset governor", async () => {
      const tx = token.connect(user1).lockAssetGovernorRole();
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${ASSET_GOVERNOR_ROLE}`
      );
    });
  });
  describe("freezeAccount", async () => {
    it("should allow the asset governor to freeze an account", async () => {
      await token.connect(assetGovernor).freezeAccount(user1.address);
      const isFrozen = await token.isFrozen(user1.address);
      expect(isFrozen).to.equal(true);
    });
    it("should fail to freeze an account if not the asset governor", async () => {
      const tx = token.connect(user1).freezeAccount(user2.address);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${ASSET_GOVERNOR_ROLE}`
      );
    });
    it("should fail to freeze an account if the account is already frozen", async () => {
      await token.connect(assetGovernor).freezeAccount(user1.address);
      const tx = token.connect(assetGovernor).freezeAccount(user1.address);
      await expect(tx).to.be.revertedWithCustomError(token, "AccountFrozen");
    });
    it("should fail to transfer if the account is frozen", async () => {
      await token.connect(assetGovernor).freezeAccount(user1.address);
      const tx = token.connect(user1).transfer(user2.address, 1);
      await expect(tx).to.be.revertedWithCustomError(token, "AccountFrozen");
    });
    it("should fail to burn if the account is frozen", async () => {
      await token.connect(assetGovernor).freezeAccount(user1.address);
      const tx = token.connect(user1).burn(tokenValue);
      await expect(tx).to.be.revertedWithCustomError(token, "AccountFrozen");
    });
    it("should fail to mint if the account is frozen", async () => {
      await token.connect(assetGovernor).freezeAccount(user1.address);
      await mockAssetNFT
        .connect(user1)
        .approve(await token.getAddress(), tokenID);
      console.log("tokenID", tokenID);
      console.log("user1", user1.address);
      const tokenOwner = await mockAssetNFT.ownerOf(tokenID);
      console.log(tokenOwner);
      const tx = token.connect(user1)["mint(uint256)"](tokenID);
      await expect(tx)
        .to.be.revertedWithCustomError(token, "AccountFrozen")
        .withArgs(user1.address);
    });
    it("should fail to mint to a frozen account", async () => {
      await token.connect(assetGovernor).freezeAccount(user2.address);
      await mockAssetNFT
        .connect(user1)
        .approve(await token.getAddress(), tokenID);
      const tx = token
        .connect(user1)
        ["mint(address,uint256)"](user2.address, tokenID);
      await expect(tx)
        .to.be.revertedWithCustomError(token, "AccountFrozen")
        .withArgs(user2.address);
    });
  });
  describe("unfreezeAccount", async () => {
    beforeEach(async () => {
      await token.connect(assetGovernor).freezeAccount(user1.address);
    });
    it("should allow the asset governor to unfreeze an account", async () => {
      await token.connect(assetGovernor).unfreezeAccount(user1.address);
      const isFrozen = await token.isFrozen(user1.address);
      expect(isFrozen).to.equal(false);
    });
    it("should fail to unfreeze an account if not the asset governor", async () => {
      const tx = token.connect(user1).unfreezeAccount(user2.address);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${ASSET_GOVERNOR_ROLE}`
      );
    });
    it("should fail to unfreeze an account if the account is not frozen", async () => {
      const tx = token.connect(assetGovernor).unfreezeAccount(user2.address);
      await expect(tx).to.be.revertedWithCustomError(token, "AccountNotFrozen");
    });
    it("should allow the account to transfer if unfrozen", async () => {
      await token.connect(assetGovernor).unfreezeAccount(user1.address);
      await token.connect(user1).transfer(user2.address, 1);
    });
    it("should allow the account to burn if unfrozen", async () => {
      await token.connect(assetGovernor).unfreezeAccount(user1.address);
      await token.connect(user1).burn(tokenValue);
    });
    it("should allow the account to mint if unfrozen", async () => {
      await token.connect(assetGovernor).unfreezeAccount(user1.address);
      await mockAssetNFT
        .connect(user1)
        .approve(await token.getAddress(), tokenID);
      await token.connect(user1)["mint(uint256)"](tokenID);
    });
  });
  describe("recaptureFrozenFunds", async () => {
    it("should allow the asset governor to recapture frozen funds", async () => {
      await token.connect(assetGovernor).freezeAccount(user1.address);
      const balanceBefore = await token.balanceOf(assetGovernor.address);
      const frozenBalance = await token.balanceOf(user1.address);
      await token.connect(assetGovernor).recaptureFrozenFunds(user1.address);
      const balanceAfter = await token.balanceOf(assetGovernor.address);
      expect(balanceAfter).to.equal(balanceBefore + frozenBalance);
    });
    it("should fail to recapture frozen funds if not the asset governor", async () => {
      const tx = token.connect(user1).recaptureFrozenFunds(user2.address);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${ASSET_GOVERNOR_ROLE}`
      );
    });
    it("should fail to recapture frozen funds if the account is not frozen", async () => {
      const tx = token
        .connect(assetGovernor)
        .recaptureFrozenFunds(user2.address);
      await expect(tx).to.be.revertedWithCustomError(token, "AccountNotFrozen");
    });
  });
});
