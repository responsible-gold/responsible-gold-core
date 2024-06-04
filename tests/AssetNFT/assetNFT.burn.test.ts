import { expect } from "chai";
import {
  AssetNFT,
  ERC20Mock,
  GenericToken,
  MockERC20HookLogic,
} from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { TEST_CHIP1 } from "../constants";
import { NFTTokenConfigStruct } from "../../typechain-types/contracts/ERC721/AssetNFT";
import { BigNumberish } from "ethers";
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
  let ERC20Address: SignerWithAddress;
  let metaDataOperator: SignerWithAddress;
  let feeCollector: SignerWithAddress;
  let assetGovernor: SignerWithAddress;
  let nftBurner: SignerWithAddress;
  let assetNFT: AssetNFT;
  let mockHooks: MockERC20HookLogic;
  // let allocationRegistry: AllocationRegistry;
  let erc20: ERC20Mock;
  let availableTokenIDs: BigNumberish[];
  async function deployFixture() {
    [
      admin,
      feeCollector,
      user1,
      user2,
      metaDataOperator,
      assetGovernor,
      ERC20Address,
      nftMinter,
      nftBurner,
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

  describe("burn", () => {
    it("should allow nft burner to burn an approved nft from user1", async () => {
      let tokenID = await assetNFT.tokenOfOwnerByIndex(user1.address, 0);
      let tx = await assetNFT
        .connect(user1)
        .approve(nftBurner.address, availableTokenIDs[0]);
      await tx.wait();
      const input = { tokenID: availableTokenIDs[0], owner: user1.address };
      tx = await assetNFT.connect(nftBurner).burn(input);
      await tx.wait();
      const owner = assetNFT.ownerOf(availableTokenIDs[0]);
      expect(owner).to.be.revertedWith("ERC721: invalid token ID");
      // check if the token data is deleted
      const tokenData = await assetNFT.getPositionData(availableTokenIDs[0]);
      expect(tokenData.erc20Value).to.equal(0);
    });

    it("should fail to burn an unapproved nft from user1", async () => {
      let tokenID = await assetNFT.tokenOfOwnerByIndex(user1.address, 0);
      const input = { tokenID: availableTokenIDs[0], owner: user1.address };
      let tx = assetNFT.connect(nftBurner).burn(input);
      await expect(tx)
        .to.be.revertedWithCustomError(assetNFT, "NotApprovedOrOwner")
        .withArgs(nftBurner.address, user1.address, availableTokenIDs[0]);
    });

    it("should burn an approved nft from user1 and call before hook without calling after hook", async () => {
      const tx = await assetNFT
        .connect(admin)
        .setExtBurnHook(await mockHooks.getAddress());
      await tx.wait();
      let tokenID = await assetNFT.tokenOfOwnerByIndex(user1.address, 0);
      let previousTokenID = tokenID;
      let tx2 = await assetNFT
        .connect(user1)
        .approve(nftBurner.address, availableTokenIDs[0]);
      await tx2.wait();
      const input = { tokenID: availableTokenIDs[0], owner: user1.address };
      tx2 = await assetNFT.connect(nftBurner).burn(input);
      await tx2.wait();
      const isCalled = await mockHooks.afterBurnHookRan();
      expect(isCalled).to.be.false;
      expect(await mockHooks.beforeBurnFrom()).to.equal(user1.address);
    });

    it("should burn an approved nft from user1 and call before and after hook", async () => {
      const tx = await assetNFT
        .connect(admin)
        .setExtBurnHook(await mockHooks.getAddress());
      await tx.wait();
      let tokenID = await assetNFT.tokenOfOwnerByIndex(user1.address, 0);
      let previousTokenID = tokenID;
      let tx2 = await assetNFT
        .connect(user1)
        .approve(nftBurner.address, availableTokenIDs[0]);
      await tx2.wait();
      tx2 = await mockHooks.turnOnAfterHook();
      await tx2.wait();
      const input = { tokenID: availableTokenIDs[0], owner: user1.address };
      tx2 = await assetNFT.connect(nftBurner).burn(input);
      await tx2.wait();
      const isCalled = await mockHooks.afterBurnHookRan();
      expect(isCalled).to.be.true;
    });
  });
});
