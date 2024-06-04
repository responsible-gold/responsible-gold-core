import { expect } from "chai";
import {
  AssetNFT,
  ERC20Mock,
  GenericToken,
  MockERC20HookLogic,
} from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { GenericTokenConfigStruct } from "../../typechain-types/contracts/ERC20/GenericToken";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import {
  MINTER_ROLE,
  MINT_10GCOIN_AMOUNT,
  TEST_CHIP1,
  TEST_CHIP2,
  TEST_CHIP3,
} from "../constants";
import { NFTTokenConfigStruct } from "../../typechain-types/contracts/ERC721/AssetNFT";
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
  let qenta: SignerWithAddress;
  let metaDataOperator: SignerWithAddress;
  let assetGovernor: SignerWithAddress;
  let badActor: SignerWithAddress;
  let nftBurner: SignerWithAddress;
  let ERC20Address: SignerWithAddress;
  let assetNFT: AssetNFT;
  let mockHooks: MockERC20HookLogic;
  // let allocationRegistry: AllocationRegistry;
  let erc20: ERC20Mock;
  async function deployFixture() {
    [
      admin,
      assetGovernor,
      user1,
      user2,
      metaDataOperator,
      badActor,
      qenta,
      nftMinter,
      nftBurner,
      ERC20Address,
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
    await batchMintNFT(100, user1.address, TEST_CHIP1, assetNFT, nftMinter);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("mint", () => {
    it("should successfully mint 100 nft as minter", async () => {
      await batchMintNFT(100, user2.address, TEST_CHIP2, assetNFT, nftMinter);
      const balance = await assetNFT.balanceOf(user2.address);
      expect(balance).to.equal(100);
    });
    it("should fail to mint as non-minter", async () => {
      const input = {
        to: qenta.address,
        erc20Value: MINT_10GCOIN_AMOUNT,
        tokenURI: testTokenURI,
        chip: TEST_CHIP3,
      };
      const tx = assetNFT
        .connect(badActor)
        ["mint((address,uint256,string,string))"](input);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${badActor.address.toLowerCase()} is missing role ${MINTER_ROLE}`
      );
    });
    it("should fail to batch mint as non-minter", async () => {
      const inputs: AssetNFT.MintInputStruct[] = [];
      for (let i = 0; i < 5; i++) {
        inputs.push({
          chip: ethers.solidityPackedKeccak256(["string"], [TEST_CHIP3 + i]),
          erc20Value: MINT_10GCOIN_AMOUNT,
          tokenURI: testTokenURI,
          to: qenta.address,
        });
      }
      const tx = assetNFT
        .connect(badActor)
        ["mint((address,uint256,string,string)[])"](inputs);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${badActor.address.toLowerCase()} is missing role ${MINTER_ROLE}`
      );
    });
    it("should mint a new NFT with a new chip", async () => {
      const input = {
        to: qenta.address,
        erc20Value: MINT_10GCOIN_AMOUNT,
        tokenURI: testTokenURI,
        chip: TEST_CHIP3,
      };
      const tokenID = await assetNFT.totalSupply();
      const tx = await assetNFT
        .connect(nftMinter)
        ["mint((address,uint256,string,string))"](input);
      expect(tx)
        .to.emit(assetNFT, "mintWithoutERC20Tokens")
        .withArgs(tokenID + BigInt(1), MINT_10GCOIN_AMOUNT, TEST_CHIP3);
    });
    it("should fail to mint with a used chip, and revert with custom error NFTAlreadyCreated", async () => {
      const chipID = ethers.solidityPackedKeccak256(["string"], [TEST_CHIP1]);
      const input = {
        to: qenta.address,
        erc20Value: MINT_10GCOIN_AMOUNT,
        tokenURI: testTokenURI,
        chip: TEST_CHIP1,
      };
      const tx1 = await assetNFT
        .connect(nftMinter)
        ["mint((address,uint256,string,string))"](input);
      await tx1.wait();
      // attempt to mint with the same chip
      const tx2 = assetNFT
        .connect(nftMinter)
        ["mint((address,uint256,string,string))"](input);
      await expect(tx2).to.be.revertedWith("ERC721: token already minted");
    });
    it("should fail to mint with 0 erc20 value, and revert with InvalidERC20Value", async () => {
      const input = {
        to: qenta.address,
        erc20Value: 0,
        tokenURI: testTokenURI,
        chip: TEST_CHIP3,
      };
      const tx = assetNFT
        .connect(nftMinter)
        ["mint((address,uint256,string,string))"](input);
      await expect(tx).to.be.revertedWithCustomError(
        assetNFT,
        "InvalidERC20Value"
      );
    });
    it("should run before mint hook and not after mint hook if afterhook is disabled", async () => {
      const tx = await assetNFT
        .connect(admin)
        .setExtMintHook(await mockHooks.getAddress());
      await tx.wait();
      const input = {
        to: qenta.address,
        erc20Value: MINT_10GCOIN_AMOUNT,
        tokenURI: testTokenURI,
        chip: TEST_CHIP3,
      };
      const tx2 = await assetNFT
        .connect(nftMinter)
        ["mint((address,uint256,string,string))"](input);
      await tx2.wait();
      // check if after mint hook was not called
      const isCalled = await mockHooks.afterMintHookRan();
      expect(isCalled).to.be.false;
      const beforeMintTo = await mockHooks.beforeMintTo();
      expect(beforeMintTo).to.equal(qenta.address);
    });
    it("should run after mint hook if afterhook is enabled", async () => {
      const tx = await assetNFT
        .connect(admin)
        .setExtMintHook(await mockHooks.getAddress());
      await tx.wait();
      const tx2 = await mockHooks.turnOnAfterHook();
      await tx2.wait();
      const input = {
        to: qenta.address,
        erc20Value: MINT_10GCOIN_AMOUNT,
        tokenURI: testTokenURI,
        chip: TEST_CHIP3,
      };
      const tx3 = await assetNFT
        .connect(nftMinter)
        ["mint((address,uint256,string,string))"](input);
      await tx3.wait();
      // check if after mint hook was called
      const isCalled = await mockHooks.afterMintHookRan();
      expect(isCalled).to.be.true;
    });
  });
});
