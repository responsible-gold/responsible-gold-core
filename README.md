# Installation

** Node 18 must be installed**

```
npm install
```

install geth
sudo apt-get update
sudo apt-get install ethereum-unstable

# Running tests

```
npx hardhat test
npx hardhat coverage
```

# Setup .env file
only run this command once it will create a .env file in the root of the project
```bash
npm run setup-env
```

# Deploy contracts to local hardhat network using hardhat signers
No .env variables are required for this deployment
open a terminal and run
```bash
npx hardhat node
```

run the following commands in the root of the project to deploy the contracts to the local network
```bash
./scripts/deploy_factories_and_gcoin_contracts_test_HardhatSigner.sh
```

run the following commands in the root of the project to mint tokens to the accounts
```bash
./scripts/mint_tokens_hardhat_signer.sh
```


# Deploy contracts to local hardhat network using local remote signer

## Required .env variables

the following variables should be the jwt key for the local signer api
LOCAL_SIGNER_API_KEY_CREATOR
LOCAL_SIGNER_API_KEY_DEPLOYER
LOCAL_SIGNER_API_KEY_MINTER
LOCAL_SIGNER_API_KEY_BURNER
LOCAL_SIGNER_API_KEY_VIEWER

the following variable should be the endpoint of the local signer api
LOCAL_SIGNER_API_ENDPOINT="http://localhost:8800/"

open a terminal and run
```bash
npx hardhat node
```

run an instance of the signer locally

run the following commands in the root of the project

create contract role accounts
```bash
./scripts/CreateGCoinKeysLocal.sh
```

fund the deployer account with test ether
```bash
npx hardhat add-test-funds --network dev
```

deploy the contracts to the local network
```bash
./scripts/deploy_factories_and_gcoin_contracts_remoteSigner_local.sh
```

mint tokens to 

./scripts/mint_tokens_remote_signer_local.sh mintList.csv



# Sepolia Deployment Instructions

## setup .env variables
required variables are
SEPOLIA_RPC_HTTP_URL - the rpc endpoint of the sepolia node
DEV_SIGNER_API_ENDPOINT - the endpoint of the signer api
DEV_SIGNER_API_KEY_CREATOR - the JWT token with the creator role 
DEV_SIGNER_API_KEY_DEPLOYER - the JWT token with access to the deployer role key
DEV_SIGNER_API_KEY_MINTER - the JWT token with access to the minter role key


## create the accounts for the contract roles

1. create accounts for the contract roles
```bash
./scripts/CreateGCoinKeysDev.sh
```
2. fund the deployer account with 2 sepolia ether
3. run sepolia deploy script
```bash
./scripts/deployAllSepolia.sh
```
4. Verify contract role addresses with the actual addresses in the contract
5. update readme with the new contract addresses
6. run verification script


# Utils

list all the accounts in the signer server 

required env variables
DEV_SIGNER_API_KEY_VIEWER
npx hardhat list-keys --environment <dev>

## Sepolia Contract Addresses

RG Factory: 0xd9907f2E37Ff6178488288604DB180C3afa64C3D
https://sepolia.etherscan.io/address/0xd9907f2E37Ff6178488288604DB180C3afa64C3D#readProxyContract

ERC20Factory: 0xd4470c202169a97c01b9710a8c766688492a4a43
https://sepolia.etherscan.io/address/0xd4470c202169a97c01b9710a8c766688492a4a43#readProxyContract

ERC721Factory: 0xc48f7aa7f0226676879f4ba232e4b09f595590dd
https://sepolia.etherscan.io/address/0xc48f7aa7f0226676879f4ba232e4b09f595590dd#readProxyContract

Responsible Gold Coin: 0x2f54b59cfacc974f23083eda3563c4a7787c216a
https://sepolia.etherscan.io/address/0x2f54b59cfacc974f23083eda3563c4a7787c216a#readContract

Responsible Gold Asset NFT: 0x14fbe87337f03d67c6f133764b083deade51b982
https://sepolia.etherscan.io/address/0x14fbe87337f03d67c6f133764b083deade51b982#readContract