import { expect } from "chai";
import { AssetNFT, ERC20Mock, MockERC20HookLogic } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { TEST_CHIP1 } from "../constants";
import { NFTTokenConfigStruct } from "../../typechain-types/contracts/ERC721/AssetNFT";
import { BigNumberish } from "ethers";
import { batchMintNFT } from "./setup";
describe("AssetNFT mint", () => {
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

  describe("transfer", async () => {
    it("should transfer a token owned by a caller without calling hooks", async () => {
      let tx = await assetNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, availableTokenIDs[0]);
      await tx.wait();
      const owner = await assetNFT.ownerOf(availableTokenIDs[0]);
      expect(owner).to.equal(user2.address);
    });
    it("should transfer a token owned by caller and call before hook without calling after hook", async () => {
      let tx = await assetNFT
        .connect(admin)
        .setExtTransferHook(await mockHooks.getAddress());
      await tx.wait();
      tx = await assetNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, availableTokenIDs[0]);
      await tx.wait();
      const isCalled = await mockHooks.afterTransferHookRan();
      expect(isCalled).to.be.false;
      expect(await mockHooks.beforeTransferFrom()).to.equal(user1.address);
    });

    it("should transfer a token owned by caller and call before and after hook", async () => {
      let tx = await assetNFT
        .connect(admin)
        .setExtTransferHook(await mockHooks.getAddress());
      await tx.wait();
      tx = await mockHooks.turnOnAfterHook();
      await tx.wait();
      tx = await assetNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, availableTokenIDs[0]);
      await tx.wait();
      const isCalled = await mockHooks.afterTransferHookRan();
      expect(isCalled).to.be.true;
    });

    it("should succesfully transfer to smart contract with ERC721Receiver", async () => {
      // deploy mock erc721 receiver
      const mockReceiverBase = await ethers.getContractFactory(
        "MockERC721Receiver"
      );
      const mockReceiverDeployTx = await mockReceiverBase.deploy();
      await mockReceiverDeployTx.waitForDeployment();
      const mockReceiverAddress = await mockReceiverDeployTx.getAddress();
      const expectedBalance =
        (await assetNFT.balanceOf(mockReceiverAddress)) + BigInt(1);
      // transfer to receiver
      await assetNFT
        .connect(user1)
        ["safeTransferFrom(address,address,uint256)"](
          user1.address,
          mockReceiverAddress,
          availableTokenIDs[0]
        );
      // expect transaction to succeed
      const actualBalance = await assetNFT.balanceOf(mockReceiverAddress);
      expect(actualBalance).to.equal(expectedBalance);
    });
  });
});
