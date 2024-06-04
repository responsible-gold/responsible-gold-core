import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ERC20Factory } from "../../typechain-types";
import { DeploymentUtils } from "../../scripts/DeploymentUtils";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { GenericTokenConfigStruct } from "../../typechain-types/contracts/ERC20/GenericToken";
import { HARDHAT_CHAIN_ID } from "../constants";
import { deployInternalFactories } from "../setup";
describe("ERC20Factory", () => {
  let factory: ERC20Factory;
  let rgFactory: SignerWithAddress;
  let owner: SignerWithAddress;
  let testFactory: SignerWithAddress;
  let badActor: SignerWithAddress;
  let newLogicAddress: string;

  let deployer: DeploymentUtils;
  async function deployFixture() {
    [owner, rgFactory, testFactory, badActor] = await ethers.getSigners();
    deployer = await deployInternalFactories(owner.address);
    if (deployer.erc20TokenFactory === undefined) {
      throw new Error("failed to deploy ERC20Factory");
    }
    const ERC20FactoryBase = await ethers.getContractFactory("ERC20Factory");
    const erc20Factory = await ERC20FactoryBase.deploy();
    newLogicAddress = await erc20Factory.getAddress();
    factory = deployer.erc20TokenFactory;
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("deploy", async () => {
    it("should fail to deploy new token as non-factory", async () => {
      let salt = ethers.solidityPackedKeccak256(["string"], ["GCoin"]);
      const tx = factory.connect(badActor).deploy(salt);
      await expect(tx)
        .to.be.revertedWithCustomError(factory, "NotFactory")
        .withArgs(badActor.address);
    });

    it("should deploy new token as rgFactory", async () => {
      const salt = await factory.calcSalt("GC");
      const initialNumContracts = await factory.numDeployedContracts();
      await factory.connect(owner).changeFactory(rgFactory.address);
      const tx = factory.connect(rgFactory).deploy(salt);
      const expectedAddress = await factory.addressFor(salt);
      expect(tx).to.emit(factory, "DeployedContract").withArgs(expectedAddress);
      const actualNumContracts = await factory.numDeployedContracts();
      expect(actualNumContracts).to.equal(initialNumContracts + BigInt(1));
      const actualAddress = await factory.getDeployedContracts(
        initialNumContracts,
        actualNumContracts
      );
      expect(actualAddress[0]).to.equal(expectedAddress);
    });
  });

  describe("upgrade", async () => {
    it("should fail to upgrade logic as bad actor", async () => {
      const tx = factory.connect(badActor).upgradeTo(badActor.address);
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should successfully upgrade logic as admin", async () => {
      const tx = factory.connect(owner).upgradeTo(newLogicAddress);
      await expect(tx).to.emit(factory, "Upgraded").withArgs(newLogicAddress);
    });
  });

  describe("admin functions", async () => {
    it("should change factory as owner", async () => {
      const tx = await factory
        .connect(owner)
        .changeFactory(testFactory.address);
      const actualFactory = await factory.rgFactory();
      expect(actualFactory).to.equal(testFactory.address);
    });
    it("should fail to change factory as non-owner", async () => {
      const tx = factory.connect(badActor).changeFactory(testFactory.address);
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("upgradeTo", async () => {
    it("should allow owner to upgrade the factory logic", async () => {
      const tx = factory.connect(owner).upgradeTo(newLogicAddress);
      await expect(tx).to.emit(factory, "Upgraded").withArgs(newLogicAddress);
    });
    it("should fail to upgrade the factory logic as non-owner", async () => {
      const tx = factory.connect(badActor).upgradeTo(newLogicAddress);
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("view functions", async () => {
    it("should return a bytes32 keccak hash of the token symbol", async () => {
      const tokenSymbol = "GC";
      const expectedHash = ethers.solidityPackedKeccak256(
        ["string"],
        [tokenSymbol]
      );
      const actualHash = await factory.calcSalt(tokenSymbol);
      expect(actualHash).to.equal(expectedHash);
    });

    it("should fail to get deployed contracts with start equal to end", async () => {
      const tx = factory.getDeployedContracts(0, 0);
      await expect(tx).to.be.revertedWithCustomError(factory, "InvalidRange");
    });

    it("should fail to get deployed contracts with start greater than end", async () => {
      const tx = factory.getDeployedContracts(1, 0);
      await expect(tx).to.be.revertedWithCustomError(factory, "InvalidRange");
    });

    it("should fail to get deployed contracts with start greater than length", async () => {
      const salt = await factory.calcSalt("GC");
      const initialNumContracts = await factory.numDeployedContracts();
      await factory.connect(owner).changeFactory(rgFactory.address);
      const tx = factory.connect(rgFactory).deploy(salt);
      const expectedAddress = await factory.addressFor(salt);
      expect(tx).to.emit(factory, "DeployedContract").withArgs(expectedAddress);
      const numContracts = await factory.numDeployedContracts();
      const tx2 = factory.getDeployedContracts(0, numContracts + BigInt(1));
      await expect(tx2).to.be.revertedWithCustomError(factory, "InvalidRange");
    });
  });
});
