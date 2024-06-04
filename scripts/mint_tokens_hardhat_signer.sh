#!/bin/bash



# mint responsible gold asset nft
npx hardhat mint-asset-nfts --to 0x9ac1c9afbaec85278679ff75ef109217f26b1417 \
--token-data-csv $1 \
--asset-nft-address 0x957041eb390a1ff290a4a567dffa9733afcfceea \
--nft-minter-address 0x9ac1c9afbaec85278679ff75ef109217f26b1417 \
--test --network dev

# mint responsible gold coin
npx hardhat convert-nfts-to-erc20 --nft-minter 0x9ac1c9afbaec85278679ff75ef109217f26b1417 \
--asset-nft-address 0x957041eb390a1ff290a4a567dffa9733afcfceea \
--token-recipient 0x9ac1c9afbaec85278679ff75ef109217f26b1417 --test --network dev
