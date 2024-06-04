import { ethers } from "hardhat";
export const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
export const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));
export const META_DATA_OPERATOR_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("META_DATA_OPERATOR_ROLE")
);
export const ASSET_GOVERNOR_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("ASSET_GOVERNOR_ROLE")
);
export const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const FEE_COLLECTOR_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("FEE_COLLECTOR_ROLE")
);
export const HARDHAT_CHAIN_ID = 1337;
export const APPROVED_EXTERNAL_CHAIN_ID = 138;
export const INVALID_EXTERNAL_CHAIN_ID = 999;
export const FEE_PERCENTAGE = 50; //
export const MINT_KILOBAR_AMOUNT = ethers.parseEther("1000");
export const MINT_10GCOIN_AMOUNT = ethers.parseEther("10");
export const TRANSFER_AMOUNT = ethers.parseEther("10");
export const TEST_CHIP1 =
  "0xdeeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbee";
export const TEST_CHIP2 =
  "0xbaddadbadbadadbadbadadbadbadadbadbadadbadbadadbadbadadbadadbadad";

export const TEST_CHIP3 =
  "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef";
export const MINT_AMOUNT = ethers.parseEther("10");
