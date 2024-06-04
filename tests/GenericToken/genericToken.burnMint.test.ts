import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { deployGenericToken, deployMockERC20HookLogic } from "../setup";
import { BURNER_ROLE, MINTER_ROLE } from "../constants";
import {
  GenericToken,
  MockAssetNFT,
  MockERC20HookLogic,
} from "../../typechain-types";
import { GenericTokenConfigStruct } from "../../typechain-types/contracts/ERC20/GenericToken";
import { UNIT_ONE_FEES } from "../../scripts/Constants";
import { getERC20FeePercentInteger } from "../../scripts/DeploymentUtils";

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
    await mockAssetNFT.mint(tokenValue, tokenID, minter.address);
    // approve token to spend nft
    await mockAssetNFT.connect(user1).approve(await token.getAddress(), 0);

    await token.connect(user1)["mint(uint256)"](0);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("mint", async () => {
    it("should successfully mint without running afterhook", async () => {
      const initialBalance = await token.balanceOf(minter.address);
      await mockAssetNFT
        .connect(minter)
        .approve(await token.getAddress(), tokenID);
      await token.connect(minter)["mint(uint256)"](tokenID);
      const beforeMintTo = await mockERC20HookLogic.beforeMintTo();
      expect(beforeMintTo).to.equal(ethers.ZeroAddress);
      const finalBalance = await token.balanceOf(minter.address);
      const value = await mockAssetNFT.getTokenValue(tokenID);
      expect(finalBalance).to.equal(initialBalance + value);
    });
    it("should fail to mint if nft is approved but not owned by caller", async () => {
      await mockAssetNFT
        .connect(minter)
        .approve(await token.getAddress(), tokenID);
      const tx = token.connect(user1)["mint(uint256)"](tokenID);
      await expect(tx).to.be.revertedWith(
        "ERC721: transfer from incorrect owner"
      );
    });
    it("should sucessfully mint to user2 from minter without running afterhook", async () => {
      const initialBalance = await token.balanceOf(user1.address);
      await mockAssetNFT
        .connect(minter)
        .approve(await token.getAddress(), tokenID);
      await token
        .connect(minter)
        ["mint(address,uint256)"](user1.address, tokenID);
      const beforeMintTo = await mockERC20HookLogic.beforeMintTo();
      expect(beforeMintTo).to.equal(ethers.ZeroAddress);
      const finalBalance = await token.balanceOf(user1.address);
      const value = await mockAssetNFT.getTokenValue(tokenID);
      expect(finalBalance).to.equal(initialBalance + value);
    });

    it("should successfully change the hook address as admin and run before and after hooks", async () => {
      await mockERC20HookLogic.turnOnAfterHook();
      const tx = await token
        .connect(admin)
        .setExtMintHook(await mockERC20HookLogic.getAddress());
      await tx.wait();
      const initialBalance = await token.balanceOf(minter.address);
      await mockAssetNFT
        .connect(minter)
        .approve(await token.getAddress(), tokenID);
      const tx2 = await token.connect(minter)["mint(uint256)"](tokenID);
      await tx2.wait();
      const beforeMintTo = await mockERC20HookLogic.beforeMintTo();
      expect(beforeMintTo).to.equal(minter.address);
      const finalBalance = await token.balanceOf(minter.address);
      expect(finalBalance).to.equal(initialBalance + MINT_AMOUNT);
    });

    // it("should successfully change the hook address as admin and run before and after hooks ")

    it("should successfully change the hook address as admin and run before hooks", async () => {
      const tx = await token
        .connect(admin)
        .setExtMintHook(await mockERC20HookLogic.getAddress());
      await tx.wait();
      const initialBalance = await token.balanceOf(minter.address);
      await mockAssetNFT
        .connect(minter)
        .approve(await token.getAddress(), tokenID);
      const tx2 = await token.connect(minter)["mint(uint256)"](tokenID);
      await tx2.wait();
      const beforeMintTo = await mockERC20HookLogic.beforeMintTo();
      expect(beforeMintTo).to.equal(minter.address);
      const finalBalance = await token.balanceOf(minter.address);
      expect(finalBalance).to.equal(initialBalance + MINT_AMOUNT);
    });
  });

  describe("burn", async () => {
    it("should successfully burn without running hooks", async () => {
      const initialBalance = await token.balanceOf(user1.address);
      await token.connect(user1).burn(tokenValue);
      const finalBalance = await token.balanceOf(user1.address);
      const beforeBurnFrom = await mockERC20HookLogic.beforeBurnFrom();
      expect(beforeBurnFrom).to.equal(ethers.ZeroAddress);
      expect(finalBalance).to.equal(initialBalance - tokenValue);
    });

    it("should successfully change the hook address as admin and run before", async () => {
      let tx = await token
        .connect(admin)
        .setExtBurnHook(await mockERC20HookLogic.getAddress());
      await tx.wait();
      const initialBalance = await token.balanceOf(user1.address);
      await token.connect(user1).burn(tokenValue);
      const beforeBurnFrom = await mockERC20HookLogic.beforeBurnFrom();
      expect(beforeBurnFrom).to.equal(user1.address);
      const finalBalance = await token.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance - tokenValue);
    });

    it("should successfully change the hook address as admin and run before and after hooks", async () => {
      await mockERC20HookLogic.turnOnAfterHook();
      let tx = await token
        .connect(admin)
        .setExtBurnHook(await mockERC20HookLogic.getAddress());
      await tx.wait();
      const initialBalance = await token.balanceOf(user1.address);
      await token.connect(user1).burn(tokenValue);
      const beforeBurnFrom = await mockERC20HookLogic.beforeBurnFrom();
      expect(beforeBurnFrom).to.equal(user1.address);
      const finalBalance = await token.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance - tokenValue);
    });

    it("should fail to burn in increments outside of the available nft value owned by the token contract", async () => {
      const amount = tokenValue - BigInt(1);
      const tx = token.connect(user1).burn(amount);
      await expect(tx)
        .to.be.revertedWithCustomError(token, "NoNFTWithValue")
        .withArgs(amount);
    });
  });

  describe("transfer", async () => {
    const transferAmount = ethers.parseEther("50");

    it("should successfully transfer tokens from recipient1 to recipient2 without running hooks", async () => {
      const initialBalance1 = await token.balanceOf(user1.address);
      const initialBalance2 = await token.balanceOf(user2.address);
      await token.connect(user1).transfer(user2.address, transferAmount);
      const finalBalance1 = await token.balanceOf(user1.address);
      const finalBalance2 = await token.balanceOf(user2.address);
      expect(finalBalance1).to.equal(initialBalance1 - transferAmount);
      expect(finalBalance2).to.equal(initialBalance2 + transferAmount);
    });

    it("should turn on fees and successfully transfer tokens from recipient1 to recipient2", async () => {
      const feePercent = 0.001;
      const unitOne = BigInt(UNIT_ONE_FEES);
      const feeInt = getERC20FeePercentInteger(feePercent);
      await token.connect(admin).setFee(feeInt);
      const initialBalance1 = await token.balanceOf(user1.address);
      const initialBalance2 = await token.balanceOf(user2.address);
      const tx = await token
        .connect(user1)
        .transfer(user2.address, transferAmount);
      await tx.wait();
      const finalBalance1 = await token.balanceOf(user1.address);
      const finalBalance2 = await token.balanceOf(user2.address);
      expect(finalBalance1).to.equal(initialBalance1 - transferAmount);
      const expectedReceivedAmount =
        ((unitOne - BigInt(feeInt)) * transferAmount) / unitOne;
      expect(finalBalance2).to.equal(expectedReceivedAmount + initialBalance2);
      const accruedFees = await token.getAccruedFees();
      const expectedAcrruedFees = transferAmount - expectedReceivedAmount;
      expect(accruedFees).to.equal(expectedAcrruedFees);
    });
    it("should successfully change the hook address as admin and run before and after hooks", async () => {
      const initialBalance1 = await token.balanceOf(user1.address);
      await mockERC20HookLogic.turnOnAfterHook();
      const tx = await token
        .connect(admin)
        .setExtTransferHook(await mockERC20HookLogic.getAddress());
      await tx.wait();
      await token.connect(user1).transfer(user2.address, transferAmount);
      const finalBalance1 = await token.balanceOf(user1.address);
      expect(finalBalance1).to.equal(initialBalance1 - transferAmount);
    });

    it("should successfully change the hook address as admin and run before and after hooks with 0 fees", async () => {
      const initialBalance1 = await token.balanceOf(user1.address);
      const initialBalance2 = await token.balanceOf(user2.address);
      const tx = await token
        .connect(admin)
        .setExtTransferHook(await mockERC20HookLogic.getAddress());
      await tx.wait();
      // set fee to 0
      const transferFee = await mockERC20HookLogic.beforeTransferFee();
      await token.connect(user1).transfer(user2.address, transferAmount);
      const finalBalance1 = await token.balanceOf(user1.address);
      const finalBalance2 = await token.balanceOf(user2.address);
      expect(finalBalance1).to.equal(initialBalance1 - transferAmount);
      expect(finalBalance2).to.equal(initialBalance2 + transferAmount);
    });
  });
});
