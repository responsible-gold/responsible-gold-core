import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { deployGenericToken } from "../setup";
import { DEFAULT_ADMIN_ROLE } from "../constants";
import { GenericToken, MockAssetNFT } from "../../typechain-types";
import { GenericTokenConfigStruct } from "../../typechain-types/contracts/ERC20/GenericToken";

describe("GenericToken initialize tests", () => {
  let token: GenericToken;
  let assetGovernor: SignerWithAddress;
  let admin: SignerWithAddress;
  let minter: SignerWithAddress;
  let burner: SignerWithAddress;
  let feeCollector: SignerWithAddress;
  let testHook: SignerWithAddress;
  let user: SignerWithAddress;
  let mockAssetNFT: MockAssetNFT;
  let mockAssetNFTAddress: string;
  const tokenID = 1;
  async function deployFixture() {
    [assetGovernor, admin, minter, burner, feeCollector, user, testHook] =
      await ethers.getSigners();
    // deploy mock erc721
    const mockAssetNFTBase = await ethers.getContractFactory("MockAssetNFT");
    const mockAssetNFTDeployTx = await mockAssetNFTBase.deploy();
    await mockAssetNFTDeployTx.waitForDeployment();
    mockAssetNFTAddress = await mockAssetNFTDeployTx.getAddress();
    mockAssetNFT = await ethers.getContractAt(
      "MockAssetNFT",
      mockAssetNFTAddress
    );

    token = await deployGenericToken("GenericToken");
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("initialize", async () => {
    it("should fail to initialize twice", async () => {
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
      const tx = await token.initialize(tokenConfig);
      const tx2 = token.initialize(tokenConfig);
      await expect(tx2).to.be.revertedWith(
        "Initializable: contract is already initialized"
      );
    });

    it("should check if contract is initialized properly", async () => {
      const tokenConfig = {
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
      const tx = await token.initialize(tokenConfig);
      const decimal = await token.decimals();
      expect(decimal).to.be.equal(tokenConfig.decimals);
      const expectedAdmin = await token.admin();
      expect(expectedAdmin).to.be.equal(tokenConfig.admin);
      const actualFeeCollector = await token.feeCollector();
      expect(actualFeeCollector).to.be.equal(tokenConfig.feeCollector);
      const assetNFTAddress = await token.assetNFT();
      expect(assetNFTAddress).to.be.equal(tokenConfig.assetNFT);
    });
    it("should fail to initialize with zero admin address", async () => {
      const tokenConfig: GenericTokenConfigStruct = {
        name: "TestToken",
        symbol: "TEST",
        decimals: 18,
        feeCollector: ethers.ZeroAddress,
        transferHook: ethers.ZeroAddress,
        mintHook: ethers.ZeroAddress,
        burnHook: ethers.ZeroAddress,
        admin: ethers.ZeroAddress,
        assetNFT: mockAssetNFTAddress,
        feePercent: 0,
        assetGovernor: assetGovernor.address,
      };
      const tx = token.initialize(tokenConfig);
      await expect(tx).to.be.revertedWith("AccessControl: 0 default admin");
    });

    it("should fail to initialize with AssetNFT address as zeroAddress", async () => {
      const tokenConfig: GenericTokenConfigStruct = {
        name: "TestToken",
        symbol: "TEST",
        decimals: 18,
        feeCollector: ethers.ZeroAddress,
        transferHook: ethers.ZeroAddress,
        mintHook: ethers.ZeroAddress,
        burnHook: ethers.ZeroAddress,
        admin: admin.address,
        assetNFT: ethers.ZeroAddress,
        feePercent: 0,
        assetGovernor: assetGovernor.address,
      };
      const tx = token.initialize(tokenConfig);
      await expect(tx).to.be.revertedWithCustomError(
        token,
        "MissingAssetNFTAddress"
      );
    });

    it("should fail to initialize with zero asset governor address", async () => {
      const tokenConfig: GenericTokenConfigStruct = {
        name: "TestToken",
        symbol: "TEST",
        decimals: 18,
        feeCollector: ethers.ZeroAddress,
        transferHook: ethers.ZeroAddress,
        mintHook: ethers.ZeroAddress,
        burnHook: ethers.ZeroAddress,
        admin: admin.address,
        assetNFT: mockAssetNFTAddress,
        feePercent: 0,
        assetGovernor: ethers.ZeroAddress,
      };
      const tx = token.initialize(tokenConfig);
      await expect(tx).to.be.revertedWithCustomError(
        token,
        "MissingAssetGovernorAddress"
      );
    });

    it("should initialize with mint, burn and transfer hooks", async () => {
      const tokenConfig: GenericTokenConfigStruct = {
        name: "TestToken",
        symbol: "TEST",
        decimals: 18,
        feeCollector: feeCollector.address,
        transferHook: await testHook.address,
        mintHook: await testHook.address,
        burnHook: await testHook.address,
        admin: admin.address,
        assetNFT: mockAssetNFTAddress,
        feePercent: 0,
        assetGovernor: assetGovernor.address,
      };
      const tx = await token.initialize(tokenConfig);
      const actualTransferHook = await token.transferHook();
      expect(actualTransferHook).to.be.equal(await testHook.address);
      const actualMintHook = await token.mintHook();
      expect(actualMintHook).to.be.equal(await testHook.address);
      const actualBurnHook = await token.burnHook();
      expect(actualBurnHook).to.be.equal(await testHook.address);
    });
  });
});
