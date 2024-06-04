import { expect } from "chai";
import { AssetNFT, ERC20Mock, MockERC20HookLogic } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import {
  ASSET_GOVERNOR_ROLE,
  MINT_KILOBAR_AMOUNT,
  MINTER_ROLE,
  TEST_CHIP1,
  TEST_CHIP3,
} from "../constants";
import { NFTTokenConfigStruct } from "../../typechain-types/contracts/ERC721/AssetNFT";
import { BigNumberish } from "ethers";
import { batchMintNFT } from "./setup";
describe("AssetNFT asset Governor", () => {
  const nftName = "testNFT";
  const nftSymbol = "TNFT";
  const testBaseURI = "https://test.com/";
  const testTokenURI = ethers.solidityPackedKeccak256(["string"], ["test"]);
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let admin: SignerWithAddress;
  let nftMinter: SignerWithAddress;
  let nftBurner: SignerWithAddress;
  let metaDataOperator: SignerWithAddress;
  let assetGovernor: SignerWithAddress;
  let ERC20Address: SignerWithAddress;
  let assetNFT: AssetNFT;
  let mockHooks: MockERC20HookLogic;
  // let allocationRegistry: AllocationRegistry;
  let availableTokenIDs: BigNumberish[];
  async function deployFixture() {
    [
      admin,
      user1,
      user2,
      nftMinter,
      nftBurner,
      metaDataOperator,
      assetGovernor,
      ERC20Address,
    ] = await ethers.getSigners();
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
      baseURI: testBaseURI,
      metaDataOperator: metaDataOperator.address,
      assetGovernor: assetGovernor.address,
      ERC20Address: ERC20Address.address,
    };
    await assetNFT.initialize(nftConfig);
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
    // batch mint 100 nfts
    availableTokenIDs = await batchMintNFT(
      3,
      user1.address,
      TEST_CHIP1,
      assetNFT,
      nftMinter
    );
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("setAssetGovernorRole", async () => {
    it("should set a new asset governor", async () => {
      const newAssetGovernor = user1.address;
      await assetNFT
        .connect(assetGovernor)
        .setAssetGovernorRole(newAssetGovernor);
      const hasRole = await assetNFT.hasRole(
        ASSET_GOVERNOR_ROLE,
        newAssetGovernor
      );
      expect(hasRole).to.be.true;
    });
    it("should fail to set a new asset governor if not called by the current asset governor", async () => {
      const newAssetGovernor = user1.address;
      const tx = assetNFT.connect(admin).setAssetGovernorRole(newAssetGovernor);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${admin.address.toLowerCase()} is missing role ${ASSET_GOVERNOR_ROLE}`
      );
    });
  });

  describe("lockAssetGovernorRole", async () => {
    it("should lock the asset governor role", async () => {
      await assetNFT.connect(assetGovernor).lockAssetGovernorRole();
      const tx = assetNFT
        .connect(assetGovernor)
        .setAssetGovernorRole(user1.address);
      await expect(tx)
        .to.be.revertedWithCustomError(assetNFT, "RoleIsLocked")
        .withArgs(ASSET_GOVERNOR_ROLE);
    });
    it("should fail to lock the asset governor role if not called by the asset governor", async () => {
      const tx = assetNFT.connect(admin).lockAssetGovernorRole();
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${admin.address.toLowerCase()} is missing role ${ASSET_GOVERNOR_ROLE}`
      );
    });
  });

  describe("freezeAccount", async () => {
    it("should freeze an account and prevent transfers", async () => {
      await assetNFT.connect(ERC20Address).freezeAccount(user1.address);
      const tx = assetNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, availableTokenIDs[0]);
      await expect(tx)
        .to.be.revertedWithCustomError(assetNFT, "AccountFrozen")
        .withArgs(user1.address);
    });
    it("should fail to freeze an account if not called by ERC20 contract", async () => {
      const tx = assetNFT.connect(admin).freezeAccount(user1.address);
      await expect(tx).to.be.revertedWithCustomError(assetNFT, "NotERC20");
    });
    it("should fail to freeze an account if the account is already frozen", async () => {
      await assetNFT.connect(ERC20Address).freezeAccount(user1.address);
      const tx = assetNFT.connect(ERC20Address).freezeAccount(user1.address);
      await expect(tx).to.be.revertedWithCustomError(assetNFT, "AccountFrozen");
    });

    it("should freeze an account and prevent transfers of tokens", async () => {
      await assetNFT.connect(ERC20Address).freezeAccount(user2.address);
      const tx = assetNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, availableTokenIDs[0]);
      await expect(tx)
        .to.be.revertedWithCustomError(assetNFT, "AccountFrozen")
        .withArgs(user2.address);
    });

    it("should freeze an account and prevents a authorized burn", async () => {
      await assetNFT.connect(ERC20Address).freezeAccount(user1.address);
      // authorize user 2 to burn user 1's token
      await assetNFT
        .connect(user1)
        .approve(nftBurner.address, availableTokenIDs[0]);
      const burnInput: AssetNFT.BurnInputStruct = {
        tokenID: availableTokenIDs[0],
        owner: user1.address,
      };
      const tx = assetNFT.connect(nftBurner).burn(burnInput);
      await expect(tx)
        .to.be.revertedWithCustomError(assetNFT, "AccountFrozen")
        .withArgs(user1.address);
    });

    it("should freeze an account and prevent minting to the account", async () => {
      await assetNFT.connect(ERC20Address).freezeAccount(user1.address);
      const input: AssetNFT.MintInputStruct = {
        to: user1.address,
        erc20Value: MINT_KILOBAR_AMOUNT,
        tokenURI: testTokenURI,
        chip: TEST_CHIP3,
      };
      const tx = assetNFT
        .connect(nftMinter)
        ["mint((address,uint256,string,string))"](input);
      await expect(tx)
        .to.be.revertedWithCustomError(assetNFT, "AccountFrozen")
        .withArgs(user1.address);
    });
  });

  describe("unfreezeAccount", async () => {
    it("should unfreeze a frozen account and allow transfers", async () => {
      // freeze account
      await assetNFT.connect(ERC20Address).freezeAccount(user1.address);
      let isFrozen = await assetNFT.isFrozen(user1.address);
      expect(isFrozen).to.be.true;
      let tx = assetNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, availableTokenIDs[0]);
      await expect(tx).to.be.revertedWithCustomError(assetNFT, "AccountFrozen");
      // unfreeze account
      await assetNFT.connect(ERC20Address).unfreezeAccount(user1.address);
      isFrozen = await assetNFT.isFrozen(user1.address);
      expect(isFrozen).to.be.false;
      tx = assetNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, availableTokenIDs[0]);
    });
    it("should fail to unfreeze an account that is not frozen", async () => {
      const tx = assetNFT.connect(ERC20Address).unfreezeAccount(user1.address);
      await expect(tx).to.be.revertedWithCustomError(
        assetNFT,
        "AccountNotFrozen"
      );
    });
    it("should fail to unfreeze an account if not called by the asset governor", async () => {
      await assetNFT.connect(ERC20Address).freezeAccount(user1.address);
      const tx = assetNFT.connect(admin).unfreezeAccount(user1.address);
      await expect(tx).to.be.revertedWithCustomError(assetNFT, "NotERC20");
    });
  });

  describe("recaptureFrozenFunds", async () => {
    it("should successfully wipe a frozen account as the asset governor", async () => {
      await assetNFT.connect(ERC20Address).freezeAccount(user1.address);
      const balanceBefore = await assetNFT.balanceOf(user1.address);
      await assetNFT
        .connect(assetGovernor)
        .recaptureFrozenFunds(user1.address, balanceBefore);
      const balanceAfter = await assetNFT.balanceOf(user1.address);
      expect(balanceAfter).to.equal(0);
      const recapturedBalance = await assetNFT.balanceOf(assetGovernor.address);
      expect(recapturedBalance).to.equal(balanceBefore);
    });
    it("should fail to wipe an account if it is not frozen", async () => {
      const balanceBefore = await assetNFT.balanceOf(user1.address);
      const tx = assetNFT
        .connect(assetGovernor)
        .recaptureFrozenFunds(user1.address, balanceBefore);
      await expect(tx).to.be.revertedWithCustomError(
        assetNFT,
        "AccountNotFrozen"
      );
    });
    it("should fail to wipe a frozen account if not called by the asset governor", async () => {
      await assetNFT.connect(ERC20Address).freezeAccount(user1.address);
      const balanceBefore = await assetNFT.balanceOf(user1.address);
      const tx = assetNFT
        .connect(admin)
        .recaptureFrozenFunds(user1.address, balanceBefore);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${admin.address.toLowerCase()} is missing role ${ASSET_GOVERNOR_ROLE}`
      );
    });

    it("should fail to wipe more than the balance of the frozen account", async () => {
      await assetNFT.connect(ERC20Address).freezeAccount(user1.address);
      const balanceBefore = await assetNFT.balanceOf(user1.address);
      const tx = assetNFT
        .connect(assetGovernor)
        .recaptureFrozenFunds(user1.address, balanceBefore + BigInt(1));
      await expect(tx).to.be.revertedWithCustomError(
        assetNFT,
        "IndexOutOfRange"
      );
    });
  });
});
