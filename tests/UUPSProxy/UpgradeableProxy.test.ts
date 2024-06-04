import { ethers } from "hardhat";
import { DeploymentUtils } from "../../scripts/DeploymentUtils";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { MockUUPSLogic } from "../../typechain-types/contracts/mocks/UUPSProxy/MockUUPSLogic";
import { MockUUPSLogicV2 } from "../../typechain-types/contracts/mocks/UUPSProxy/MockUUPSLogicV2";
import { expect } from "chai";
import { HARDHAT_CHAIN_ID } from "../constants";
describe("UUPSProxy", () => {
  let admin: SignerWithAddress;
  let badActor: SignerWithAddress;
  let mockUUPS: MockUUPSLogic;
  let mockUUPSV2: MockUUPSLogicV2;
  let chainID: bigint;
  let deployer: DeploymentUtils;
  beforeEach(async () => {
    chainID = (await ethers.provider.getNetwork()).chainId;
    [admin, badActor] = await ethers.getSigners();
    deployer = new DeploymentUtils(
      true,
      ethers,
      undefined,
      true,
      undefined,
      admin.address
    );
    // deploy UUPSProxy with mock logic
    const proxyData = await deployer.deployUUPSContract(
      "MockUUPSLogic",
      [],
      [],
      admin.address
    );
    mockUUPS = await ethers.getContractAt(
      "MockUUPSLogic",
      proxyData.proxyAddress
    );
    expect(await mockUUPS.call1()).to.equal(1);
  });

  it("should allow admin to upgrade logic contract", async () => {
    let proxyData = await deployer.upgradeUUPSContract(
      "MockUUPSLogic",
      "MockUUPSLogicV2",
      admin.address,
      await mockUUPS.getAddress(),
      [],
      [],
      BigInt(100000)
    );
    mockUUPSV2 = await ethers.getContractAt(
      "MockUUPSLogicV2",
      proxyData.proxyAddress
    );
    // check if logic contract is upgraded
    expect(await mockUUPSV2.call2()).to.equal(2);
  });

  it("should not allow non-admin to upgrade logic contract", async () => {
    const mockUUPSLogicV2Base = await ethers.getContractFactory(
      "MockUUPSLogicV2"
    );
    const mockUUPSLogicV2 = await mockUUPSLogicV2Base.deploy();
    const tx = mockUUPS
      .connect(badActor)
      .upgradeTo(mockUUPSLogicV2.getAddress());
    await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
