// import { expect } from "chai";
// import {
//   AllocationRegistry,
//   AssetNFT,
//   GenericToken,
// } from "../../typechain-types";
// import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
// import { GenericTokenConfigStruct } from "../../typechain-types/contracts/ERC20/GenericToken";
// import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import { ethers } from "hardhat";
// import { DeploymentUtils } from "../../scripts/DeploymentUtils";
// import { deployInternalFactories } from "../setup";
// import {
//   MINT_10GCOIN_AMOUNT,
//   MINT_KILOBAR_AMOUNT,
//   TEST_CHIP1,
//   TEST_CHIP2,
//   TEST_CHIP3,
//   TRANSFER_AMOUNT,
// } from "../constants";

// describe("G-coin", () => {
//   let token: GenericToken;
//   let user1: SignerWithAddress;
//   let user2: SignerWithAddress;
//   let admin: SignerWithAddress;
//   let nftMinter: SignerWithAddress;
//   let qenta: SignerWithAddress;
//   let allocationOperator: SignerWithAddress;
//   let feeCollector: SignerWithAddress;
//   let badActor: SignerWithAddress;
//   let tokenConfig: GenericTokenConfigStruct;
//   let deployer: DeploymentUtils;
//   let assetNFT: AssetNFT;
//   let gcoin: GenericToken;
//   // let allocationRegistry: AllocationRegistry;
//   const gCoinName = "Responsible Gold Token";
//   const gCoinSymbol = "GCoin";
//   const nftName = "Responsible Gold NFT";
//   const nftSymbol = "GCoinNFT";

//   const decimals = 18;
//   async function deployFixture() {
//     [
//       nftMinter,
//       admin,
//       feeCollector,
//       user1,
//       user2,
//       allocationOperator,
//       badActor,
//       qenta,
//     ] = await ethers.getSigners();
//     // deploy internal factories
//     deployer = await deployInternalFactories(admin.address);
//     // deploy asset nft
//     const nonce = await ethers.provider.getTransactionCount(
//       await deployer.rgFactory!.getAddress()
//     );
//     // const allocationRegAddress = await ethers.getCreateAddress({
//     //   from: await deployer.rgFactory!.getAddress(),
//     //   nonce: nonce + 1,
//     // });
//     const contracts = await deployer.deployInternalGcoinContracts(
//       nftMinter.address,
//       feeCollector.address,
//       allocationOperator.address,
//       admin.address,
//       nftName,
//       nftSymbol,
//       admin.address,
//       gCoinName,
//       gCoinSymbol,
//       decimals,
//       undefined,
//       undefined,
//       undefined,
//       true
//     );
//     assetNFT = contracts!.assetNFT;
//     gcoin = contracts!.erc20Token;
//     // allocationRegistry = contracts.allocationRegistry;
//     await mintTestNFT();
//   }

//   async function mintTestNFT() {
//     let tx = await assetNFT
//       .connect(nftMinter)
//       .mintWithERC20Tokens(qenta.address, MINT_KILOBAR_AMOUNT, TEST_CHIP1);
//     await tx.wait();
//     tx = await assetNFT
//       .connect(nftMinter)
//       .mintWithERC20Tokens(qenta.address, MINT_10GCOIN_AMOUNT, TEST_CHIP2);
//     await tx.wait();

//     tx = await gcoin.connect(qenta).transfer(user1.address, TRANSFER_AMOUNT);

//     await tx.wait();

//     tx = await assetNFT
//       .connect(nftMinter)
//       .mintWithoutERC20Tokens(qenta.address, MINT_10GCOIN_AMOUNT, TEST_CHIP3);

//     tx = await assetNFT
//       .connect(qenta)
//       .transferFrom(qenta.address, user1.address, 2);
//   }

//   beforeEach(async () => {
//     await loadFixture(deployFixture);
//   });

//   describe("deployment", async () => {
//     it("should check if asset nft is initialized properly", async () => {
//       const erc20Address = await assetNFT.getToken();
//       expect(erc20Address.toLowerCase()).to.be.equal(await gcoin.getAddress());
//     });

//     it("should check if gcoin is initialized properly", async () => {
//       const actualDecimals = await gcoin.decimals();
//       expect(actualDecimals).to.be.equal(decimals);
//       const actualName = await gcoin.name();
//       expect(actualName).to.be.equal(gCoinName);
//       const actualSymbol = await gcoin.symbol();
//       expect(actualSymbol).to.be.equal(gCoinSymbol);
//       const actualFeeCollector = await gcoin.feeCollector();
//       expect(actualFeeCollector.toLowerCase()).to.be.equal(
//         feeCollector.address.toLowerCase()
//       );
//       const actualAdmin = await gcoin.admin();
//       expect(actualAdmin).to.be.equal(await admin.address);
//       const actualTransferHook = await gcoin.getTransferHook();
//     });

//     it("should check if allocation registry is initialized properly", async () => {});

//     // it("");
//   });

//   describe("minting", async () => {
//     it("should allow the minter role to mint an NFT with G-coins", async () => {});
//     it("should allow the minter role to mint an NFT without G-coins", async () => {});
//   });

//   describe("batchMint", async () => {
//     it("should allow the minter role to mint multiple NFTs with G-coins", async () => {});
//     it("should allow the minter role to mint multiple NFTs without G-coins", async () => {});
//   });

//   describe("external hooks", async () => {
//     it("should transfer with external hooks without after hook", async () => {});
//     it("should mint with external hooks without after hook", async () => {});
//     it("should burn with external hooks without after hook", async () => {});
//     it("should transfer with external hooks with after hook", async () => {});
//     it("should mint with external hooks with after hook", async () => {});
//     it("should burn with external hooks with after hook", async () => {});
//   });
// });
