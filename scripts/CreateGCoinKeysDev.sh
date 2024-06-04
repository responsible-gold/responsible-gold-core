#!/bin/bash

environment="dev"
npx hardhat create-key \
--description "this key is used only for deploying smart contracts" \
--alias "main-deployer" \
--environment $environment 'MAIN_DEPLOYER'

# Create a key for the asset nft minter role 
npx hardhat create-key \
--description "this key is used for the minter role on responsible gold asset nft " \
--alias "responsible-gold-asset-nft-minter" \
--environment $environment 'RESPONSIBLE_GOLD_ASSET_NFT_MINTER'

# Create a key for the asset nft burner role
npx hardhat create-key \
--description "this key is used for the burner role on responsible gold asset nft" \
--alias "responsible-gold-asset-nft-burner" \
--environment $environment 'RESPONSIBLE_GOLD_ASSET_NFT_BURNER'

# Create a key for the admin role for the responsible gold asset nft, responsible gold coin, and responsible gold factory 
npx hardhat create-key \
--description "this key is used for the admin role on responsible gold asset nft, responsible gold coin, and responsible gold factory" \
--alias "responsible-gold-admin" \
--environment $environment 'RESPONSIBLE_GOLD_ADMIN'

# Create a key for the G-coin fee collector role
npx hardhat create-key \
--description "this key is used for the fee collector role on the G-coin contract" \
--alias "g-coin-fee-collector" \
--environment $environment 'G_COIN_FEE_COLLECTOR'

# Create a key for responsible gold metadata operator role
npx hardhat create-key \
--description "this key is used for the metadata operator role on responsible gold asset nft" \
--alias "responsible-gold-metadata-operator" \
--environment $environment 'RESPONSIBLE_GOLD_METADATA_OPERATOR'

# Create a key for the trade bot
npx hardhat create-key \
--description "this key is used for the trade bot we will also use this key to initialize the uniswap pools" \
--alias "trade-bot" \
--environment $environment 'TRADE_BOT'

