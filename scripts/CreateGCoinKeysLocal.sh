#!/bin/bash


npx hardhat create-key \
--description "this key is used only for deploying smart contracts, and owns rg factory" \
--alias "main-deployer" \
--environment local

# Create a key for the asset nft minter role 
npx hardhat create-key \
--description "this key is used for the minter role on responsible gold asset nft" \
--alias "responsible-gold-asset-nft-minter" \
--environment local

# Create a key for the asset nft burner role
npx hardhat create-key \
--description "this key is used for the burner role on responsible gold asset nft" \
--alias "responsible-gold-asset-nft-burner" \
--environment local

# Create a key for the admin role for the responsible gold asset nft, responsible gold coin, and responsible gold factory 
npx hardhat create-key \
--description "this key is used for the admin role on responsible gold asset nft, responsible gold coin, and responsible gold factory" \
--alias "responsible-gold-admin" \
--environment local

# Create a key for the G-coin fee collector role
npx hardhat create-key \
--description "this key is used for the fee collector role on the G-coin contract" \
--alias "g-coin-fee-collector" \
--environment local

# Create a key for responsible gold metadata operator role
npx hardhat create-key \
--description "this key is used for the metadata operator role on responsible gold asset nft" \
--alias "responsible-gold-metadata-operator" \
--environment local

# Create a key for the trade bot
npx hardhat create-key \
--description "this key is used for the trade bot we will also use this key to initialize the uniswap pools" \
--alias "trade-bot" \
--environment local

