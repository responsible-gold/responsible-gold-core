#!/bin/bash

network="dev"
environment="local"
# fund minter account with native token for gas fees
npx hardhat fund-contract-roles --asset-governor-address 0x9ac1c9afbaec85278679ff75ef109217f26b1417 \
--minter-cap 1 --burner-cap 0.25 --admin-cap 0.25 --asset-governor-cap 0.25 --fee-collector-cap 0.25 \
--metadata-operator-cap 0.25 --network $network 
# fund asset nft burner account with native token for gas fees


# mint responsible gold asset nft

npx hardhat mint-asset-nfts --to 0x9ac1c9afbaec85278679ff75ef109217f26b1417 \
--token-data-csv $1 \
--asset-nft-address 0x75757e377093d5b8ccec5ac559777b4c285dfaa2 \
--nft-minter-address 0x9ac1c9afbaec85278679ff75ef109217f26b1417 \
--environment $environment --network $network

# mint responsible gold coin
npx hardhat convert-nfts-to-erc20 --nft-minter 0x9ac1c9afbaec85278679ff75ef109217f26b1417 \
--asset-nft-address 0x75757e377093d5b8ccec5ac559777b4c285dfaa2 \
--token-recipient 0x9ac1c9afbaec85278679ff75ef109217f26b1417 --environment $environment --network $network
