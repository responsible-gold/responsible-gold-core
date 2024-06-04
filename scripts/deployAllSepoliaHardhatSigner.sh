#!/bin/bash
# must provide keys for the deployer, minter, in testPrivateKeys.json
npm install && npx hardhat compile &&

network="sepolia"
environment="local"
assetGovernor="0x5974Da4854e770adA0FE8EA323c0dE1149014789"
gcoinRecipient="0x8174B301767D5e20bDD5523B55497043E95d5428"
tokenDataCsv=$1

# deploy factories
npx hardhat deploy-factories --test --network $network \
--deployer-address "0xA012480DcAf123A3a744D89be21d385535e8fdD5" \
--rg-factory-owner "0xA012480DcAf123A3a744D89be21d385535e8fdD5" \
--erc20-factory-owner "0xA012480DcAf123A3a744D89be21d385535e8fdD5" \
--erc721-factory-owner "0xA012480DcAf123A3a744D89be21d385535e8fdD5" | tee deploy_factories.log &&
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
--erc721-token-symbol "RGANFT" \
--erc721-base-token-uri "" \
--erc20-name "Responsible Gold Coin" \
--erc20-symbol "XGC" \
--erc20-decimals 18 \
--erc20-fee-percentage 0.3  `# this is in percentage form 0.002 = 0.002%`\
--deployer-address 0xA012480DcAf123A3a744D89be21d385535e8fdD5 \
--erc721-admin 0x5Add5033905ad21A3867b37c50D2a5d33B6d7c89 \
--erc721-minter 0x4208D73C450229b5DCcEc48d57b3b6a88F0af0B5 \
--erc721-burner 0xef019fa8a8924392fd2A13Bf24eD71a288aC1591 \
--erc721-metadata-operator 0xBbaE6C295156aE9B82187275ABbEA9750a077b86 \
--erc20-admin 0x5Add5033905ad21A3867b37c50D2a5d33B6d7c89 \
--erc20-fee-collector 0x95CE4Ab39682913aDaA83cB7e8a745c06cD0F4a5 \
--test --network $network | tee deploy_gcoin_contracts.log &&

# Extract the AssetNFT address from the output
asset_nft_address=$(cat deploy_gcoin_contracts.log | grep "^AssetNFT Address: " | awk '{print $3}') &&

# Extract the AssetNFT Minter address from the output
nft_minter_address=$(cat deploy_gcoin_contracts.log | grep "^AssetNFT Minter: " | awk '{print $3}') &&


echo "The AssetNFT contract address is: $asset_nft_address" &&
echo "The AssetNFT Minter address is: $nft_minter_address" &&


# fund contract roles 
npx hardhat fund-contract-roles  --deployer-address 0xA012480DcAf123A3a744D89be21d385535e8fdD5 \
--minter-cap 0.5 --minter-address 0x4208D73C450229b5DCcEc48d57b3b6a88F0af0B5 \
--burner-cap 0.25 --burner-address 0xef019fa8a8924392fd2A13Bf24eD71a288aC1591 \
--asset-governor-cap 0.25 --asset-governor-address $assetGovernor \
--fee-collector-cap 0.25 --fee-collector-address 0x95CE4Ab39682913aDaA83cB7e8a745c06cD0F4a5 \
--test --network $network  &&


# mint responsible gold asset nft

npx hardhat mint-asset-nfts --to $nft_minter_address \
--token-data-csv $tokenDataCsv \
--asset-nft-address $asset_nft_address \
--nft-minter-address $nft_minter_address --test --network $network &&

# mint responsible gold coin
npx hardhat convert-nfts-to-erc20 --nft-minter $nft_minter_address \
--asset-nft-address $asset_nft_address \
--token-recipient $gcoinRecipient --test --network $network
