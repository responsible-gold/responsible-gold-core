#!/bin/bash

npm install &&
npx hardhat compile &&

network="dev"
environment="local"
# deploy factories
output=$(npx hardhat deploy-factories \
   --signer-environment $environment --network $network) &&

# Find the line that starts with "info: Deployed RGFactory at"
rg_factory_line=$(echo "$output" | grep "^info: Deployed RGFactory at") &&

# Extract the address from the line
rg_factory_address=$(echo "$rg_factory_line" | awk '{print $5}') &&

echo $output &&
# Print the extracted address
echo "The RGFactory contract address is: $rg_factory_address" &&

# deploy gcoin contracts
npx hardhat deploy-gcoin-contracts \
--rg-factory-address $rg_factory_address \
--asset-governor 0x9AC1c9afBAec85278679fF75Ef109217f26b1417 \
--erc721-token-name "Responsible Gold Asset NFT" \
--erc721-token-symbol "RGANFT" \
--erc721-base-token-uri "https://test-gcoin.com/" \
--erc20-name "Responsible Gold Coin" \
--erc20-symbol "XGC" \
--erc20-decimals 18 \
--erc20-fee-percentage 0 \
--network $network \
--signer-environment $environment

