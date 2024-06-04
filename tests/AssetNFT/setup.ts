import { BigNumberish, ContractTransactionReceipt, ethers } from "ethers";
import { AssetNFT } from "../../typechain-types";
import { MINT_10GCOIN_AMOUNT } from "../constants";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

export async function batchMintNFT(
  length: number,
  to: string,
  initialChipId: string,
  assetNFT: AssetNFT,
  nftMinter: SignerWithAddress
): Promise<BigNumberish[]> {
  let inputs: AssetNFT.MintInputStruct[] = [];
  let chipID = initialChipId;
  const testTokenURI = ethers.solidityPackedKeccak256(["string"], ["test"]);
  for (let i = 0; i < length; i++) {
    chipID = ethers.keccak256(chipID);
    // get a unique chip
    inputs.push({
      chip: chipID,
      erc20Value: MINT_10GCOIN_AMOUNT,
      tokenURI: testTokenURI,
      to: to,
    });
  }
  const tx = await assetNFT
    .connect(nftMinter)
    ["mint((address,uint256,string,string)[])"](inputs);
  const receipt = (await tx.wait()) as ContractTransactionReceipt;
  const transferEventFragment = assetNFT.getEvent("Transfer").getFragment();
  // extract the token ids from the logs
  const tokenIDs = receipt.logs.map((log) => {
    const data = assetNFT.interface.decodeEventLog(
      transferEventFragment,
      log.data,
      log.topics
    );
    return data[2];
  });

  return tokenIDs;
}
