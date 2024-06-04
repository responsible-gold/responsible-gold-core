import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { deployGenericToken } from "../setup";
import { DEFAULT_ADMIN_ROLE } from "../constants";
import { GenericToken, MockAssetNFT } from "../../typechain-types";
import { GenericTokenConfigStruct } from "../../typechain-types/contracts/ERC20/GenericToken";

describe("GenericToken mint, burn, and transfer tests", () => {
  let token: GenericToken;
  let deployer: SignerWithAddress;
  let admin: SignerWithAddress;
  let minter: SignerWithAddress;
  let burner: SignerWithAddress;
  let feeCollector: SignerWithAddress;
  let badActor: SignerWithAddress;
  let user: SignerWithAddress;
  let tokenConfig: GenericTokenConfigStruct;
  let mockAssetNFT: MockAssetNFT;
  const tokenID = 1;
  async function deployFixture() {
    [deployer, admin, minter, burner, feeCollector, user, badActor] =
      await ethers.getSigners();
    // deploy mock erc721
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
      transferHook: ethers.ZeroAddress,
      mintHook: ethers.ZeroAddress,
      burnHook: ethers.ZeroAddress,
      feeCollector: feeCollector.address,
      admin: admin.address,
      assetNFT: mockAssetNFTAddress,
      feePercent: 0,
      assetGovernor: deployer.address,
    };
    token = await deployGenericToken("GenericToken", tokenConfig);

    // mint assetNFT to user
    await mockAssetNFT.mint(ethers.parseEther("100"), tokenID, user.address);
    //mint asset nft to minter
    await mockAssetNFT.mint(ethers.parseEther("100"), 2, minter.address);
    // approve token to spend nft
    await mockAssetNFT.connect(user).approve(await token.getAddress(), tokenID);
    await token.connect(user)["mint(uint256)"](tokenID);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("pause", async () => {
    it("should fail to pause from non-admin account", async () => {
      const tx = token.connect(user).pause();
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${user.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });
    it("should fail to mint when paused", async () => {
      const tx = await token.connect(admin).pause();
      await tx.wait();
      const tx2 = token.connect(minter)["mint(uint256)"](2);
      await expect(tx2).to.be.revertedWith("Pausable: paused");
    });
    it("should fail to burn when paused", async () => {
      const tx = await token.connect(admin).pause();
      await tx.wait();
      const tx2 = token.connect(burner).burn(1);
      await expect(tx2).to.be.revertedWith("Pausable: paused");
    });
    it("should fail to transfer when paused", async () => {
      const tx = await token.connect(admin).pause();
      await tx.wait();
      const tx2 = token.connect(user).transfer(admin.address, 100);
      await expect(tx2).to.be.revertedWith(
        "ERC20Pausable: token transfer while paused"
      );
    });

    describe("unpause", async () => {
      it("should fail to unpause as bad actor", async () => {
        const tx = token.connect(badActor).unpause();
        await expect(tx).to.be.revertedWith(
          `AccessControl: account ${badActor.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
        );
      });

      it("should successfully unpause as admin", async () => {
        const tx = await token.connect(admin).pause();
        await tx.wait();
        const tx2 = await token.connect(admin).unpause();
        await tx2.wait();
        expect(await token.paused()).to.be.false;
      });
    });
  });
});
