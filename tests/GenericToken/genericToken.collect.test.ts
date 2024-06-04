import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { deployGenericToken, deployMockERC20HookLogic } from "../setup";
import {
  BURNER_ROLE,
  FEE_COLLECTOR_ROLE,
  MINTER_ROLE,
  TRANSFER_AMOUNT,
} from "../constants";
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
    await mockAssetNFT.mint(tokenValue, tokenID, minter.address);
    // approve token to spend nft
    await mockAssetNFT.connect(user1).approve(await token.getAddress(), 0);

    await token.connect(user1)["mint(uint256)"](0);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("collect", async () => {
    it("should fail to collect fee as bad actor", async () => {
      const tx = token.connect(badActor).collect(badActor.address);
      expect(tx).to.be.revertedWith(
        `AccessControl: account ${badActor.address.toLowerCase()} is missing role ${FEE_COLLECTOR_ROLE}`
      );
    });

    it("should successfully collect fee as fee collector", async () => {
      const initialBalance = await token.balanceOf(feeCollector.address);
      const fee1 = await token.getFee();
      const accruedFees = await token.balanceOf(await token.getAddress());
      let tx = await token.connect(feeCollector).collect(feeCollector.address);
      await tx.wait();
      const finalBalance = await token.balanceOf(feeCollector.address);
      let [recipientAmt, fee, zeroFee] = await token.calcFee(TRANSFER_AMOUNT);
      expect(finalBalance).to.equal(initialBalance + fee);
    });
  });

  describe("fees", async () => {
    it("should successfully change fee as admin", async () => {
      const newFee = 10;
      const tx = await token.connect(admin).setFee(newFee);
      await tx.wait();
      const actualFee = await token.getFee();
      expect(actualFee).to.equal(newFee);
    });

    it("should fail to change fee higher than 1000000", async () => {
      const tx = token.connect(admin).setFee(1000000);
      await expect(tx).to.be.revertedWithCustomError(token, "FeeTooHigh");
    });

    it("should fail to change fee if fee is locked", async () => {
      const tx = await token.connect(admin).lockFee();
      await tx.wait();
      const isFeeLocked = await token.isFeeLocked();
      expect(isFeeLocked).to.be.true;
      const tx2 = token.connect(admin).setFee(10);
      await expect(tx2).to.be.revertedWithCustomError(token, "FeeLocked");
    });
  });
});
