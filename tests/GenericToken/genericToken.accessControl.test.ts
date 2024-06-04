import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { deployGenericToken } from "../setup";
import { BURNER_ROLE, FEE_COLLECTOR_ROLE, MINTER_ROLE } from "../constants";
import { GenericToken, MockAssetNFT } from "../../typechain-types";
import { GenericTokenConfigStruct } from "../../typechain-types/contracts/ERC20/GenericToken";

describe("GenericTokenAccessControl", () => {
  let token: GenericToken;
  let assetGovernor: SignerWithAddress;
  let admin: SignerWithAddress;
  let minter: SignerWithAddress;
  let burner: SignerWithAddress;
  let feeCollector: SignerWithAddress;
  let badActor: SignerWithAddress;
  let tokenConfig: GenericTokenConfigStruct;
  let mockAssetNFT: MockAssetNFT;
  async function deployFixture() {
    [assetGovernor, admin, minter, burner, feeCollector, badActor] =
      await ethers.getSigners();
    const mockAssetNFTBase = await ethers.getContractFactory("MockAssetNFT");
    const mockAssetNFTDeployTx = await mockAssetNFTBase.deploy();
    await mockAssetNFTDeployTx.waitForDeployment();
    const mockAssetNFTAddress = await mockAssetNFTDeployTx.getAddress();
    mockAssetNFT = await ethers.getContractAt(
      "MockAssetNFT",
      mockAssetNFTAddress
    );
    tokenConfig = {
      name: "TestToken",
      symbol: "TEST",
      decimals: 18,
      feeCollector: feeCollector.address,
      transferHook: ethers.ZeroAddress,
      mintHook: ethers.ZeroAddress,
      burnHook: ethers.ZeroAddress,
      admin: admin.address,
      assetNFT: mockAssetNFTAddress,
      feePercent: 0,
      assetGovernor: assetGovernor.address,
    };
    return deployGenericToken("GenericToken", tokenConfig);
  }

  beforeEach(async () => {
    token = await loadFixture(deployFixture);
  });

  describe("lockFeeCollectorRole", async () => {
    it("should fail to lock fee collector role as bad actor", async () => {
      const defaultAdminRole = await token.DEFAULT_ADMIN_ROLE();
      const tx = token.connect(badActor).lockFeeCollector();
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${badActor.address.toLowerCase()} is missing role ${defaultAdminRole}`
      );
    });
    it("should successfully lock fee collector role as admin", async () => {
      token = token.connect(admin);
      const tx = await token.lockFeeCollector();
    });
  });
  describe("changeFeeCollector", async () => {
    it("should successfully lock fee collector role as admin", async () => {
      token = token.connect(admin);
      const tx = await token.lockFeeCollector();
    });
    it("should fail to change fee collector as bad actor", async () => {
      const defaultAdminRole = await token.DEFAULT_ADMIN_ROLE();
      const tx = token
        .connect(badActor)
        .changeFeeCollector(feeCollector.address);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${badActor.address.toLowerCase()} is missing role ${defaultAdminRole}`
      );
    });
    it("should successfully change fee collector", async () => {
      token = token.connect(admin);
      const tx = token.changeFeeCollector(feeCollector.address);
      expect(tx)
        .to.emit(token, "RoleGranted")
        .withArgs(FEE_COLLECTOR_ROLE, feeCollector.address, admin.address);
    });

    it("should fail to change fee collector if fee collector role is locked", async () => {
      token = token.connect(admin);
      const tx = await token.lockFeeCollector();
      await tx.wait();
      const tx2 = token.changeFeeCollector(feeCollector.address);
      await expect(tx2)
        .to.be.revertedWithCustomError(token, "RoleIsLocked")
        .withArgs(FEE_COLLECTOR_ROLE);
    });
  });
});
