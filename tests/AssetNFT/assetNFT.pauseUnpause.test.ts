import { expect } from "chai";
import { AssetNFT, ERC20Mock, MockERC20HookLogic } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { DEFAULT_ADMIN_ROLE, TEST_CHIP1 } from "../constants";
import { NFTTokenConfigStruct } from "../../typechain-types/contracts/ERC721/AssetNFT";
import { BigNumberish } from "ethers";
import { batchMintNFT } from "./setup";
import { ERC20 } from "../../typechain-types/@openzeppelin/contracts/token/ERC20/ERC20";
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
      metaDataOperator: metaDataOperator.address,
      baseURI: testBaseURI,
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
    it("should fail to transfer nft when paused", async () => {
      const tx = assetNFT.connect(admin).pause();
      await expect(tx).to.not.be.reverted;
      const transferTx = assetNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, availableTokenIDs[0]);
      await expect(transferTx).to.be.revertedWith(
        "ERC721Pausable: token transfer while paused"
      );
    });
    it("should fail to pause from non-admin account", async () => {
      const tx = assetNFT.connect(user1).pause();
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });
    it("should pause, then unpause and perform transfer", async () => {
      const tx = assetNFT.connect(admin).pause();
      await expect(tx).to.not.be.reverted;
      const tx2 = assetNFT.connect(admin).unpause();
      await expect(tx2).to.not.be.reverted;
      const transferTx = assetNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, availableTokenIDs[0]);
      await expect(transferTx).to.not.be.reverted;
    });

    it("should paused and fail to unpause as non-admin", async () => {
      const tx = assetNFT.connect(admin).pause();
      await expect(tx).to.not.be.reverted;
      const tx2 = assetNFT.connect(user1).unpause();
      await expect(tx2).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });
  });

  describe("mint", async () => {
    it("should fail to mint when paused", async () => {
      const tx = assetNFT.connect(admin).pause();
      await expect(tx).to.not.be.reverted;
      const mintInput: AssetNFT.MintInputStruct = {
        to: user1.address,
        erc20Value: 50,
        tokenURI: testTokenURI,
        chip: TEST_CHIP1,
      };
      const mintTx = assetNFT
        .connect(nftMinter)
        ["mint((address,uint256,string,string))"](mintInput);
      await expect(mintTx).to.be.revertedWith("Pausable: paused");
    });

    it("should unpause and mint", async () => {
      const tx = assetNFT.connect(admin).pause();
      await expect(tx).to.not.be.reverted;
      const tx2 = assetNFT.connect(admin).unpause();
      await expect(tx2).to.not.be.reverted;
      const mintInput: AssetNFT.MintInputStruct = {
        to: user1.address,
        erc20Value: 50,
        tokenURI: testTokenURI,
        chip: TEST_CHIP1,
      };
      const mintTx = assetNFT
        .connect(nftMinter)
        ["mint((address,uint256,string,string))"](mintInput);
      await expect(mintTx).to.not.be.reverted;
    });
  });
});
