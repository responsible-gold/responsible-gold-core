import { expect } from "chai";
import { AssetNFT, ERC20Mock, MockERC20HookLogic } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { TEST_CHIP1 } from "../constants";
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
  let assetGovernor: SignerWithAddress;
  let admin: SignerWithAddress;
  let nftMinter: SignerWithAddress;
  let nftBurner: SignerWithAddress;
  let metaDataOperator: SignerWithAddress;
  let ERC20Address: SignerWithAddress;
  let assetNFT: AssetNFT;
  let mockHooks: MockERC20HookLogic;
  // let allocationRegistry: AllocationRegistry;
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

  describe("changeTokenURI", () => {
    it("should successfully change the tokenURI as the metaDataOperator", async () => {
      const tokenId = availableTokenIDs[0];
      const newTokenURI = ethers.solidityPackedKeccak256(
        ["string"],
        ["newURI"]
      );
      const input: AssetNFT.ChangeTokenURIInputStruct = {
        tokenId,
        newTokenURI,
      };
      await assetNFT.connect(metaDataOperator).changeTokenURI(input);
      const tokenURI = await assetNFT.tokenURI(tokenId);
      expect(await assetNFT.tokenURI(tokenId)).to.equal(
        testBaseURI + newTokenURI
      );
    });
    it("should fail to change the tokenURI as a non-metaDataOperator", async () => {
      const tokenId = availableTokenIDs[0];
      const newTokenURI = ethers.solidityPackedKeccak256(
        ["string"],
        ["newURI"]
      );
      const input: AssetNFT.ChangeTokenURIInputStruct = {
        tokenId,
        newTokenURI,
      };
      const tx = assetNFT.connect(user1).changeTokenURI(input);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${await assetNFT.META_DATA_OPERATOR_ROLE()}`
      );
    });
  });
  describe("changeTokenURIBatch", () => {
    it("it should successfully change the tokenURI for multiple tokens as the metaDataOperator", async () => {
      const tokenIds = availableTokenIDs.slice(0, 3);
      const newTokenURI = ethers.solidityPackedKeccak256(
        ["string"],
        ["newURI"]
      );
      const input: AssetNFT.ChangeTokenURIInputStruct[] = tokenIds.map(
        (tokenId) => {
          return {
            tokenId,
            newTokenURI,
          };
        }
      );
      await assetNFT.connect(metaDataOperator).changeTokenURIBatch(input);
      for (const tokenId of tokenIds) {
        expect(await assetNFT.tokenURI(tokenId)).to.equal(
          testBaseURI + newTokenURI
        );
      }
    });

    it("it should fail to change the tokenURI for multiple tokens as a non-metaDataOperator", async () => {
      const tokenIds = availableTokenIDs.slice(0, 3);
      const newTokenURI = ethers.solidityPackedKeccak256(
        ["string"],
        ["newURI"]
      );
      const input: AssetNFT.ChangeTokenURIInputStruct[] = tokenIds.map(
        (tokenId) => {
          return {
            tokenId,
            newTokenURI,
          };
        }
      );
      const tx = assetNFT.connect(user1).changeTokenURIBatch(input);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user1.address.toLowerCase()} is missing role ${await assetNFT.META_DATA_OPERATOR_ROLE()}`
      );
    });
  });
});
