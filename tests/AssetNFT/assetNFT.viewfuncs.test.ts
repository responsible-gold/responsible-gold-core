import { expect } from "chai";
import { AssetNFT, MockERC20HookLogic } from "../../typechain-types";
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
  let user1: SignerWithAddress;
  let assetGovernor: SignerWithAddress;
  let admin: SignerWithAddress;
  let nftMinter: SignerWithAddress;
  let nftBurner: SignerWithAddress;
  let metaDataOperator: SignerWithAddress;
  let ERC20Address: SignerWithAddress;
  let assetNFT: AssetNFT;
  let mockHooks: MockERC20HookLogic;
  let availableTokenIDs: BigNumberish[];
  async function deployFixture() {
    [
      admin,
      user1,
      assetGovernor,
      nftMinter,
      nftBurner,
      metaDataOperator,
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

  it("should get a list of user positions when getUserPositions is called", async () => {
    const start = 0;
    let end = await assetNFT.balanceOf(user1.address);
    let userPositions = await assetNFT.getUserPositions(
      user1.address,
      start,
      end
    );
    expect(userPositions.length).to.equal(end);
  });
  it("should return the g-coin value of a nft when getTokenValue is called", async () => {
    const tokenId = availableTokenIDs[0];
    const value = await assetNFT.getTokenValue(tokenId);
    expect(Number(ethers.formatEther(value))).to.equal(10);
  });

  it("should fail to get user positions if end is larger than user balance", async () => {
    const start = 0;
    let end = await assetNFT.balanceOf(user1.address);
    end += BigInt(10);
    await expect(
      assetNFT.getUserPositions(user1.address, start, end)
    ).to.be.revertedWithCustomError(assetNFT, "InvalidRanges");
  });

  it("should fail to get user positions if start is larger than end", async () => {
    const start = 10;
    let end = 5;
    await expect(
      assetNFT.getUserPositions(user1.address, start, end)
    ).to.be.revertedWithCustomError(assetNFT, "InvalidRanges");
  });

  it("should fail to get user positions if start is equal to end", async () => {
    const start = 10;
    let end = 10;
    await expect(
      assetNFT.getUserPositions(user1.address, start, end)
    ).to.be.revertedWithCustomError(assetNFT, "InvalidRanges");
  });

  describe("supportsInterface", async () => {
    it("should return true for ERC721Enumerable interface", async () => {
      const result = await assetNFT.supportsInterface("0x780e9d63");
      expect(result).to.be.true;
    });
    it("should return true for AccessControlDefaultAdminRule interface", async () => {
      const result = await assetNFT.supportsInterface("0x31498786");
      expect(result).to.be.true;
    });
    it("should return false for unsupported interface", async () => {
      const result = await assetNFT.supportsInterface("0x12345678");
      expect(result).to.be.false;
    });
  });
});
