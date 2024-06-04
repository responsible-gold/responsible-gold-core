#!/bin/bash

npm install && npx hardhat compile &&

network="sepolia"
environment="dev"
assetGovernor="0x5974Da4854e770adA0FE8EA323c0dE1149014789"
gcoinRecipient="0x8174B301767D5e20bDD5523B55497043E95d5428"
tokenDataCsv=$1

# deploy factories
npx hardhat deploy-factories --signer-environment $environment --network $network | tee deploy_factories.log &&
# Find the line that starts with "info: Deployed RGFactory at"
rg_factory_line=$(cat deploy_factories.log | grep "^info: Deployed RGFactory at") &&

# Extract the address from the line
rg_factory_address=$(echo "$rg_factory_line" | awk '{print $5}') &&

# Print the extracted address
echo "The RGFactory contract address is: $rg_factory_address" &&

# deploy gcoin contracts
npx hardhat deploy-gcoin-contracts \
  --rg-factory-address $rg_factory_address \
  --asset-governor $assetGovernor \
  --erc721-token-name "Responsible Gold Asset NFT" \
  --erc721-token-symbol "XRG" \
  --erc721-base-token-uri "" \
  --erc20-name "Responsible Gold Coin" \
  --erc20-symbol "XGC" \
  --erc20-decimals 18 \
  --erc20-fee-percentage 0.02  `# this is in percentage form 0.002 = 0.002%`\
  --signer-environment $environment --network $network | tee deploy_gcoin_contracts.log &&

# Extract the AssetNFT address from the output
asset_nft_address=$(cat deploy_gcoin_contracts.log | grep "^AssetNFT Address: " | awk '{print $3}') &&

# Extract the AssetNFT Minter address from the output
nft_minter_address=$(cat deploy_gcoin_contracts.log | grep "^AssetNFT Minter: " | awk '{print $3}') &&


echo "The AssetNFT contract address is: $asset_nft_address" &&
echo "The AssetNFT Minter address is: $nft_minter_address" &&


# fund contract roles 
npx hardhat fund-contract-roles --asset-governor-address $assetGovernor \
--minter-cap 1 --burner-cap 0.25 --admin-cap 0.25 --asset-governor-cap 0.25 --fee-collector-cap 0.25 \
--metadata-operator-cap 0.25 --environment $environment --network $network  &&


# mint responsible gold asset nft

npx hardhat mint-asset-nfts --to $nft_minter_address \
--token-data-csv $tokenDataCsv \
--asset-nft-address $asset_nft_address \
--nft-minter-address $nft_minter_address --environment $environment --network $network &&

# mint responsible gold coin
npx hardhat convert-nfts-to-erc20 --nft-minter $nft_minter_address \
--asset-nft-address $asset_nft_address \
--token-recipient $gcoinRecipient --environment $environment --network $network
