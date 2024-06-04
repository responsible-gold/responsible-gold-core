import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  EnumerableERC20,
  EnumerableERC20__factory,
  MockEnumerableERC20,
} from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("EnumerableERC20", () => {
  let enumerbleERC20: MockEnumerableERC20;

  async function deployFixture() {
    const mockEnumerableERC20Base = await ethers.getContractFactory(
      "MockEnumerableERC20"
    );
    const mockEnumerableERC20DeployTx = await mockEnumerableERC20Base.deploy();
    await mockEnumerableERC20DeployTx.waitForDeployment();
    const mockEnumerableERC20Address =
      await mockEnumerableERC20DeployTx.getAddress();
    enumerbleERC20 = await ethers.getContractAt(
      "MockEnumerableERC20",
      mockEnumerableERC20Address
    );
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });
  it("should initialize the contract correctly", async () => {
    expect(await enumerbleERC20.getTokenOwnerCount()).to.equal(0);
  });
  it("should update token owner list", async () => {
    // create a random wallet for from
    const from = ethers.Wallet.createRandom().address;
    // create a random wallet for to
    const to = ethers.Wallet.createRandom().address;
    const balance = BigInt(100);
    await enumerbleERC20.updateTokenOwnerList(from, to, balance, balance);
    expect(await enumerbleERC20.getTokenOwnerCount()).to.equal(1);
    expect(await enumerbleERC20.getTokenOwners(0, 1)).to.deep.equal([to]);
  });
  it("should remove token owner from list when balance is zero", async () => {
    // create a random wallet for from
    const from = ethers.Wallet.createRandom().address;
    // create a random wallet for to
    const to = ethers.Wallet.createRandom().address;
    const balance = BigInt(100);
    await enumerbleERC20.updateTokenOwnerList(
      ethers.ZeroAddress,
      from,
      0,
      balance
    );
    expect(await enumerbleERC20.getTokenOwnerCount()).to.equal(1);
    let tx = await enumerbleERC20.updateTokenOwnerList(
      from,
      ethers.ZeroAddress,
      BigInt(0),
      balance
    );
    await expect(tx)
      .to.emit(enumerbleERC20, "TokenOwnerRemoved")
      .withArgs(from);
    expect(await enumerbleERC20.getTokenOwnerCount()).to.equal(0);
  });

  it("should paginate token owner list", async () => {
    const expectedOwners = [];
    // add 20 token owners
    for (let i = 0; i < 20; i++) {
      const to = ethers.Wallet.createRandom().address;
      expectedOwners.push(to);
      await enumerbleERC20.updateTokenOwnerList(
        ethers.ZeroAddress,
        to,
        0,
        BigInt(100)
      );
    }
    // get the first 10 token owners
    const ownersSlice = await enumerbleERC20.getTokenOwners(0, 10);
    expect(ownersSlice.length).to.equal(10);
    expect(ownersSlice).to.deep.equal(expectedOwners.slice(0, 10));
  });
  it("should return token owner by index", async () => {
    const to = ethers.Wallet.createRandom().address;
    await enumerbleERC20.updateTokenOwnerList(
      ethers.ZeroAddress,
      to,
      0,
      BigInt(100)
    );
    expect(await enumerbleERC20.getTokenOwnerAtIndex(0)).to.equal(to);
  });
  it("should return all token owners when start is 0 and limit is greater than total token owners", async () => {
    const expectedOwners = [];
    // add 20 token owners
    for (let i = 0; i < 20; i++) {
      const to = ethers.Wallet.createRandom().address;
      expectedOwners.push(to);
      await enumerbleERC20.updateTokenOwnerList(
        ethers.ZeroAddress,
        to,
        0,
        BigInt(100)
      );
    }
    const totalOwners = await enumerbleERC20.getTokenOwnerCount();
    const start = 0;
    const limit = totalOwners + BigInt(1);
    const ownersSlice = await enumerbleERC20.getTokenOwners(start, limit);
    expect(ownersSlice.length).to.equal(totalOwners);
  });

  it("should return true if token owner is in list", async () => {
    const to = ethers.Wallet.createRandom().address;
    await enumerbleERC20.updateTokenOwnerList(
      ethers.ZeroAddress,
      to,
      0,
      BigInt(100)
    );
    expect(await enumerbleERC20.isTokenOwner(to)).to.be.true;
  });

  it("should return false if token owner is not in list", async () => {
    const to = ethers.Wallet.createRandom().address;
    expect(await enumerbleERC20.isTokenOwner(to)).to.be.false;
  });

  it("should paginate token owner list", async () => {
    const expectedOwners = [];
    // add 20 token owners
    for (let i = 0; i < 20; i++) {
      const to = ethers.Wallet.createRandom().address;
      expectedOwners.push(to);
      await enumerbleERC20.updateTokenOwnerList(
        ethers.ZeroAddress,
        to,
        0,
        BigInt(100)
      );
    }
    // get the first 10 token owners
    const ownersSlice = await enumerbleERC20.getTokenOwners(0, 10);
    expect(ownersSlice.length).to.equal(10);
    expect(ownersSlice).to.deep.equal(expectedOwners.slice(0, 10));
  });

  it("should return an empty list if start index is greater than total token owners", async () => {
    const totalOwners = await enumerbleERC20.getTokenOwnerCount();
    const start = totalOwners + BigInt(1);
    const limit = 5;
    const ownersSlice = await enumerbleERC20.getTokenOwners(start, limit);
    expect(ownersSlice.length).to.equal(0);
  });

  it("should return an empty list when start is equal to total token owners and limit is non-zero", async () => {
    const expectedOwners = [];
    // add 20 token owners
    for (let i = 0; i < 20; i++) {
      const to = ethers.Wallet.createRandom().address;
      expectedOwners.push(to);
      await enumerbleERC20.updateTokenOwnerList(
        ethers.ZeroAddress,
        to,
        0,
        BigInt(100)
      );
    }

    const totalOwners = await enumerbleERC20.getTokenOwnerCount();
    const start = totalOwners;
    const limit = 5;
    const ownersSlice = await enumerbleERC20.getTokenOwners(start, limit);
    expect(ownersSlice.length).to.equal(0);
  });

  it("should return an empty list when start is 0 and limit is 0", async () => {
    const ownersSlice = await enumerbleERC20.getTokenOwners(0, 0);
    expect(ownersSlice.length).to.equal(0);
  });
});
