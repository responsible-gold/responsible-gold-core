#!/bin/bash

npm install &&
npx hardhat compile &&

network="dev"
# deploy factories
output=$(npx hardhat deploy-factories --deployer-address 0x546F99F244b7B58B855330AE0E2BC1b30b41302F \
 --rg-factory-owner 0x546F99F244b7B58B855330AE0E2BC1b30b41302F \
  --erc20-factory-owner 0x9AC1c9afBAec85278679fF75Ef109217f26b1417 \
   --erc721-factory-owner 0x9AC1c9afBAec85278679fF75Ef109217f26b1417 --test --network dev) &&

# Find the line that starts with "info: Deployed RGFactory at"
rg_factory_line=$(echo "$output" | grep "^info: Deployed RGFactory at") &&

# Extract the address from the line
rg_factory_address=$(echo "$rg_factory_line" | awk '{print $5}') &&

echo $output &&
# Print the extracted address
echo "The RGFactory contract address is: $rg_factory_address" &&

# deploy gcoin contracts
npx hardhat deploy-gcoin-contracts --deployer-address 0x546F99F244b7B58B855330AE0E2BC1b30b41302F \
--rg-factory-address $rg_factory_address \
--erc721-admin 0x9AC1c9afBAec85278679fF75Ef109217f26b1417 \
--erc721-minter 0x9AC1c9afBAec85278679fF75Ef109217f26b1417 \
--erc721-burner 0x9AC1c9afBAec85278679fF75Ef109217f26b1417 \
--erc721-metadata-operator 0x9AC1c9afBAec85278679fF75Ef109217f26b1417 \
--erc721-token-name "test g-coin assetnft" \
--erc721-token-symbol "TGCNFT" \
--erc721-base-token-uri "https://test-gcoin.com/" \
--erc20-admin 0x9AC1c9afBAec85278679fF75Ef109217f26b1417 \
--asset-governor 0x9AC1c9afBAec85278679fF75Ef109217f26b1417 \
--erc20-fee-collector 0x9AC1c9afBAec85278679fF75Ef109217f26b1417 \
--erc20-name "test g-coin" \
--erc20-symbol "TGC" \
--erc20-decimals 18 \
--erc20-fee-percentage 0.02 \
--test --network $network


