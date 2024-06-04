import { task } from "hardhat/config";
import fs from "fs";
import * as readline from "readline";
import { SignerUtil } from "./SignerUtil";
import { getEnvVar } from "./Config";
import { promptUser } from "./Utils";
interface CSVRow {
  [key: string]: string;
}
task("mint-asset-nfts", "Mint tokens to the specified address")
  .addParam("to", "The address to mint the tokens to")
  .addParam(
    "tokenDataCsv",
    "The path to the CSV file containing the token data, the chip ID, and the token ID"
  )
  .addParam("assetNftAddress", "The address of the AssetNFT contract")
  .addParam("nftMinterAddress", "The address of the NFT minter contract")
  .addFlag("test", "flag for hardhat network testing")
  .addOptionalParam(
    "environment",
    "The environment to deploy the key from, ie: dev, prod, staging, or local"
  )
  .addOptionalParam("confirmations", "The number of confirmations to wait for")
  .setAction(async (args, hre) => {
    // Get the signer API endpoint from .env
    const signerAPI = getEnvVar(args.environment, "SIGNER_API_ENDPOINT");
    // Get the signer create API key from .env
    const signerCreatorAPIKey = getEnvVar(
      args.environment,
      "SIGNER_API_KEY_MINTER"
    );

    // Create a new instance of SignerUtil
    const signerUtil = new SignerUtil(
      signerAPI,
      signerCreatorAPIKey,
      args.test,
      hre.ethers
    );
    // connect to an instance of the AssetNFT contract
    const assetNFT = await hre.ethers.getContractAt(
      "AssetNFT",
      args.assetNftAddress
    );
    const erc20Address = await assetNFT.erc20TokenAddress();
    if (erc20Address === hre.ethers.ZeroAddress) {
      throw new Error("Invalid ERC20 token address");
    }
    // get an instance of the erc20 token contract
    const erc20 = await hre.ethers.getContractAt("GenericToken", erc20Address);
    // get the erc20 decimals value
    const erc20Decimals = await erc20.decimals();
    if (erc20Decimals === BigInt(0)) {
      throw new Error("Invalid ERC20 token decimals value");
    }
    // check if the to address is a valid ethereum address or not
    if (!hre.ethers.isAddress(args.to) || args.to === hre.ethers.ZeroAddress) {
      throw new Error(`Invalid address ${args.to}`);
    }

    // parse the CSV data
    const csvRows = parseCSV(args.tokenDataCsv);

    //get the address of the erc20 token contract

    // encode the mint input data
    const mintInputs = csvRows.map((row) => {
      // convert the erc20Value to the correct decimal format
      console.log("row.erc20Value", row.erc20Value);
      const erc20ValueWei = hre.ethers.parseUnits(
        row.erc20Value,
        erc20Decimals
      );

      return {
        to: args.to,
        erc20Value: erc20ValueWei,
        chip: row.chipID,
        tokenURI: row.chipID,
      };
    });
    let totalGasUsed = BigInt(0);
    // Prompt user to confirm the minting for each token
    for (const input of mintInputs) {
      console.log(`Minting token with chip ID: ${input.chip}`);
      console.log(
        `ERC20 value: ${input.erc20Value} wei (decimals: ${erc20Decimals})`
      );
      console.log(`Token URI: ${input.tokenURI}`);
      console.log(`Owner address: ${input.to}`);
      // Prompt user to confirm the minting
      const confirmed = await promptUser("Confirm minting?");
      if (!confirmed) {
        throw new Error(
          "Minting cancelled, fix the input csv file and try again"
        );
      }
    }
    const txResponse = await signerUtil.callContract(
      "AssetNFT",
      args.assetNftAddress,
      "mint((address,uint256,string,string)[])",
      [mintInputs],
      args.nftMinterAddress
    );
    // wait for the transaction to be mined
    const txReceipt = await txResponse.wait(args.confirmations);
    if (txReceipt === null) {
      throw new Error("Transaction failed");
    }
    // log the transaction receipt
    console.log(`Transaction hash: ${txReceipt.hash}`);
    console.log(`Block number: ${txReceipt.blockNumber}`);
    console.log(`Gas used: ${txReceipt.gasUsed.toString()}`);
    totalGasUsed += txReceipt.gasUsed;
    // log the minted token data
    txReceipt.logs.forEach(async (log) => {
      const topics = log.topics.map((topic) => topic);
      const event = assetNFT.interface.parseLog({
        topics: topics,
        data: log.data,
      });
      if (event !== null && event.name === "Transfer") {
        console.log(`minted Token ID: ${event.args.tokenId.toString()}`);
        if (event.args.to.toLowerCase() !== args.to.toLowerCase()) {
          console.error("owner address does not match input address");
        }
        console.log(`owner address: ${event.args.to}`);
        const tokenData = await assetNFT.getPositionData(event.args.tokenId);
        console.log(`chip ID: ${tokenData.erc20Value}`);
        console.log("token URI: ", tokenData.tokenURI);
      }
    });
    console.log(`Total gas used: ${totalGasUsed.toString()}`);
  });

function parseCSV(filePath: string, delimiter: string = ","): CSVRow[] {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const rows = fileContent.trim().split("\n");
  const headers = rows.shift()?.split(delimiter) || [];

  return rows.map((row) => {
    const values = row.split(delimiter);
    const rowObject: CSVRow = {};

    headers.forEach((header, index) => {
      rowObject[header.trim()] = values[index];
    });

    return rowObject;
  });
}
// hardhat task for converting all the minted nfts to erc20 tokens

task(
  "convert-nfts-to-erc20",
  "Convert all minted NFTs to ERC20 tokens or a specific NFT to ERC20 tokens"
)
  .addParam("nftMinter", "The address of the NFT owner")
  .addParam("assetNftAddress", "The address of the AssetNFT contract")
  .addParam("tokenRecipient", "The address to receive the ERC20 tokens")
  .addOptionalParam("tokenID", "The token ID of the NFT to convert")
  .addFlag("test", "flag for hardhat network testing")
  .addOptionalParam(
    "environment",
    "The environment to deploy the key from, ie: dev, prod, staging, or local only needed when not running in test mode"
  )
  .addOptionalParam(
    "confirmations",
    "The number of confirmations to wait for after sending the transaction"
  )
  .setAction(async (args, hre) => {
    // Get the signer API endpoint from .env
    const signerAPI = getEnvVar(args.environment, "SIGNER_API_ENDPOINT");
    // Get the signer create API key from .env
    const signerCreatorAPIKey = getEnvVar(
      args.environment,
      "SIGNER_API_KEY_MINTER"
    );

    // Create a new instance of SignerUtil
    const signerUtil = new SignerUtil(
      signerAPI,
      signerCreatorAPIKey,
      args.test,
      hre.ethers
    );
    // connect to an instance of the AssetNFT contract
    const assetNFT = await hre.ethers.getContractAt(
      "AssetNFT",
      args.assetNftAddress
    );
    const genericTokenAddress = await assetNFT.erc20TokenAddress();
    if (genericTokenAddress === hre.ethers.ZeroAddress) {
      throw new Error("Invalid ERC20 token address");
    }
    // get an instance of the erc20 token contract
    const genericToken = await hre.ethers.getContractAt(
      "GenericToken",
      genericTokenAddress
    );
    // get the balance of the nftOwner
    const balance = await assetNFT.balanceOf(args.nftMinter);
    // get all the token IDs owned by the nftOwner
    const tokenIDs: bigint[] = [];
    if (args.tokenID) {
      tokenIDs.push(args.tokenID);
    } else {
      for (let i = 0; i < balance; i++) {
        const tokenID = await assetNFT.tokenOfOwnerByIndex(args.nftMinter, i);
        tokenIDs.push(tokenID);
      }
    }
    // extract the token IDs from the positions
    let gasUsed = BigInt(0);
    let initialGCoinBalance = await genericToken.balanceOf(args.tokenRecipient);
    for (let i = 0; i < tokenIDs.length; i++) {
      const tokenID = tokenIDs[i];
      const tokenData = await assetNFT.getPositionData(tokenID);
      console.log(
        `converting token ID: ${tokenID} to ${tokenData.erc20Value} wei tokens`
      );
      console.log(`Token ID: ${tokenID}`);
      console.log(`Token URI: ${tokenData.tokenURI}`);
      // prompt user to confirm set approval
      let confirmed;
      confirmed = await promptUser(
        `approve ${genericTokenAddress} to spend the token ID: ${tokenID} for the nftMinter: ${args.nftMinter}\n`
      );
      if (!confirmed) {
        throw new Error("Approval cancelled");
      }
      // approve the generic token contract to spend the token ID
      let txResponse = await signerUtil.callContract(
        "AssetNFT",
        args.assetNftAddress,
        "approve(address,uint256)",
        [genericTokenAddress, tokenID],
        args.nftMinter
      );

      let txReceipt = await txResponse.wait(args.confirmations);
      if (txReceipt === null) {
        throw new Error("Transaction failed");
      }
      gasUsed += txReceipt.gasUsed;
      // prompt user to confirm the conversion
      confirmed = await promptUser("Confirm conversion? ");
      if (!confirmed) {
        throw new Error("Conversion cancelled");
      }
      // mint tokens to the tokenRecipient
      txResponse = await signerUtil.callContract(
        "GenericToken",
        genericTokenAddress,
        "mint(address,uint256)",
        [args.tokenRecipient, tokenID],
        args.nftMinter
      );
      // wait for the transaction to be mined
      txReceipt = await txResponse.wait(args.confirmations);
      if (txReceipt === null) {
        throw new Error("Transaction failed");
      }
      // log the transaction receipt
      console.log(
        `successfully converted token ID: ${tokenID} to ${tokenData.erc20Value} for ${args.tokenRecipient} `
      );
      console.log(`Transaction hash: ${txReceipt.hash}`);
      console.log(`Block number: ${txReceipt.blockNumber}`);
      console.log(`Gas used: ${txReceipt.gasUsed.toString()}`);
      // log the minted token data
      const recipientBal = await genericToken.balanceOf(args.tokenRecipient);
      gasUsed += txReceipt.gasUsed;
    }
    let finalGCoinBalance = await genericToken.balanceOf(args.tokenRecipient);
    console.log(
      `Minted ${
        finalGCoinBalance - initialGCoinBalance
      } xgc tokens, to address: ${args.tokenRecipient}`
    );
    console.log(`Total gas used: ${gasUsed.toString()}`);
  });
