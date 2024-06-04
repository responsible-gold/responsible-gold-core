import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { ERC20Factory, MockERC20HookTarget } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

import { hook } from "../../typechain-types/contracts/libraries/access/targets";
import { expect } from "chai";

describe("ERC20HookTarget", () => {
  let hookTarget: MockERC20HookTarget;
  let deployer: SignerWithAddress;
  let ERC20HookLogic: SignerWithAddress;
  let ERC20HookLogic2: SignerWithAddress;
  async function deployFixture() {
    [deployer, ERC20HookLogic, ERC20HookLogic2] = await ethers.getSigners();
    const mockERC20HookTarget = await ethers.getContractFactory(
      "MockERC20HookTarget"
    );
    const hookTarget = await mockERC20HookTarget.deploy(ethers.ZeroAddress);
    return await hookTarget.waitForDeployment();
  }

  beforeEach(async () => {
    hookTarget = await loadFixture(deployFixture);
  });

  it("should successfully change ERC20HookTarget", async () => {
    const tx = await hookTarget.setERC20Hook(ERC20HookLogic.address);
    await expect(tx).to.emit(hookTarget, "ERC20HookChanged");
    const actualERC20Hook = await hookTarget.erc20Hook();
    expect(actualERC20Hook).to.equal(ERC20HookLogic.address);
  });

  it("should successfully lock ERC20HookLogic", async () => {
    const tx = await hookTarget.lockERC20Hook();
    await tx.wait();
    const isLocked = await hookTarget.erc20HookIsLocked();
    expect(isLocked).to.be.true;
  });

  it("should lock ERC20Hook and fail to change", async () => {
    const tx = await hookTarget.lockERC20Hook();
    await tx.wait();
    const tx2 = hookTarget.setERC20Hook(ERC20HookLogic2.address);
    await expect(tx2).to.be.revertedWithCustomError(
      hookTarget,
      "ERC20HookLocked"
    );
  });
});
