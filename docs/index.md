# Solidity API

## DecimalOveride

### _getDecimals

```solidity
function _getDecimals() internal view returns (uint8)
```

### _setDecimals

```solidity
function _setDecimals(uint8 decimals_) internal
```

## GenericTokenConfig

```solidity
struct GenericTokenConfig {
  string name;
  string symbol;
  uint8 decimals;
  address admin;
  address assetNFT;
  address assetGovernor;
  address transferHook;
  address mintHook;
  address burnHook;
  address feeCollector;
  uint24 feePercent;
}
```

## GenericToken

This is a generic token contract that can be used as is
for almost any ERC20 token specification.

_This token is designed to be extended through the calling of external
contracts during `_transfer`.

These external calls operate in the same manner as OpenZepplin's
hooks, but they allow the logic to exist outside the core token logic.
This allows for the core token logic to be immutable and for the
hook logic to be upgradeable. This hook logic has been optimalized
to only incur one additional SLOAD per transfer if no hook is used.
The hook logic address may be locked to prevent future upgrades.

If fees are collected, they are transfered to the custody of this
token contract and may be collected by the `feeCollector` role.

Further, the `mint` and `burn` functions are only callable by the
`minter` and `burner` roles respectively. These roles are also
upgradeable and are designed to be locked once the system is
mature. If it is desired that the end user be able to mint and
burn tokens, then the `minter` and `burner` roles should have public
functions that allow the user to call them for these purposes._

### FEE_COLLECTOR_ROLE

```solidity
bytes32 FEE_COLLECTOR_ROLE
```

### ASSET_GOVERNOR_ROLE

```solidity
bytes32 ASSET_GOVERNOR_ROLE
```

### _assetNFT

```solidity
contract IAssetNFT _assetNFT
```

### _assetNFTValueToTokenIds

```solidity
mapping(uint256 => uint256[]) _assetNFTValueToTokenIds
```

### _frozenAccounts

```solidity
mapping(address => bool) _frozenAccounts
```

### NoNFTWithValue

```solidity
error NoNFTWithValue(uint256 amount_)
```

### MissingAssetNFTAddress

```solidity
error MissingAssetNFTAddress()
```

### MissingAssetGovernorAddress

```solidity
error MissingAssetGovernorAddress()
```

### AccountFrozen

```solidity
error AccountFrozen(address account_)
```

### AccountNotFrozen

```solidity
error AccountNotFrozen(address account_)
```

### NotOwnerOfNFT

```solidity
error NotOwnerOfNFT(uint256 tokenID_)
```

### RecapturedFrozenFunds

```solidity
event RecapturedFrozenFunds(address account_)
```

### FrozeAccount

```solidity
event FrozeAccount(address account_)
```

### UnfrozeAccount

```solidity
event UnfrozeAccount(address account_)
```

### constructor

```solidity
constructor() public
```

_This contract uses the OpenZeppelin-Upgradable definitions
but these contracts should never be deployed in an upgradeable manner.
Token contracts and other core infrastructure should be deployed in
a manner that protects users to the greatest extent possible.
Rather than upgrading the core handling logic of the system, the
system should be upgraded by changing out peripheral contracts while
leaving the core logic untouched. Further, by building these peripheral
contracts variables such that they may be locked to prevent future
manipulation, the system built in layers and locked down as the systems
tech stack matures._

### initialize

```solidity
function initialize(struct GenericTokenConfig config_) public
```

_Initializes the contract with the provided configuration.

Requirements:

- The contract must not be initialized already.
- The `config_` must contain valid values for decimals, name, symbol, feePercent, and assetNFT.
- The `config_` must contain a valid address for assetGovernor._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| config_ | struct GenericTokenConfig | The configuration for the token, including:   - decimals: The number of decimal places for the token.   - name: The name of the token.   - symbol: The symbol of the token.   - feePercent: The percentage of fees to be charged on transfers.   - assetNFT: The address of the associated asset NFT contract.   - feeCollector: (optional) The address of the fee collector.   - assetGovernor: The address of the asset governor.   - mintHook: (optional) The address of the external mint hook contract.   - burnHook: (optional) The address of the external burn hook contract.   - transferHook: (optional) The address of the external transfer hook contract.   - admin: The address of the admin with special privileges. |

### setAssetGovernorRole

```solidity
function setAssetGovernorRole(address newGovernor_) public
```

_Sets a new asset governor role.

Requirements:

- The caller must have the current asset governor role._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newGovernor_ | address | The address of the new asset governor. |

### lockAssetGovernorRole

```solidity
function lockAssetGovernorRole() public
```

_Permanently locks the asset governor role.
Once locked, it cannot be unlocked.

Requirements:

- The caller must have the asset governor role._

### changeFeeCollector

```solidity
function changeFeeCollector(address newFeeCollector_) public
```

_Changes the fee collector to a new address.

Requirements:

- The caller must be the admin._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newFeeCollector_ | address | The address of the new fee collector. |

### lockFeeCollector

```solidity
function lockFeeCollector() public
```

_Locks the fee collector, preventing further changes.

Requirements:

- The caller must be the admin._

### pause

```solidity
function pause() public
```

_Pauses mint, burn, and transfer operations.

Requirements:

- The caller must be the admin.
- The contract must not be paused._

### unpause

```solidity
function unpause() public
```

_Unpauses mint, burn, and transfer operations.

Requirements:

- The caller must be the admin.
- The contract must be paused._

### mint

```solidity
function mint(address to_, uint256 tokenID_) public
```

_Mints tokens to the specified address with custom hook logic.

This function performs the following steps:

1. Retrieves the mint hook address.
2. Gets the token value associated with the given `tokenID_` from the asset NFT contract.
3. Adds the `tokenID_` to the `_assetNFTValueToTokenIds` mapping for the corresponding token value.
4. If the hook address is the zero address:
   - Transfers the asset NFT from the caller to this contract.
   - Mints the token value to the specified `to_` address.
5. If the hook address is not the zero address:
   - Creates an instance of the `IExtHookLogic` interface with the hook address.
   - Calls the `beforeTokenMint` function on the hook contract, passing the `to_` address and token value as parameters.
   - Transfers the asset NFT from the caller to this contract.
   - Mints the token value to the specified `to_` address.
   - If the `beforeTokenMint` function returned `true`:
     - Calls the `afterTokenMint` function on the hook contract, passing the `to_` address and token value as parameters.
Requirements:
- caller must not be frozen
- caller must pre-approve the transfer of the asset nft to this contract
- caller must be the owner of the asset nft
- to_ must not be frozen
- this contract must not be paused_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to_ | address | The address to mint tokens to. |
| tokenID_ | uint256 | The ID of the asset NFT to mint tokens for. |

### mint

```solidity
function mint(uint256 tokenID_) public
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenID_ | uint256 | the id of the asset nft to mint tokens for |

### burn

```solidity
function burn(uint256 amount_) public
```

_Burns a specified amount of tokens to claim ownership of an NFT with equivalent value.

This function performs the following steps:

1. Checks if there are any NFTs available with a value equal to the specified `amount_`.
   - If no NFTs are available, the function reverts with a `NoNFTWithValue` error.
2. Retrieves the token ID of an available NFT with the specified `amount_` from the `_assetNFTValueToTokenIds` mapping.
3. Removes the retrieved token ID from the `_assetNFTValueToTokenIds` mapping.
4. Retrieves the burn hook address.
5. If the burn hook address is the zero address:
   - Burns the specified `amount_` of tokens from the caller's balance.
   - Transfers the asset NFT from the contract to the caller.
6. If the burn hook address is not the zero address:
   - Creates an instance of the `IExtHookLogic` interface with the burn hook address.
   - Calls the `beforeTokenBurn` function on the burn hook contract, passing the caller's address and `amount_` as parameters.
   - Burns the specified `amount_` of tokens from the caller's balance.
   - Transfers the asset NFT from the contract to the caller.
   - If the `beforeTokenBurn` function returned `true`:
     - Calls the `afterTokenBurn` function on the burn hook contract, passing the caller's address and `amount_` as parameters.

Requirements:

- The contract must not be paused.
- The caller must have a sufficient token balance to burn the specified `amount_`.
- There must be an available NFT with a value equal to the specified `amount_`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount_ | uint256 | The amount of tokens to burn. |

### collect

```solidity
function collect(address to_) public
```

_Collects all the fees accumulated by the contract and sends them to the specified address.

Requirements:

- The caller must have the fee collector role._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to_ | address | The address to send the collected fees to. |

### freezeAccount

```solidity
function freezeAccount(address account_) public
```

_Freezes an account, preventing it from executing transfers, mints, or burns.

Requirements:

- The caller must have the asset governor role.
- The account must not be already frozen._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account_ | address | The address of the account to freeze. |

### unfreezeAccount

```solidity
function unfreezeAccount(address account_) public
```

_Unfreezes an account, allowing it to execute transfers, mints, or burns.

Requirements:

- The caller must have the asset governor role.
- The account must be frozen._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account_ | address | The address of the account to unfreeze. |

### recaptureFrozenFunds

```solidity
function recaptureFrozenFunds(address account_) public
```

_Recaptures all the frozen funds from an account and sends them to the asset governor.

Requirements:

- The caller must have the asset governor role.
- The account must be frozen._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account_ | address | The address of the account to recapture funds from. |

### decimals

```solidity
function decimals() public view returns (uint8)
```

_Returns the number of decimals used by the token._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint8 | The number of decimals used by the token. |

### getAccruedFees

```solidity
function getAccruedFees() public view returns (uint256)
```

### assetNFT

```solidity
function assetNFT() public view returns (address)
```

_Returns the address of the asset NFT contract._

### admin

```solidity
function admin() public view returns (address)
```

_Returns the address of the current admin._

### feeCollector

```solidity
function feeCollector() public view returns (address)
```

_Returns the address of the fee collector._

### onERC721Received

```solidity
function onERC721Received(address, address, uint256, bytes) public pure returns (bytes4)
```

### isFrozen

```solidity
function isFrozen(address account_) public view returns (bool)
```

_checks if an account is frozen_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account_ | address | address to check if frozen |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool true if frozen, false if not |

### _transfer

```solidity
function _transfer(address from_, address to_, uint256 amount_) internal
```

_This function wraps the base _transfer function
This function invokes the custom before and after hook logic.

This function short circuits to just perform a transfer
if the hook address is zero. if the hook address is not
zero, then the hook logic is called.

The hook logic is as follows:

The before hook is called first and is passed the
`from_`, `to_`, and `amount_` parameters. The before hook
returns a fee amount and a bool to indicate if after hook should
be called.

If the `fee` is greater than zero, `fee` is transfered to
the this contracts control. The fee is taken from the caller's
balance to ensure that the amount tranfered to `to` matches `amount`.
If the `fee` is zero, then no fee is collected.

Next, the caller's intended transfer is performed.

Lastly, the after hook is called only if the after hook required
flag is returned as true by the before hook call. If the after
hook is required, it is passed the from, to, amount, and fee
parameters._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from_ | address | Who to transfer from. |
| to_ | address | Who to transfer to. |
| amount_ | uint256 | How much to transfer. |

### _mint

```solidity
function _mint(address to_, uint256 tokenID_) internal
```

_Mints tokens to the specified address with custom hook logic.

This function performs the following steps:

1. Retrieves the mint hook address.
2. Gets the token value associated with the given `tokenID_` from the asset NFT contract.
3. Adds the `tokenID_` to the `_assetNFTValueToTokenIds` mapping for the corresponding token value.
4. If the hook address is the zero address:
   - Transfers the asset NFT from the caller to this contract.
   - Mints the token value to the specified `to_` address.
5. If the hook address is not the zero address:
   - Creates an instance of the `IExtHookLogic` interface with the hook address.
   - Calls the `beforeTokenMint` function on the hook contract, passing the `to_` address and token value as parameters.
   - Transfers the asset NFT from the caller to this contract.
   - Mints the token value to the specified `to_` address.
   - If the `beforeTokenMint` function returned `true`:
     - Calls the `afterTokenMint` function on the hook contract, passing the `to_` address and token value as parameters._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to_ | address | The address to mint tokens to. |
| tokenID_ | uint256 | The ID of the asset NFT to mint tokens for. |

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from_, address to_, uint256 amount_) internal virtual
```

_this function ovverides the _beforeTokenTransfer function with the
_beforeTokenTransfer function from ERC20PausableUpgradeable_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from_ | address | address transfering tokens from |
| to_ | address | address transfering tokens to |
| amount_ | uint256 | the amount of tokens to transfer |

### _afterTokenTransfer

```solidity
function _afterTokenTransfer(address from_, address to_, uint256) internal
```

### _isFrozen

```solidity
function _isFrozen(address account_) internal view returns (bool)
```

### _onlyFeesAdmin

```solidity
function _onlyFeesAdmin() internal
```

### _onlyHookAdmin

```solidity
function _onlyHookAdmin() internal
```

## IGenericToken

### initialize

```solidity
function initialize(struct GenericTokenConfig config_) external
```

### mint

```solidity
function mint(uint256 amount) external
```

### burn

```solidity
function burn(uint256 amount) external
```

## IGenericTokenAdmin

### initialize

```solidity
function initialize(struct GenericTokenConfig config_) external
```

### changeFeeCollector

```solidity
function changeFeeCollector(address newFeeCollector_) external
```

### lockFeeCollector

```solidity
function lockFeeCollector() external
```

### pause

```solidity
function pause() external
```

### unpause

```solidity
function unpause() external
```

### changeERC20Hook

```solidity
function changeERC20Hook(address newHook_) external
```

### lockERC20Hook

```solidity
function lockERC20Hook() external
```

### collect

```solidity
function collect(address to_) external
```

### ERC20Hook

```solidity
function ERC20Hook() external view returns (address)
```

### admin

```solidity
function admin() external view returns (address)
```

### feeCollector

```solidity
function feeCollector() external view returns (address)
```

### ERC20HookIsLocked

```solidity
function ERC20HookIsLocked() external view returns (bool)
```

## IAssetNFT

### getTokenValue

```solidity
function getTokenValue(uint256 tokenID_) external view returns (uint256)
```

### ownerOf

```solidity
function ownerOf(uint256 tokenID_) external view returns (address)
```

### safeTransferFrom

```solidity
function safeTransferFrom(address from_, address to_, uint256 tokenID_) external
```

### freezeAccount

```solidity
function freezeAccount(address account_) external
```

### unfreezeAccount

```solidity
function unfreezeAccount(address account_) external
```

## UNIT_ONE

```solidity
uint256 UNIT_ONE
```

## ERC20Factory

This is UUPS upgradeable factory contract used to deploy new instances of Generic Token

_The contract initalizer sets the owner as msg.sender. The token contract will be deployed with
create2 and the salt used to calculate the address is the keccak256 hash of the symbol._

### DeployedToken

```solidity
event DeployedToken(address tokenAddress)
```

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address owner_, address rsGoldFactory_) public
```

initializes the contract, sets msg.sender as the owner

_must be called directly after deployment, can only be called once_

### _code

```solidity
function _code() internal pure returns (bytes)
```

_this function is used to get the contract creation code_

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newImplementation | address | new implementation contract address overrides parent function with onlyOwner modifer to restrict access |

### _onlyOwner

```solidity
function _onlyOwner() internal
```

_this function is used to restrict access to only the owner_

## RGFactory

this is a UUPS upgradeable factory contract for deploying bridge pools

_this contract is used to deploy bridge pools using deterministic create2.
The salt used for the create2 is the keccak256 hash of the token address
that the bridge pool represents.

deploy this contract as a uups upgradeable proxy_

### MissingInitCallData

```solidity
error MissingInitCallData()
```

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address owner_) public
```

_initializes the contract, sets msg.sender as the owner_

### deployAssetNFT

```solidity
function deployAssetNFT(string name_, string symbol_, bytes initCallData_) public returns (address tokenAddr)
```

### deployGenericToken

```solidity
function deployGenericToken(string name_, string symbol_, bytes initCallData_) public returns (address tokenAddr)
```

### deployCreateCustomContract

```solidity
function deployCreateCustomContract(uint256 amount_, bytes bytecode_, bytes initCallData_) public returns (address addr)
```

### deployCreate2CustomContract

```solidity
function deployCreate2CustomContract(uint256 amount_, bytes32 salt_, bytes bytecode_, bytes initCallData_) public returns (address addr)
```

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

_allows owner to upgrade the implementation of the bridge pool_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newImplementation | address | address of new logic contract |

## IExtHookLogic

### beforeTokenTransfer

```solidity
function beforeTokenTransfer(address from_, address to_, uint256 amount_) external returns (bool isAfterHookRequired)
```

### afterTokenTransfer

```solidity
function afterTokenTransfer(address from_, address to_, uint256 amount_, uint256 fee_) external
```

### beforeTokenMint

```solidity
function beforeTokenMint(address to_, uint256 amount_) external returns (bool isAfterHookRequired)
```

### beforeTokenBurn

```solidity
function beforeTokenBurn(address from_, uint256 amount_) external returns (bool isAfterHookRequired)
```

### afterTokenBurn

```solidity
function afterTokenBurn(address from_, uint256 amount_) external
```

### afterTokenMint

```solidity
function afterTokenMint(address to_, uint256 amount_) external
```

## ITransferHooks

### beforeTokenTransfer

```solidity
function beforeTokenTransfer(address from_, address to_, uint256 amount_) external returns (uint256 fee, bool isAfterHookRequired)
```

### afterTokenTransfer

```solidity
function afterTokenTransfer(address from_, address to_, uint256 amount_, uint256 fee_) external
```

## IMintHooks

### beforeTokenMint

```solidity
function beforeTokenMint(address to_, uint256 amount_) external returns (bool isAfterHookRequired)
```

### afterTokenMint

```solidity
function afterTokenMint(address to_, uint256 amount_) external
```

## IBurnHooks

### beforeTokenBurn

```solidity
function beforeTokenBurn(address from_, uint256 amount_) external returns (bool isAfterHookRequired)
```

### afterTokenBurn

```solidity
function afterTokenBurn(address from_, uint256 amount_) external
```

## IGenericFactory

### deploy

```solidity
function deploy(bytes32 salt_) external returns (address addr)
```

### addressFor

```solidity
function addressFor(bytes32 salt) external view returns (address addr)
```

## IAllocationRegistry

### allocateNewPosition

```solidity
function allocateNewPosition(address owner_, uint256 tokenID_, uint256 tokenAmount_) external
```

### transferAllocation

```solidity
function transferAllocation(address from_, address to_, uint256 amount_) external
```

### burnAllocation

```solidity
function burnAllocation(address owner_, uint256 tokenID_) external
```

### isPositionFullyAllocated

```solidity
function isPositionFullyAllocated(address user_, uint256 tokenID_) external view returns (bool)
```

## EnumerableERC20

### TokenOwnerAdded

```solidity
event TokenOwnerAdded(address tokenOwner)
```

### TokenOwnerRemoved

```solidity
event TokenOwnerRemoved(address tokenOwner)
```

### _updateTokenOwnerList

```solidity
function _updateTokenOwnerList(address from_, address to_, uint256 fromBalance_, uint256 toBalance_) internal
```

_Updates the token owner list when tokens are transferred._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from_ | address | The address tokens are transferred from. |
| to_ | address | The address tokens are transferred to. |
| fromBalance_ | uint256 | The balance of the `from_` address. |
| toBalance_ | uint256 | The balance of the `to_` address. |

### getTokenOwnerCount

```solidity
function getTokenOwnerCount() public view returns (uint256)
```

_Returns the number of token owners._

### getTokenOwnerAtIndex

```solidity
function getTokenOwnerAtIndex(uint256 index) public view returns (address)
```

_Returns the token owner at the specified index._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| index | uint256 | The index of the token owner. |

### isTokenOwner

```solidity
function isTokenOwner(address account) public view returns (bool)
```

_Returns whether the specified address is a token owner._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | The address to check. |

### getTokenOwners

```solidity
function getTokenOwners(uint256 start, uint256 limit) public view returns (address[])
```

_Returns a paginated list of token owners._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| start | uint256 | The starting index. |
| limit | uint256 | The maximum number of token owners to return. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address[] | owners A list of token owners. |

## AccessControlLockableInitializable

this contract extends the OpenZeppelin AccessControlDefaultAdminRulesUpgradeable contract
to add the ability to lock roles such that they can never be changed again
this contract also overrides the default grant and revoke role functions to
allow only one account per role.

### RoleStats

```solidity
struct RoleStats {
  bool locked;
  address member;
}
```

### _role_stats

```solidity
mapping(bytes32 => struct AccessControlLockableInitializable.RoleStats) _role_stats
```

### RoleIsLocked

```solidity
error RoleIsLocked(bytes32 role)
```

### RoleCanOnlyBeGrantedToOneAccount

```solidity
error RoleCanOnlyBeGrantedToOneAccount(bytes32 role)
```

### RoleLocked

```solidity
event RoleLocked(bytes32 role)
```

### onlyAdmin

```solidity
modifier onlyAdmin()
```

### __AccessControlLockableInitializable_init

```solidity
function __AccessControlLockableInitializable_init(address admin_) internal
```

### __AccessControlLockable_init_unchained

```solidity
function __AccessControlLockable_init_unchained(address admin_) internal
```

### getRoleMember

```solidity
function getRoleMember(bytes32 role_) public view returns (address)
```

_view function to get address with speicified role_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| role_ | bytes32 | keccak256 hash of role name |

### isLocked

```solidity
function isLocked(bytes32 role_) public view returns (bool)
```

_view function to check if a role is locked_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| role_ | bytes32 | keccak256 hash of role name |

### _isLocked

```solidity
function _isLocked(bytes32 role) internal view returns (bool)
```

_this is a internal view function to check if a role is locked_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| role | bytes32 | keccak256 hash of role name |

### _grantRole

```solidity
function _grantRole(bytes32 role_, address account) internal
```

_this function overrides the default grant role function to add role stats
to control role locking, and allows only one account per role_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| role_ | bytes32 | keccak256 hash of role name |
| account | address | address to grant role to |

### _revokeRole

```solidity
function _revokeRole(bytes32 role_, address account_) internal
```

_this function overrides the default revoke role function to add role stats
to control role locking, and allows only one account per role_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| role_ | bytes32 | keccak256 hash of role name |
| account_ | address | address to revoke role from |

### _lockRole

```solidity
function _lockRole(bytes32 role_) internal
```

_allows the default admin to lock a role such that it can never be changed again_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| role_ | bytes32 | keccak256 hash of role name |

### renounceRole

```solidity
function renounceRole(bytes32, address) public pure
```

_this function override turns off the ability to renounce roles_

### grantRole

```solidity
function grantRole(bytes32, address) public pure
```

### revokeRole

```solidity
function revokeRole(bytes32, address) public pure
```

## ExtHookTarget

HookExt contract implements the storage, events, and errors
for inheritable transfer hooks. The inheriting contract must implement
the logic for the transfer hooks. Specifically, the inheriting contract
must implement the changeExtHook and LockExtHook functions.

The inheriting contract must also call the _setERC20Hook function in its
constructor/initilization function.

### TransferHookChanged

```solidity
event TransferHookChanged(address newHook_)
```

### MintHookChanged

```solidity
event MintHookChanged(address newHook_)
```

### BurnHookChanged

```solidity
event BurnHookChanged(address newHook_)
```

### HookLocked

```solidity
error HookLocked()
```

### setExtTransferHook

```solidity
function setExtTransferHook(address hook_) public
```

_Changes the ERC20 transfer hook to a new address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| hook_ | address | The address of the new ERC20 hook. |

### setExtMintHook

```solidity
function setExtMintHook(address hook_) public
```

_Changes the ERC20 mint hook to a new address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| hook_ | address | The address of the new ERC20 hook. |

### setExtBurnHook

```solidity
function setExtBurnHook(address hook_) public
```

_Changes the ERC20 burn hook to a new address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| hook_ | address | The address of the new ERC20 hook. |

### lockExtMintHook

```solidity
function lockExtMintHook() public
```

_Locks the ERC20 mint hook, preventing further changes._

### lockExtTransferHook

```solidity
function lockExtTransferHook() public
```

_Locks the ERC20 transfer hook, preventing further changes._

### lockExtBurnHook

```solidity
function lockExtBurnHook() public
```

_Locks the ERC20 burn hook, preventing further changes._

### transferHook

```solidity
function transferHook() public view returns (address)
```

### mintHook

```solidity
function mintHook() public view returns (address)
```

### burnHook

```solidity
function burnHook() public view returns (address)
```

### transferHookIsLocked

```solidity
function transferHookIsLocked() public view returns (bool)
```

### mintHookIsLocked

```solidity
function mintHookIsLocked() public view returns (bool)
```

### burnHookIsLocked

```solidity
function burnHookIsLocked() public view returns (bool)
```

### _setExtMintHook

```solidity
function _setExtMintHook(address newHook_) internal
```

### _setExtTransferHook

```solidity
function _setExtTransferHook(address newHook_) internal
```

### _setExtBurnHook

```solidity
function _setExtBurnHook(address newHook_) internal
```

### _lockExtTransferHook

```solidity
function _lockExtTransferHook() internal
```

### _lockExtMintHook

```solidity
function _lockExtMintHook() internal
```

### _lockExtBurnHook

```solidity
function _lockExtBurnHook() internal
```

### _getTransferHook

```solidity
function _getTransferHook() internal view returns (address)
```

### _getMintHook

```solidity
function _getMintHook() internal view returns (address)
```

### _getBurnHook

```solidity
function _getBurnHook() internal view returns (address)
```

### _onlyHookAdmin

```solidity
function _onlyHookAdmin() internal virtual
```

## GenericFactory

### rgFactory

```solidity
address rgFactory
```

### _deployedContracts

```solidity
address[] _deployedContracts
```

### DeployedContract

```solidity
event DeployedContract(address addr)
```

### NotFactory

```solidity
error NotFactory(address sender)
```

### InvalidRange

```solidity
error InvalidRange()
```

### onlyFactory

```solidity
modifier onlyFactory()
```

### constructor

```solidity
constructor() internal
```

### deploy

```solidity
function deploy(bytes32 salt_) public returns (address addr)
```

deploys a generic token contract, and initializes with variables in GenericTokenConfig

_deploys a new instance of generic token contract with create2,
using the keccak256 hash of its symbol as the salt_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| salt_ | bytes32 | keccak256 hash of the token symbol |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| addr | address | the address of the deployed Generic Token contract |

### changeFactory

```solidity
function changeFactory(address factory_) public
```

_allows the owner to change the address authorized to token contracts_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| factory_ | address | address of the new RGFactory contract |

### numDeployedContracts

```solidity
function numDeployedContracts() public view returns (uint256)
```

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | the number of deployed contracts |

### getDeployedContracts

```solidity
function getDeployedContracts(uint256 start_, uint256 end_) public view returns (address[])
```

_returns a slice of the deployed contracts array_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| start_ | uint256 | start index |
| end_ | uint256 | end index |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address[] | result array of deployed contract addresses |

### addressFor

```solidity
function addressFor(bytes32 salt_) public view returns (address addr)
```

calculates the address of a token contract deployed by this factory,

_this function uses a immutable deploycode hash, if the logic contract is updated
a updated initcode hash must be used to calculate the address_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| salt_ | bytes32 | keccak256 hash of the token symbol |

### calcSalt

```solidity
function calcSalt(string symbol_) public pure returns (bytes32)
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| symbol_ | string | token symbol |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | the keccak256 hash of the token symbol |

### _deploy

```solidity
function _deploy(bytes32 salt) internal returns (address addr)
```

### _address

```solidity
function _address(bytes32 salt_) internal view returns (address addr)
```

### _code

```solidity
function _code() internal pure virtual returns (bytes)
```

### _onlyOwner

```solidity
function _onlyOwner() internal virtual
```

## RGFactoryBase

### Factories

```solidity
enum Factories {
  TOKEN,
  NFT
}
```

### deployers

```solidity
mapping(enum RGFactoryBase.Factories => address) deployers
```

### erc20Tokens

```solidity
address[] erc20Tokens
```

### erc721Tokens

```solidity
address[] erc721Tokens
```

### DeployedPool

```solidity
event DeployedPool(address poolAddress, address tokenAddress)
```

_emitted when a new bridge pool is deployed_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| poolAddress | address | address of bridge pool |
| tokenAddress | address | address of token contract |

### DeployedERC20

```solidity
event DeployedERC20(address tokenAddress, string name, string symbol)
```

### DeployedERC721

```solidity
event DeployedERC721(address tokenAddress, string name, string symbol)
```

### DeployedCustomContract

```solidity
event DeployedCustomContract(address addr)
```

### CreateInsufficientBalance

```solidity
error CreateInsufficientBalance(uint256 balance, uint256 needed)
```

_Not enough balance for performing a deployment._

### ERC20DeployerNotSet

```solidity
error ERC20DeployerNotSet()
```

### ERC721DeployerNotSet

```solidity
error ERC721DeployerNotSet()
```

### CreateEmptyBytecode

```solidity
error CreateEmptyBytecode()
```

_There's no code to deploy._

### CreateFailedDeployment

```solidity
error CreateFailedDeployment()
```

_The deployment failed._

### NotNativeChain

```solidity
error NotNativeChain()
```

### constructor

```solidity
constructor() internal
```

### updateDeployers

```solidity
function updateDeployers(enum RGFactoryBase.Factories factory_, address deployer_) external
```

### _deployGenericToken

```solidity
function _deployGenericToken(bytes32 salt_) internal returns (address tokenAddress)
```

### _deployAssetNFT

```solidity
function _deployAssetNFT(bytes32 salt_) internal returns (address nftAddress)
```

### _deployCustomContract

```solidity
function _deployCustomContract(uint256 value_, bytes bytecode_) internal returns (address addr)
```

_Deploys a contract using `CREATE`.

The bytecode for a contract can be obtained from Solidity with
`type(contractName).creationCode`.

Requirements:

- `bytecode` must not be empty.
- the factory must have a balance of at least `amount`.
- if `amount` is non-zero, `bytecode` must have a `payable` constructor._

### _deployCustomCreate2Contract

```solidity
function _deployCustomCreate2Contract(uint256 value_, bytes32 salt_, bytes bytecode_) internal returns (address addr)
```

### _initalizeDeployed

```solidity
function _initalizeDeployed(address addr_, bytes payload_) internal
```

## Fees

### FeeTooHigh

```solidity
error FeeTooHigh()
```

### FeeLocked

```solidity
error FeeLocked()
```

### FeesData

```solidity
struct FeesData {
  bool locked;
  uint24 _feePercent;
  uint256 _accruedFees;
}
```

### _fees

```solidity
struct Fees.FeesData _fees
```

### __Fees_init

```solidity
function __Fees_init(uint24 fee_) public
```

### __Fees_init_unchained

```solidity
function __Fees_init_unchained(uint24 fee_) internal
```

### setFee

```solidity
function setFee(uint24 fee_) public
```

_Allows the admin of this contract to change the fee percentage._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee_ | uint24 | The new fee percentage to be set. This function can only be called by an account with the admin role. After the fee is changed, it will be applied to all future transactions. |

### lockFee

```solidity
function lockFee() public
```

### getFee

```solidity
function getFee() public view returns (uint24)
```

### isFeeLocked

```solidity
function isFeeLocked() public view returns (bool)
```

### calcFee

```solidity
function calcFee(uint256 amount_) public view returns (uint256 recipientAmount, uint256 feeAmout, bool zeroFee)
```

_Calculates the fee for a given amount.
The function returns the deposit amount, the fee amount, and a boolean indicating whether the fee is zero._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount_ | uint256 | The amount for which the fee is to be calculated. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipientAmount | uint256 | The deposit amount less fees. |
| feeAmout | uint256 | The fee amount. |
| zeroFee | bool | A boolean indicating whether the fee is zero. |

### _calcFee

```solidity
function _calcFee(uint256 amount_) internal view returns (uint256 recipientAmount, uint256 feeAmout, bool zeroFee)
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount_ | uint256 | amount in wei to calculate fees for |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipientAmount | uint256 | amount with fees applied |
| feeAmout | uint256 | amount of fees |
| zeroFee | bool | zero fees flag |

### _isFeeLocked

```solidity
function _isFeeLocked() internal view returns (bool)
```

### _lockFees

```solidity
function _lockFees() internal
```

### _getFee

```solidity
function _getFee() internal view returns (uint24)
```

### _setFee

```solidity
function _setFee(uint24 fee_) internal
```

### _onlyFeesAdmin

```solidity
function _onlyFeesAdmin() internal virtual
```

## NFTTokenConfig

```solidity
struct NFTTokenConfig {
  address admin;
  address assetGovernor;
  address minter;
  address burner;
  address metaDataOperator;
  address ERC20Address;
  string name;
  string symbol;
  string baseURI;
}
```

## AssetNFT

### AssetData

```solidity
struct AssetData {
  uint256 erc20Value;
  string tokenURI;
}
```

### MINTER_ROLE

```solidity
bytes32 MINTER_ROLE
```

### BURNER_ROLE

```solidity
bytes32 BURNER_ROLE
```

### ASSET_GOVERNOR_ROLE

```solidity
bytes32 ASSET_GOVERNOR_ROLE
```

### META_DATA_OPERATOR_ROLE

```solidity
bytes32 META_DATA_OPERATOR_ROLE
```

### _baseURIString

```solidity
string _baseURIString
```

### erc20TokenAddress

```solidity
address erc20TokenAddress
```

### assets

```solidity
mapping(uint256 => struct AssetNFT.AssetData) assets
```

### _frozenAccounts

```solidity
mapping(address => bool) _frozenAccounts
```

### RedeemedGoldBar

```solidity
event RedeemedGoldBar(address recipient, uint256 tokenID, uint256 amountGcoins)
```

### MintedNFTWithoutERC20

```solidity
event MintedNFTWithoutERC20(uint256 tokenID, address to)
```

### MintedERC20

```solidity
event MintedERC20(uint256 tokenID, address recipient, uint256 erc20Amount)
```

### RecapturedFrozenFunds

```solidity
event RecapturedFrozenFunds(address account_, uint256 tokenID_)
```

### FrozeAccount

```solidity
event FrozeAccount(address account_)
```

### UnfrozeAccount

```solidity
event UnfrozeAccount(address account_)
```

### NFTAlreadyCreated

```solidity
error NFTAlreadyCreated(uint256 tokenID, string chip)
```

### TokenAlreadyClaimed

```solidity
error TokenAlreadyClaimed(uint256 tokenID)
```

### NotOwnerOfToken

```solidity
error NotOwnerOfToken(uint256 tokenID, address sender)
```

### ChipNotUsed

```solidity
error ChipNotUsed()
```

### InvalidRanges

```solidity
error InvalidRanges()
```

### InvalidERC20Value

```solidity
error InvalidERC20Value()
```

### NotApprovedOrOwner

```solidity
error NotApprovedOrOwner(address caller, address owner, uint256 tokenID_)
```

### MissingMinterAddress

```solidity
error MissingMinterAddress()
```

### MissingBurnerAddress

```solidity
error MissingBurnerAddress()
```

### MissingAdminAddress

```solidity
error MissingAdminAddress()
```

### MissingMetaDataOperatorAddress

```solidity
error MissingMetaDataOperatorAddress()
```

### MissingAssetGovernorAddress

```solidity
error MissingAssetGovernorAddress()
```

### AccountFrozen

```solidity
error AccountFrozen(address account_)
```

### AccountNotFrozen

```solidity
error AccountNotFrozen(address account_)
```

### IndexOutOfRange

```solidity
error IndexOutOfRange()
```

### MissingERC20Address

```solidity
error MissingERC20Address()
```

### NotERC20

```solidity
error NotERC20()
```

### onlyERC20

```solidity
modifier onlyERC20()
```

_Modifier that checks if the caller is the ERC20 token contract.

Requirements:

- The caller must be the ERC20 token contract._

### initialize

```solidity
function initialize(struct NFTTokenConfig config_) public
```

_Initializes the contract with the given configuration.

Requirements:

- The contract must not be initialized already.
- The `config_` must contain valid addresses for admin, minter, burner, metaDataOperator, ERC20Address, and assetGovernor._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| config_ | struct NFTTokenConfig | The configuration struct containing the necessary addresses and settings. |

### setAssetGovernorRole

```solidity
function setAssetGovernorRole(address newGovernor_) public
```

_Sets a new asset governor role.

Requirements:

- The caller must have the current asset governor role._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newGovernor_ | address | The address of the new asset governor. |

### lockAssetGovernorRole

```solidity
function lockAssetGovernorRole() public
```

_Locks the asset governor role, preventing further modifications.

Requirements:

- The caller must have the current asset governor role._

### setMinterRole

```solidity
function setMinterRole(address newMinter_) public
```

_only address with DEFAULT_ADMIN_ROLE can call this function_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newMinter_ | address | address of new minter |

### lockMinterRole

```solidity
function lockMinterRole() public
```

_Allows the default admin to permanently lock the minter role, preventing further changes.
this method locks all reassigning of the minter role_

### setBurnerRole

```solidity
function setBurnerRole(address newBurner_) public
```

_only address with DEFAULT_ADMIN_ROLE can call this function
allows the admin to change the burner role_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newBurner_ | address | address of new burner |

### lockBurnerRole

```solidity
function lockBurnerRole() public
```

_Allows the default admin to permanently lock the burner role, preventing further changes._

### setMetaDataOperatorRole

```solidity
function setMetaDataOperatorRole(address newOperator_) public
```

_only address with DEFAULT_ADMIN_ROLE can call this function
allows the admin to change the metaDataOperator role_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newOperator_ | address | address of new metaDataOperator |

### lockMetaDataOperatorRole

```solidity
function lockMetaDataOperatorRole() public
```

_Allows the default admin to permanently lock the metaDataOperator role, preventing further changes._

### ChangeTokenURIInput

```solidity
struct ChangeTokenURIInput {
  uint256 tokenId;
  string newTokenURI;
}
```

### changeTokenURI

```solidity
function changeTokenURI(struct AssetNFT.ChangeTokenURIInput input_) public
```

_allows the metaDataOperator to change the tokenURI of a token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| input_ | struct AssetNFT.ChangeTokenURIInput | the input data for the changeTokenURI function struct with tokenID and newTokenURI |

### changeTokenURIBatch

```solidity
function changeTokenURIBatch(struct AssetNFT.ChangeTokenURIInput[] inputs_) public
```

_allows the metaDataOperator to change the tokenURI of a token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| inputs_ | struct AssetNFT.ChangeTokenURIInput[] | array of input data for the changeTokenURI function struct with tokenID and newTokenURI |

### changeBaseURI

```solidity
function changeBaseURI(string newBaseURI_) public
```

_allows the admin to change the baseURI_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newBaseURI_ | string | the new baseURI |

### MintInput

```solidity
struct MintInput {
  address to;
  uint256 erc20Value;
  string tokenURI;
  string chip;
}
```

### pause

```solidity
function pause() public
```

_Pauses mint burn and transfer operations
can only be called by the admin and only while it is not paused_

### unpause

```solidity
function unpause() public
```

_Unpauses mint burn and transfer operations
can only be called by the admin and only while it is not paused_

### mint

```solidity
function mint(struct AssetNFT.MintInput input_) public
```

### mint

```solidity
function mint(struct AssetNFT.MintInput[] inputs_) public
```

### BurnInput

```solidity
struct BurnInput {
  uint256 tokenID;
  address owner;
}
```

### burn

```solidity
function burn(struct AssetNFT.BurnInput input_) public
```

_this function takes in a tokenID and burns it
and deletes the asset data
the user must approve this contract to spend the token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| input_ | struct AssetNFT.BurnInput | the input data for the burn function struct with tokenID and owner address |

### freezeAccount

```solidity
function freezeAccount(address account_) public
```

_this function allows the erc20 contract to freeze an account. this function
should only be called by the freezeAccount function in the erc20 contract_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account_ | address | the address of the account to freeze |

### unfreezeAccount

```solidity
function unfreezeAccount(address account_) public
```

_this function allows the erc20 contract to unfreeze an account. this function
should only be called by the unfreezeAccount function in the erc20 contract_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account_ | address | the address of the account to unfreeze |

### recaptureFrozenFunds

```solidity
function recaptureFrozenFunds(address account_, uint256 numTokens_) public
```

_this function allows the assetGovernor to recapture frozen funds from an account
that has been frozen. the assetGovernor can recapture any number of tokens from the account_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account_ | address | the address of the account to recapture the funds from |
| numTokens_ | uint256 | the number of tokens to recapture |

### getUserPositions

```solidity
function getUserPositions(address user_, uint256 startIndex_, uint256 endIndex_) public view returns (struct AssetNFT.AssetData[])
```

this is public view function that returns a list of AssetData structs containing metadata of the user's positions

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user_ | address | the address of the user |
| startIndex_ | uint256 | the index to start from |
| endIndex_ | uint256 | the index to end at |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct AssetNFT.AssetData[] | an array of AssetData structs |

### getPositionData

```solidity
function getPositionData(uint256 tokenId_) public view returns (struct AssetNFT.AssetData)
```

_this function returns the asset data of a token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId_ | uint256 | the tokenID of the nft |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct AssetNFT.AssetData | AssetData struct containing the asset data. the struct contains the erc20Value and tokenURI |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

### getTokenValue

```solidity
function getTokenValue(uint256 tokenId_) public view returns (uint256)
```

_Returns the value of the token with the given `tokenId_`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId_ | uint256 | The identifier of the token to get the value for |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The number of ERC20 tokens this nft is worth |

### tokenURI

```solidity
function tokenURI(uint256 tokenId_) public view returns (string)
```

_Returns the Uniform Resource Identifier (URI) for `tokenId` token._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId_ | uint256 | The identifier of the token to get the URI for |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | string The URI for the token |

### baseURI

```solidity
function baseURI() public view returns (string)
```

_Returns the base URI for token URIs._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | string The base URI for token URIs |

### isFrozen

```solidity
function isFrozen(address account_) public view returns (bool)
```

### _transfer

```solidity
function _transfer(address from_, address to_, uint256 tokenId_) internal
```

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from_, address to_, uint256 firstTokenId_, uint256 batchSize_) internal
```

### _mint

```solidity
function _mint(address to_, uint256 erc20Value_, string tokenURI_, string chip_) internal returns (uint256 tokenID)
```

_mints an nft without minting Gcoins, and sets the nft price in gcoins_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to_ | address | address to mint the tokens to |
| erc20Value_ | uint256 | the value of the asset in gcoins(the weight of the bar in grams) |
| tokenURI_ | string |  |
| chip_ | string | unique chip id of the asset |

### _burn

```solidity
function _burn(uint256 tokenId_) internal
```

_this function burns the nft and deletes the asset data_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId_ | uint256 | the tokenID of the nft to burn |

### _baseURI

```solidity
function _baseURI() internal view returns (string)
```

_Base URI for computing {tokenURI}. If set, the resulting URI for each
token will be the concatenation of the `baseURI` and the `tokenId`. Empty
by default, can be overridden in child contracts._

### _getTokenValue

```solidity
function _getTokenValue(uint256 tokenId_) internal view returns (uint256)
```

### _isFrozen

```solidity
function _isFrozen(address account_) internal view returns (bool)
```

### _onlyHookAdmin

```solidity
function _onlyHookAdmin() internal
```

## ERC721Factory

This is UUPS upgradeable factory contract used to deploy new instances of Generic Token

_The contract initalizer sets the owner as msg.sender. The token contract will be deployed with
create2 and the salt used to calculate the address is the keccak256 hash of the symbol._

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address owner_, address rgFactory_) public
```

initializes the contract, sets msg.sender as the owner

_must be called directly after deployment, can only be called once_

### _code

```solidity
function _code() internal pure returns (bytes)
```

_this function is used to get the contract creation code_

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newImplementation | address | new implementation contract address overrides parent function with onlyOwner modifer to restrict access |

### _onlyOwner

```solidity
function _onlyOwner() internal
```

## IAssetNFT

### mintWithoutERC20Tokens

```solidity
function mintWithoutERC20Tokens(address to_, uint256 erc20Value_, string chip_) external
```

### mintWithERC20Tokens

```solidity
function mintWithERC20Tokens(address to_, uint256 erc20Value_, string chip_) external
```

_this function mints a new nft to the gcoin token contract,
and mints the corresponding gcoins to the address specified_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to_ | address | address to mint g-coins to |
| erc20Value_ | uint256 | the value of the asset in gcoins(the weight of the bar in grams) |
| chip_ | string | unique chip id of the asset |

### BatchMintInput

```solidity
struct BatchMintInput {
  address to;
  uint256 erc20Value;
  string chipID;
}
```

### batchMintWithERC20Tokens

```solidity
function batchMintWithERC20Tokens(struct IAssetNFT.BatchMintInput[] assets_) external
```

_this function takes in multiple asset data and mints a nft for each asset to the token contract,
and mints the corresponding gcoins to the recipient specified_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets_ | struct IAssetNFT.BatchMintInput[] | array of asset data to mint |

### batchMintWithoutERC20Tokens

```solidity
function batchMintWithoutERC20Tokens(struct IAssetNFT.BatchMintInput[] assets_) external
```

### exchangeNFT

```solidity
function exchangeNFT(uint256 tokenID_) external
```

_this function allows users to exchange their nft for gcoins
the nft must be owned by the user calling this function
the nft must be transfered to the Gcoin contract_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenID_ | uint256 | the tokenID of the nft to exchange |

### claimNFT

```solidity
function claimNFT(uint256 tokenID_) external
```

_this function allows users to exchange their gcoins for a nft associated with a physical gold bar
this function will first call the gcoin contract to burn the gcoins required from the sender balance
then transfers the specified tokenID from the token contract to the sender_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenID_ | uint256 | the tokenID of the nft to claim |

### redeemNFT

```solidity
function redeemNFT(uint256 tokenID_) external
```

_this function allows users to redeem their nft for a physical gold bar
the nft must be owned by the user calling this function_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenID_ | uint256 | the tokenID of the nft to redeem |

### AssetData

```solidity
struct AssetData {
  uint256 erc20Value;
  string chipID;
}
```

### getUserPositions

```solidity
function getUserPositions(address user_, uint256 startIndex_, uint256 endIndex_) external view returns (struct IAssetNFT.AssetData[])
```

## IBridgePoolFactory

### deploy

```solidity
function deploy(bytes32 salt) external returns (address addr)
```

### addressFor

```solidity
function addressFor(bytes32 salt) external view returns (address addr)
```

## InvalidTransfer

```solidity
error InvalidTransfer()
```

## ERC20HookLogic

This contract provides a minimal tmplate from which custom
hook logic contracts may be built.

### beforeTokenMint

```solidity
function beforeTokenMint(address to_, uint256 amount_) public virtual returns (bool isAfterHookRequired)
```

### beforeTokenBurn

```solidity
function beforeTokenBurn(address from_, uint256 amount_) public virtual returns (bool isAfterHookRequired)
```

_Hook function called before a token burn operation.
Can be overridden by derived contracts to implement custom behavior._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| isAfterHookRequired | bool | A boolean indicating whether the after hook is required. |

### beforeTokenTransfer

```solidity
function beforeTokenTransfer(address from_, address to_, uint256 amount_) public virtual returns (bool isAfterHookRequired)
```

_Hook function called before a token transfer operation._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from_ | address | The address of the sender. |
| to_ | address | The address of the receiver. |
| amount_ | uint256 | The amount of tokens to be transferred. Can be overridden by derived contracts to implement custom behavior. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| isAfterHookRequired | bool | A boolean indicating whether the after hook is required. |

### afterTokenTransfer

```solidity
function afterTokenTransfer(address from_, address to_, uint256 amount_, uint256 fee_) public virtual
```

_Hook function called after a token transfer operation._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from_ | address | The address of the sender. |
| to_ | address | The address of the receiver. |
| amount_ | uint256 | The amount of tokens transferred. |
| fee_ | uint256 | The fee deducted from the transfer. Can be overridden by derived contracts to implement custom behavior. |

### afterTokenMint

```solidity
function afterTokenMint(address to_, uint256 amount_) public virtual
```

### afterTokenBurn

```solidity
function afterTokenBurn(address from_, uint256 amount_) public virtual
```

### _isAfterTransferHookRequired

```solidity
function _isAfterTransferHookRequired() internal virtual returns (bool)
```

### _isAfterMintHookRequired

```solidity
function _isAfterMintHookRequired() internal virtual returns (bool)
```

### _isAfterBurnHookRequired

```solidity
function _isAfterBurnHookRequired() internal virtual returns (bool)
```

### _beforeTransfer

```solidity
function _beforeTransfer(address, address, uint256) internal virtual returns (uint256 fee)
```

### _beforeMint

```solidity
function _beforeMint(address, uint256) internal virtual
```

### _beforeBurn

```solidity
function _beforeBurn(address, uint256) internal virtual
```

### _afterMint

```solidity
function _afterMint(address, uint256) internal virtual
```

### _afterBurn

```solidity
function _afterBurn(address, uint256) internal virtual
```

### _afterTransfer

```solidity
function _afterTransfer(address, address, uint256, uint256) internal virtual
```

### _onlyAuthorizedToken

```solidity
function _onlyAuthorizedToken() internal virtual
```

## ERC20TransferHookLogic

### beforeTokenTransfer

```solidity
function beforeTokenTransfer(address from_, address to_, uint256 amount_) public virtual returns (bool isAfterHookRequired)
```

_Hook function called before a token transfer operation._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from_ | address | The address of the sender. |
| to_ | address | The address of the receiver. |
| amount_ | uint256 | The amount of tokens to be transferred. Can be overridden by derived contracts to implement custom behavior. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| isAfterHookRequired | bool | A boolean indicating whether the after hook is required. |

### afterTokenTransfer

```solidity
function afterTokenTransfer(address from_, address to_, uint256 amount_, uint256 fee_) internal virtual
```

_Hook function called after a token transfer operation._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from_ | address | The address of the sender. |
| to_ | address | The address of the receiver. |
| amount_ | uint256 | The amount of tokens transferred. |
| fee_ | uint256 | The fee deducted from the transfer. Can be overridden by derived contracts to implement custom behavior. |

### _beforeTransfer

```solidity
function _beforeTransfer(address, address, uint256) internal virtual
```

### _afterTransfer

```solidity
function _afterTransfer(address, address, uint256, uint256) internal virtual
```

### _isAfterTransferHookRequired

```solidity
function _isAfterTransferHookRequired() internal virtual returns (bool)
```

### _onlyTransferHookCaller

```solidity
function _onlyTransferHookCaller() internal virtual
```

## ERC20HookTarget

ERC20HookExt contract implements the storage, events, and errors
for an inheritable ERC20 hook. The inheriting contract must implement
the logic for the ERC20 hook. Specifically, the inheriting contract
must implement the changeERC20Hook and LockERC20Hook functions.

The inheriting contract must also call the _setERC20Hook function in its
constructor/initilization function.

### ERC20HookChanged

```solidity
event ERC20HookChanged(address newHook_)
```

### ERC20HookLocked

```solidity
error ERC20HookLocked()
```

### erc20Hook

```solidity
function erc20Hook() public view returns (address)
```

### erc20HookIsLocked

```solidity
function erc20HookIsLocked() public view returns (bool)
```

### _setERC20Hook

```solidity
function _setERC20Hook(address newHook_) internal
```

### _lockERC20Hook

```solidity
function _lockERC20Hook() internal
```

## MockEnumerableERC20

### updateTokenOwnerList

```solidity
function updateTokenOwnerList(address from, address to, uint256 fromBalance, uint256 toBalance) public
```

## MockERC20HookLogic

### _token

```solidity
address _token
```

### beforeTransferFee

```solidity
uint256 beforeTransferFee
```

### afterHookEnabled

```solidity
bool afterHookEnabled
```

### beforeMintTo

```solidity
address beforeMintTo
```

### beforeMintAmount

```solidity
uint256 beforeMintAmount
```

### afterMintHookRan

```solidity
bool afterMintHookRan
```

### beforeBurnFrom

```solidity
address beforeBurnFrom
```

### beforeBurnAmount

```solidity
uint256 beforeBurnAmount
```

### afterBurnHookRan

```solidity
bool afterBurnHookRan
```

### beforeTransferFrom

```solidity
address beforeTransferFrom
```

### beforeTransferTo

```solidity
address beforeTransferTo
```

### beforeTransferAmount

```solidity
uint256 beforeTransferAmount
```

### afterTransferHookRan

```solidity
bool afterTransferHookRan
```

### constructor

```solidity
constructor(address token_) public
```

### turnOnAfterHook

```solidity
function turnOnAfterHook() external
```

### turnOffAfterHook

```solidity
function turnOffAfterHook() external
```

### _isAfterTransferHookRequired

```solidity
function _isAfterTransferHookRequired() internal view returns (bool)
```

### _isAfterMintHookRequired

```solidity
function _isAfterMintHookRequired() internal view returns (bool)
```

### _isAfterBurnHookRequired

```solidity
function _isAfterBurnHookRequired() internal view returns (bool)
```

### _beforeMint

```solidity
function _beforeMint(address to_, uint256 amount_) internal virtual
```

### _beforeBurn

```solidity
function _beforeBurn(address from_, uint256 amount_) internal virtual
```

### _beforeTransfer

```solidity
function _beforeTransfer(address from_, address to_, uint256 amount_) internal virtual returns (uint256 fee)
```

### _afterMint

```solidity
function _afterMint(address to_, uint256 amount_) internal virtual
```

### _afterBurn

```solidity
function _afterBurn(address from_, uint256 amount_) internal virtual
```

### _afterTransfer

```solidity
function _afterTransfer(address from_, address to_, uint256 amount_, uint256 fee_) internal virtual
```

### _onlyAuthorizedToken

```solidity
function _onlyAuthorizedToken() internal
```

## ERC20Mock

### constructor

```solidity
constructor(string name_, string symbol_) public
```

### mint

```solidity
function mint(address to_, uint256 amount_) external returns (bool)
```

### burn

```solidity
function burn(address from_, uint256 amount_) external returns (bool)
```

## MockAssetNFT

### AssetData

```solidity
struct AssetData {
  uint256 erc20Value;
}
```

### assets

```solidity
mapping(uint256 => struct MockAssetNFT.AssetData) assets
```

### _frozenAccounts

```solidity
mapping(address => bool) _frozenAccounts
```

### FrozeAccount

```solidity
event FrozeAccount(address account_)
```

### UnfrozeAccount

```solidity
event UnfrozeAccount(address account_)
```

### AccountFrozen

```solidity
error AccountFrozen(address account_)
```

### AccountNotFrozen

```solidity
error AccountNotFrozen(address account_)
```

### constructor

```solidity
constructor() public
```

### mint

```solidity
function mint(uint256 erc20Value_, uint256 tokenId_, address to_) public
```

### getTokenValue

```solidity
function getTokenValue(uint256 tokenId) public view returns (uint256)
```

### freezeAccount

```solidity
function freezeAccount(address account_) public
```

### unfreezeAccount

```solidity
function unfreezeAccount(address account_) public
```

### _isFrozen

```solidity
function _isFrozen(address account_) internal view returns (bool)
```

## MockERC721Receiver

### onERC721Received

```solidity
function onERC721Received(address, address, uint256, bytes) external pure returns (bytes4)
```

## MockUUPSLogic

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize() public
```

_Initializes the BridgePoolFactory contract.
This function can only be called by the authorized initializer._

### call1

```solidity
function call1() external pure returns (uint256)
```

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

_Authorizes an upgrade._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newImplementation | address | The address of the new implementation. This function can only be called by an admin. |

## MockUUPSLogicV2

### constructor

```solidity
constructor() public
```

### Unauthorized

```solidity
error Unauthorized()
```

### initialize

```solidity
function initialize() public
```

_Initializes the BridgePoolFactory contract.
This function can only be called by the authorized initializer._

### call2

```solidity
function call2() external pure returns (uint256)
```

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

_Authorizes an upgrade._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newImplementation | address | The address of the new implementation. This function can only be called by an admin. |

## MockERC20HookTarget

### constructor

```solidity
constructor(address a_) public
```

### setERC20Hook

```solidity
function setERC20Hook(address a_) public
```

### lockERC20Hook

```solidity
function lockERC20Hook() public
```

## MockFees

### initialize

```solidity
function initialize(uint24 fee_) internal
```

### _onlyFeesAdmin

```solidity
function _onlyFeesAdmin() internal
```

## MockInitializable

### initialized

```solidity
bool initialized
```

### initialize

```solidity
function initialize() public
```

## UUPSProxy

### ConstructionFailed

```solidity
error ConstructionFailed()
```

### constructor

```solidity
constructor(address logicContract, bytes initCallData) public
```

## c_77292984

```solidity
function c_77292984(bytes8 c__77292984) internal pure
```

## c_true77292984

```solidity
function c_true77292984(bytes8 c__77292984) internal pure returns (bool)
```

## c_false77292984

```solidity
function c_false77292984(bytes8 c__77292984) internal pure returns (bool)
```

## _AdHokBurner

### burn

```solidity
function burn(address account, uint256 amount) external returns (bool)
```

## _AdHokMinter

### mint

```solidity
function mint(address account, uint256 amount) external returns (bool)
```

## _AdHocToken

### mint

```solidity
function mint(address account, uint256 amount) external returns (bool)
```

### burn

```solidity
function burn(address account, uint256 amount) external returns (bool)
```

## GenericTokenMiddleware

This library contains the variables and functions necessary to
to interact with a GenericToken ERC20 contract

### c_42cf2a6a

```solidity
function c_42cf2a6a(bytes8 c__42cf2a6a) internal pure
```

### c_true42cf2a6a

```solidity
function c_true42cf2a6a(bytes8 c__42cf2a6a) internal pure returns (bool)
```

### c_false42cf2a6a

```solidity
function c_false42cf2a6a(bytes8 c__42cf2a6a) internal pure returns (bool)
```

### MiddlewareData

```solidity
struct MiddlewareData {
  contract _AdHocToken _token;
  bool _isLocked;
}
```

### TransferFromFailure

```solidity
error TransferFromFailure()
```

### TransferFailure

```solidity
error TransferFailure()
```

### BurnFailure

```solidity
error BurnFailure()
```

### MintFailure

```solidity
error MintFailure()
```

### _setToken

```solidity
function _setToken(struct GenericTokenMiddleware.MiddlewareData self, address token_) internal
```

_sets the token contract address_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct GenericTokenMiddleware.MiddlewareData | storage pointer to MiddlewareData struct |
| token_ | address | address of token contract |

### _lockToken

```solidity
function _lockToken(struct GenericTokenMiddleware.MiddlewareData self) internal
```

_locks the token address, preventing it from being changed_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct GenericTokenMiddleware.MiddlewareData | storage pointer to MiddlewareData struct |

### _symbol

```solidity
function _symbol(struct GenericTokenMiddleware.MiddlewareData self) internal view returns (string)
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct GenericTokenMiddleware.MiddlewareData | storage pointer to MiddlewareData struct |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | symbol of token |

### _name

```solidity
function _name(struct GenericTokenMiddleware.MiddlewareData self) internal view returns (string)
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct GenericTokenMiddleware.MiddlewareData | storage pointer to MiddlewareData struct |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | name of token |

### _tokenAddr

```solidity
function _tokenAddr(struct GenericTokenMiddleware.MiddlewareData self) internal view returns (address)
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct GenericTokenMiddleware.MiddlewareData | storage pointer to MiddlewareData struct |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address of token contract |

### _balance

```solidity
function _balance(struct GenericTokenMiddleware.MiddlewareData self) internal view returns (uint256)
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct GenericTokenMiddleware.MiddlewareData | storage pointer to MiddlewareData struct |

### _transferFrom

```solidity
function _transferFrom(struct GenericTokenMiddleware.MiddlewareData self, address from_, uint256 amount_) internal
```

_calls the transferFrom function in the token contract, balance is transfered to this contract
reverts on failure_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct GenericTokenMiddleware.MiddlewareData | storage pointer to MiddlewareData struct |
| from_ | address | address to transfer tokens from |
| amount_ | uint256 | amount of tokens to transfer |

### _transfer

```solidity
function _transfer(struct GenericTokenMiddleware.MiddlewareData self, address to_, uint256 amount_) internal
```

_calls the transfer function in the token contract with to and amount, and sends from caller's balance.
reverts on failure_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct GenericTokenMiddleware.MiddlewareData | storage pointer to MiddlewareData struct |
| to_ | address | address to transfer tokens to |
| amount_ | uint256 | amount of tokens to transfer |

### _burnFrom

```solidity
function _burnFrom(struct GenericTokenMiddleware.MiddlewareData self, address from_, uint256 amount_) internal
```

_calls the burn function in the token contract with from and amount, reverts on failure_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct GenericTokenMiddleware.MiddlewareData | storage pointer to MiddlewareData struct |
| from_ | address | address to burn tokens from |
| amount_ | uint256 | amount of tokens to burn |

### _mintTo

```solidity
function _mintTo(struct GenericTokenMiddleware.MiddlewareData self, address to_, uint256 amount_) internal
```

_calls the mint function in the token contract with to and amount, reverts on failure_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct GenericTokenMiddleware.MiddlewareData | storage pointer to MiddlewareData struct |
| to_ | address | address to mint tokens to |
| amount_ | uint256 | amount of tokens to mint |

## c_e5bef4bc

```solidity
function c_e5bef4bc(bytes8 c__e5bef4bc) internal pure
```

## c_truee5bef4bc

```solidity
function c_truee5bef4bc(bytes8 c__e5bef4bc) internal pure returns (bool)
```

## c_falsee5bef4bc

```solidity
function c_falsee5bef4bc(bytes8 c__e5bef4bc) internal pure returns (bool)
```

## TokenRole

contract implements the storage, events, and errors
for an inheritable TokenRole. This role is intended to protect
against any contract other than the actual token from invoking
the hooks.

### c_6814436b

```solidity
function c_6814436b(bytes8 c__6814436b) internal pure
```

### c_true6814436b

```solidity
function c_true6814436b(bytes8 c__6814436b) internal pure returns (bool)
```

### c_false6814436b

```solidity
function c_false6814436b(bytes8 c__6814436b) internal pure returns (bool)
```

### TokenChange

```solidity
event TokenChange(address newToken_)
```

### NotToken

```solidity
error NotToken()
```

### TokenLocked

```solidity
error TokenLocked()
```

### onlyToken

```solidity
modifier onlyToken()
```

### token

```solidity
function token() public view returns (address)
```

### _setTokenRole

```solidity
function _setTokenRole(address newToken_) internal
```

### _lockToken

```solidity
function _lockToken() internal
```

## c_48fe884b

```solidity
function c_48fe884b(bytes8 c__48fe884b) internal pure
```

## c_true48fe884b

```solidity
function c_true48fe884b(bytes8 c__48fe884b) internal pure returns (bool)
```

## c_false48fe884b

```solidity
function c_false48fe884b(bytes8 c__48fe884b) internal pure returns (bool)
```

## UserAllocationData

```solidity
struct UserAllocationData {
  uint256 tokenID;
  uint256 totalShares;
  uint256 amount;
}
```

## PositionAllocationData

```solidity
struct PositionAllocationData {
  address owner;
  uint256 amount;
}
```

## AllocationRegistryBase

### c_6ed74850

```solidity
function c_6ed74850(bytes8 c__6ed74850) internal pure
```

### c_true6ed74850

```solidity
function c_true6ed74850(bytes8 c__6ed74850) internal pure returns (bool)
```

### c_false6ed74850

```solidity
function c_false6ed74850(bytes8 c__6ed74850) internal pure returns (bool)
```

### c_modbaf53ef6

```solidity
modifier c_modbaf53ef6()
```

### c_mod8ff63590

```solidity
modifier c_mod8ff63590()
```

### c_modb2d43d30

```solidity
modifier c_modb2d43d30()
```

### c_mod9baa68b2

```solidity
modifier c_mod9baa68b2()
```

### c_mod0e54f110

```solidity
modifier c_mod0e54f110()
```

### c_mod8a935acf

```solidity
modifier c_mod8a935acf()
```

### c_mod25fe687b

```solidity
modifier c_mod25fe687b()
```

### c_mod5c310f2f

```solidity
modifier c_mod5c310f2f()
```

### c_mod84defccd

```solidity
modifier c_mod84defccd()
```

### c_mod9ef1460b

```solidity
modifier c_mod9ef1460b()
```

### c_mod850eafbd

```solidity
modifier c_mod850eafbd()
```

### c_mod064f2a02

```solidity
modifier c_mod064f2a02()
```

### __AllocationRegistryBase_init

```solidity
function __AllocationRegistryBase_init(address admin_, address operator_, address erc20Token_, address erc721Token_) internal
```

### ERC20_TOKEN_ROLE

```solidity
bytes32 ERC20_TOKEN_ROLE
```

### ERC721_TOKEN_ROLE

```solidity
bytes32 ERC721_TOKEN_ROLE
```

### OPERATOR_ROLE

```solidity
bytes32 OPERATOR_ROLE
```

### InsufficientBalance

```solidity
error InsufficientBalance()
```

### InsufficientAllocation

```solidity
error InsufficientAllocation(uint256 balance, uint256 required)
```

### onlyOperator

```solidity
modifier onlyOperator()
```

_access retrictor for operator role_

### onlyERC20Token

```solidity
modifier onlyERC20Token()
```

_access retrictor for ERC20 Token role_

### onlyERC721Token

```solidity
modifier onlyERC721Token()
```

_access retrictor for ERC721 Token role_

### changeOperatorRole

```solidity
function changeOperatorRole(address roleOwner_) public
```

_this function sets or changes the operator role_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| roleOwner_ | address | address to assign the operator role to |

### lockOperatorRole

```solidity
function lockOperatorRole() public
```

### changeERC20TokenRole

```solidity
function changeERC20TokenRole(address roleOwner_) public
```

_this function sets or changes the ERC20 Token role_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| roleOwner_ | address | address to assign the ERC20 Token role to |

### changeERC721TokenRole

```solidity
function changeERC721TokenRole(address roleOwner_) public
```

_this function sets or changes the ERC721 Token role_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| roleOwner_ | address | address to assign the ERC721 Token role to |

### lockERC20TokenRole

```solidity
function lockERC20TokenRole() public
```

_this function locks the ERC20 Token role_

### getUserPositionAmount

```solidity
function getUserPositionAmount(address owner_, uint256 tokenID_) public view returns (uint256)
```

_this is a view function to get the amount of tokens in a users position_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner_ | address | address of the user |
| tokenID_ | uint256 | the tokenID of the position |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | the amount of tokens in the position |

### getUserTotalPositions

```solidity
function getUserTotalPositions(address user_) public view returns (uint256)
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user_ | address | address of the user returns the total number of positions a user has |

### getUserPositions

```solidity
function getUserPositions(address owner_, uint256 start_, uint256 end_) public view returns (struct UserAllocationData[])
```

### getUserPositions

```solidity
function getUserPositions(address owner_) public view returns (struct UserAllocationData[])
```

### getPostionOwners

```solidity
function getPostionOwners(uint256 tokenID_) public view returns (struct PositionAllocationData[])
```

### isPositionFullyAllocated

```solidity
function isPositionFullyAllocated(address user_, uint256 tokenID_) public view returns (bool)
```

### _allocateNewPosition

```solidity
function _allocateNewPosition(uint256 tokenID_, address owner_, uint256 gcoinValue_) internal
```

_this function adds a new position to the registry_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenID_ | uint256 | new tokenID to add |
| owner_ | address | owner of the new position |
| gcoinValue_ | uint256 | gcoin value of the new position |

### _oneToOneRebalance

```solidity
function _oneToOneRebalance(uint256 position1_, uint256 position2_, address user1_, address user2_, uint256 amount_) internal
```

### _rebalanceAllocation

```solidity
function _rebalanceAllocation(uint256 position1_, uint256 position2_, address user_, uint256 amount_) internal
```

this function swaps allocations from position1 to position2
fragmenting position1 and consolidating position2

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| position1_ | uint256 | the tokenID of the position to move from |
| position2_ | uint256 | the tokenID of the position to consolidate to |
| user_ | address | the address of the user performing rebalance |
| amount_ | uint256 | the amount of tokens to rebalance |

### _transferAllocation

```solidity
function _transferAllocation(address from_, address to_, uint256 amount_) internal
```

_this function transfers the allocation from one user to another_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from_ | address | address of the sender |
| to_ | address | address of the receiver |
| amount_ | uint256 | the amount of tokens to transfer TODO fix this or get rid of this contract |

### _addToUserPositions

```solidity
function _addToUserPositions(address user_, uint256 tokenID_, uint256 amount_) internal
```

### _subtractFromUserPosition

```solidity
function _subtractFromUserPosition(address user_, uint256 tokenID_, uint256 amount_) internal
```

### _burnAllocation

```solidity
function _burnAllocation(address owner_, uint256 tokenID_) internal returns (uint256 totalShares)
```

_this function burns the allocation NFT and removes the position from the user_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner_ | address | address of the user |
| tokenID_ | uint256 | the tokenID of the position |

### _getUserPositionAmount

```solidity
function _getUserPositionAmount(address owner_, uint256 tokenID_) internal view returns (uint256)
```

_this function returns the amount of tokens in the position_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner_ | address | address of the user |
| tokenID_ | uint256 | the tokenID of the position |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | the amount of tokens in the position |

### _getUserPositions

```solidity
function _getUserPositions(address owner_) internal view returns (struct UserAllocationData[] positions)
```

### _getUserPositions

```solidity
function _getUserPositions(address owner_, uint256 start_, uint256 end_) internal view returns (struct UserAllocationData[] positions)
```

_this function allows pagination of the user's positions_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner_ | address | address of the user |
| start_ | uint256 | the index of the first position to return |
| end_ | uint256 | the index of the last position to return |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| positions | struct UserAllocationData[] | a list of objects containing the tokenID, total shares, and user shares |

### _getUserTotalPositions

```solidity
function _getUserTotalPositions(address user_) internal view returns (uint256)
```

_this function returns the amount of positions a user has_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user_ | address | address of the user |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | the amount of positions a user has |

### _getPositionOwners

```solidity
function _getPositionOwners(uint256 tokenID_) internal view returns (struct PositionAllocationData[] owners)
```

_this function returns a list of users that have ownership in the position_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenID_ | uint256 | the tokenID of the position |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| owners | struct PositionAllocationData[] | a list of users and their allocated balances |

### _getPositionTotalShares

```solidity
function _getPositionTotalShares(uint256 tokenID_) internal view returns (uint256)
```

### _isFullyAllocated

```solidity
function _isFullyAllocated(address user_, uint256 tokenID_) internal view returns (bool)
```

## c_b1c1f90d

```solidity
function c_b1c1f90d(bytes8 c__b1c1f90d) internal pure
```

## c_trueb1c1f90d

```solidity
function c_trueb1c1f90d(bytes8 c__b1c1f90d) internal pure returns (bool)
```

## c_falseb1c1f90d

```solidity
function c_falseb1c1f90d(bytes8 c__b1c1f90d) internal pure returns (bool)
```

## ChainIDAware

This contract contains the variables and functions necessary to
approve and invalidate destination chains for token transfers.

### c_4c1d011a

```solidity
function c_4c1d011a(bytes8 c__4c1d011a) internal pure
```

### c_true4c1d011a

```solidity
function c_true4c1d011a(bytes8 c__4c1d011a) internal pure returns (bool)
```

### c_false4c1d011a

```solidity
function c_false4c1d011a(bytes8 c__4c1d011a) internal pure returns (bool)
```

### _approvedDestinations

```solidity
struct EnumerableMap.UintToUintMap _approvedDestinations
```

### _nativeChainID

```solidity
uint256 _nativeChainID
```

### ChainNotApproved

```solidity
error ChainNotApproved(uint256 chain)
```

_Emitted when attempting to transfer tokens to an unapproved destination chain._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| chain | uint256 | The ID of the destination chain. |

### NotNativeChain

```solidity
error NotNativeChain()
```

### onlyNativeChain

```solidity
modifier onlyNativeChain()
```

### approvedChains

```solidity
function approvedChains() public view returns (uint256[])
```

_Returns an array of approved destination chains for token transfers._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | An array of approved destination chain IDs. |

### nativeChainID

```solidity
function nativeChainID() public view returns (uint256)
```

_Returns the native chain ID of the token._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The native chain ID. |

### getPoolAddress

```solidity
function getPoolAddress(uint256 chain_) public view returns (address)
```

_Returns the address of the bridge pool on the destination chain._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| chain_ | uint256 | The ID of the destination chain. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the bridge pool on the destination chain. |

### isApprovedChain

```solidity
function isApprovedChain(uint256 chain_) public view returns (bool)
```

_Checks if a chain is approved for token transfers._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| chain_ | uint256 | The ID of the chain to be checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | A boolean value indicating whether the chain is approved. |

### _getPoolAddress

```solidity
function _getPoolAddress(uint256 chain_) internal view returns (address)
```

### _approveChainDest

```solidity
function _approveChainDest(uint256 dest_, address poolAddress_) internal returns (bool)
```

_Approves a destination chain for token transfers._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| dest_ | uint256 | The ID of the destination chain to be approved. |
| poolAddress_ | address | The address of the bridge pool on the destination chain. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | A boolean value indicating whether the operation succeeded. |

### _revokeChainDest

```solidity
function _revokeChainDest(uint256 dest_) internal returns (bool)
```

_Revokes a previously approved destination chain for token transfers._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| dest_ | uint256 | The ID of the destination chain to be revoked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | A boolean value indicating whether the operation succeeded. |

### _setNativeChainID

```solidity
function _setNativeChainID(uint256 nativeChainID_) internal
```

_Sets the native chain ID of the token._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| nativeChainID_ | uint256 | The ID of the native chain to be set. |

### _isNativeChain

```solidity
function _isNativeChain() internal view returns (bool)
```

_Checks if the current chain is the native chain of the token._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | A boolean value indicating whether the current chain is the native chain. |

### _validateChain

```solidity
function _validateChain(uint256 chain_) internal view
```

_Validates if a chain is approved for token transfers._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| chain_ | uint256 | The ID of the chain to be validated. If the chain is not approved, the function will revert with a ChainNotApproved error. |

## c_eb613d81

```solidity
function c_eb613d81(bytes8 c__eb613d81) internal pure
```

## c_trueeb613d81

```solidity
function c_trueeb613d81(bytes8 c__eb613d81) internal pure returns (bool)
```

## c_falseeb613d81

```solidity
function c_falseeb613d81(bytes8 c__eb613d81) internal pure returns (bool)
```

## NonceCounter

### c_a4020e6d

```solidity
function c_a4020e6d(bytes8 c__a4020e6d) internal pure
```

### c_truea4020e6d

```solidity
function c_truea4020e6d(bytes8 c__a4020e6d) internal pure returns (bool)
```

### c_falsea4020e6d

```solidity
function c_falsea4020e6d(bytes8 c__a4020e6d) internal pure returns (bool)
```

### nonce

```solidity
function nonce() public view returns (uint128)
```

### _incrementNonce

```solidity
function _incrementNonce() internal returns (uint128)
```

## c_c96c792d

```solidity
function c_c96c792d(bytes8 c__c96c792d) internal pure
```

## c_truec96c792d

```solidity
function c_truec96c792d(bytes8 c__c96c792d) internal pure returns (bool)
```

## c_falsec96c792d

```solidity
function c_falsec96c792d(bytes8 c__c96c792d) internal pure returns (bool)
```

## NonceTracker

### c_f2e66649

```solidity
function c_f2e66649(bytes8 c__f2e66649) internal pure
```

### c_truef2e66649

```solidity
function c_truef2e66649(bytes8 c__f2e66649) internal pure returns (bool)
```

### c_falsef2e66649

```solidity
function c_falsef2e66649(bytes8 c__f2e66649) internal pure returns (bool)
```

### NonceAlreadyConsumed

```solidity
error NonceAlreadyConsumed(uint128 sourceChain_, uint128 nonce_)
```

### isNonceConsumed

```solidity
function isNonceConsumed(uint128 sourceChain_, uint128 nonce_) public view returns (bool)
```

### _isNonceConsumed

```solidity
function _isNonceConsumed(uint128 sourceChain_, uint128 nonce_) internal view returns (bool)
```

### _consumeNonce

```solidity
function _consumeNonce(uint128 sourceChain_, uint128 nonce_) internal
```

## c_e4bd3ac7

```solidity
function c_e4bd3ac7(bytes8 c__e4bd3ac7) internal pure
```

## c_truee4bd3ac7

```solidity
function c_truee4bd3ac7(bytes8 c__e4bd3ac7) internal pure returns (bool)
```

## c_falsee4bd3ac7

```solidity
function c_falsee4bd3ac7(bytes8 c__e4bd3ac7) internal pure returns (bool)
```

## Pause

### c_fc487d2c

```solidity
function c_fc487d2c(bytes8 c__fc487d2c) internal pure
```

### c_truefc487d2c

```solidity
function c_truefc487d2c(bytes8 c__fc487d2c) internal pure returns (bool)
```

### c_falsefc487d2c

```solidity
function c_falsefc487d2c(bytes8 c__fc487d2c) internal pure returns (bool)
```

### ErrPaused

```solidity
error ErrPaused()
```

### ErrUnpaused

```solidity
error ErrUnpaused()
```

### Paused

```solidity
event Paused(bytes4 funcSig)
```

### Unpaused

```solidity
event Unpaused(bytes4 funcSig)
```

### GloballyPaused

```solidity
event GloballyPaused()
```

### GloballyUnpaused

```solidity
event GloballyUnpaused()
```

### PauseData

```solidity
struct PauseData {
  bool _globalPauseCB;
  mapping(bytes4 => bool) _pausedFunctions;
}
```

### _whenNotPaused

```solidity
function _whenNotPaused(struct Pause.PauseData self) internal view
```

### _globalPaused

```solidity
function _globalPaused(struct Pause.PauseData self) internal view returns (bool)
```

### _paused

```solidity
function _paused(struct Pause.PauseData self, bytes4 funcSig_) internal view returns (bool)
```

### _globalPause

```solidity
function _globalPause(struct Pause.PauseData self) internal
```

### _globalUnpause

```solidity
function _globalUnpause(struct Pause.PauseData self) internal
```

### _pause

```solidity
function _pause(struct Pause.PauseData self, bytes4 funcSig_) internal
```

### _unpause

```solidity
function _unpause(struct Pause.PauseData self, bytes4 funcSig_) internal
```

## Pauseable

### c_eb00437b

```solidity
function c_eb00437b(bytes8 c__eb00437b) internal pure
```

### c_trueeb00437b

```solidity
function c_trueeb00437b(bytes8 c__eb00437b) internal pure returns (bool)
```

### c_falseeb00437b

```solidity
function c_falseeb00437b(bytes8 c__eb00437b) internal pure returns (bool)
```

### whenNotPaused

```solidity
modifier whenNotPaused()
```

### whenPaused

```solidity
modifier whenPaused()
```

### whenGloballyPaused

```solidity
modifier whenGloballyPaused()
```

### globalPaused

```solidity
function globalPaused() public view returns (bool)
```

### paused

```solidity
function paused(bytes4 funcSig_) public view returns (bool)
```

### _pause

```solidity
function _pause(bytes4 funcSig_) internal
```

### _unpause

```solidity
function _unpause(bytes4 funcSig_) internal
```

### _globalPause

```solidity
function _globalPause() internal
```

### _globalUnpause

```solidity
function _globalUnpause() internal
```

## c_651a2722

```solidity
function c_651a2722(bytes8 c__651a2722) internal pure
```

## c_true651a2722

```solidity
function c_true651a2722(bytes8 c__651a2722) internal pure returns (bool)
```

## c_false651a2722

```solidity
function c_false651a2722(bytes8 c__651a2722) internal pure returns (bool)
```

## MockGenericToken

_This token is a mock of the generic token. The purpose of this contact is to test the ERC20 hook target_

### c_b6a913d8

```solidity
function c_b6a913d8(bytes8 c__b6a913d8) internal pure
```

### c_trueb6a913d8

```solidity
function c_trueb6a913d8(bytes8 c__b6a913d8) internal pure returns (bool)
```

### c_falseb6a913d8

```solidity
function c_falseb6a913d8(bytes8 c__b6a913d8) internal pure returns (bool)
```

### c_mod7c3c675f

```solidity
modifier c_mod7c3c675f()
```

### c_modaff7f78d

```solidity
modifier c_modaff7f78d()
```

### MINTER_ROLE

```solidity
bytes32 MINTER_ROLE
```

### BURNER_ROLE

```solidity
bytes32 BURNER_ROLE
```

### FEE_COLLECTOR_ROLE

```solidity
bytes32 FEE_COLLECTOR_ROLE
```

### roleCounts

```solidity
mapping(bytes32 => uint256) roleCounts
```

### RoleStats

```solidity
struct RoleStats {
  bool locked;
  address member;
}
```

### RoleIsLocked

```solidity
error RoleIsLocked(bytes32 role)
```

### RoleCanOnlyBeGrantedToOneAccount

```solidity
error RoleCanOnlyBeGrantedToOneAccount(bytes32 role)
```

### RoleLocked

```solidity
event RoleLocked(bytes32 role)
```

### initialize

```solidity
function initialize(uint8 decimals_, string name_, string symbol_) public
```

### changeERC20Hook

```solidity
function changeERC20Hook(address newHook_) public
```

_Changes the ERC20 hook to a new address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newHook_ | address | The address of the new ERC20 hook. |

### lockERC20Hook

```solidity
function lockERC20Hook() public
```

_Locks the ERC20 hook, preventing further changes._

### mint

```solidity
function mint(address to_, uint256 amount_) public returns (bool)
```

_Mints new tokens and adds them to the balance of the specified account.
Can only be called by an account with the minter role._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to_ | address | The account to add the minted tokens to. |
| amount_ | uint256 | The amount of tokens to mint. |

### burn

```solidity
function burn(address from_, uint256 amount_) external returns (bool)
```

_Burns tokens from the balance of the specified account.
Can only be called by an account with the burner role._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from_ | address | The account to burn the tokens from. |
| amount_ | uint256 | The amount of tokens to burn. |

### burner

```solidity
function burner() public view returns (address)
```

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | the address of the current burner |

### minter

```solidity
function minter() public view returns (address)
```

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | the address of the current minter |

### decimals

```solidity
function decimals() public view returns (uint8)
```

_Returns the number of decimals the token uses._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint8 | The number of decimals the token uses. |

### _transfer

```solidity
function _transfer(uint256 amount_, address from_, address to_) internal returns (bool)
```

_This function wraps the base _transfer function
This function invokes the custom before and after hook logic.

This function short circuits to just perform a transfer
if the hook address is zero. if the hook address is not
zero, then the hook logic is called.

The hook logic is as follows:

The before hook is called first and is passed the
`from_`, `to_`, and `amount_` parameters. The before hook
returns a fee amount and a bool to indicate if after hook should
be called.

If the `fee` is greater than zero, `fee` is transfered to
the this contracts control. The fee is taken from the caller's
balance to ensure that the amount tranfered to `to` matches `amount`.
If the `fee` is zero, then no fee is collected.

Next, the caller's intended transfer is performed.

Lastly, the after hook is called only if the after hook required
flag is returned as true by the before hook call. If the after
hook is required, it is passed the from, to, amount, and fee
parameters._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount_ | uint256 | How much to transfer. |
| from_ | address | Who to transfer from. |
| to_ | address | Who to transfer to. |

## c_7a56e1d8

```solidity
function c_7a56e1d8(bytes8 c__7a56e1d8) internal pure
```

## c_true7a56e1d8

```solidity
function c_true7a56e1d8(bytes8 c__7a56e1d8) internal pure returns (bool)
```

## c_false7a56e1d8

```solidity
function c_false7a56e1d8(bytes8 c__7a56e1d8) internal pure returns (bool)
```

## MockPausable

### c_b3046c5e

```solidity
function c_b3046c5e(bytes8 c__b3046c5e) internal pure
```

### c_trueb3046c5e

```solidity
function c_trueb3046c5e(bytes8 c__b3046c5e) internal pure returns (bool)
```

### c_falseb3046c5e

```solidity
function c_falseb3046c5e(bytes8 c__b3046c5e) internal pure returns (bool)
```

### c_mod7938cf86

```solidity
modifier c_mod7938cf86()
```

### c_mode57e391c

```solidity
modifier c_mode57e391c()
```

### c_modcf6f1e52

```solidity
modifier c_modcf6f1e52()
```

### c_mod130fdbe9

```solidity
modifier c_mod130fdbe9()
```

### c_moda5078b3e

```solidity
modifier c_moda5078b3e()
```

### c_mod906718f0

```solidity
modifier c_mod906718f0()
```

### pauseFunc

```solidity
function pauseFunc(bytes4 funcSig_) public
```

### unpauseFunc

```solidity
function unpauseFunc(bytes4 funcSig_) public
```

### globalPause

```solidity
function globalPause() public
```

### globalUnpause

```solidity
function globalUnpause() public
```

### onlyWhenNotPaused

```solidity
function onlyWhenNotPaused() public view
```

### onlyWhenPaused

```solidity
function onlyWhenPaused() public view
```

### onlyWhenGlobalPaused

```solidity
function onlyWhenGlobalPaused() public view
```

## c_93b486c4

```solidity
function c_93b486c4(bytes8 c__93b486c4) internal pure
```

## c_true93b486c4

```solidity
function c_true93b486c4(bytes8 c__93b486c4) internal pure returns (bool)
```

## c_false93b486c4

```solidity
function c_false93b486c4(bytes8 c__93b486c4) internal pure returns (bool)
```

## MockGenericTokenMiddleware

### c_42169c40

```solidity
function c_42169c40(bytes8 c__42169c40) internal pure
```

### c_true42169c40

```solidity
function c_true42169c40(bytes8 c__42169c40) internal pure returns (bool)
```

### c_false42169c40

```solidity
function c_false42169c40(bytes8 c__42169c40) internal pure returns (bool)
```

### middleware

```solidity
struct GenericTokenMiddleware.MiddlewareData middleware
```

### constructor

```solidity
constructor(address token_) public
```

### transferFrom

```solidity
function transferFrom(address from_, uint256 amount_) public
```

### transfer

```solidity
function transfer(address to_, uint256 amount_) public
```

### burnFrom

```solidity
function burnFrom(address from_, uint256 amount_) public
```

### mintTo

```solidity
function mintTo(address to_, uint256 amount_) public
```

### setToken

```solidity
function setToken(address token_) public
```

### symbol

```solidity
function symbol() public view returns (string)
```

### name

```solidity
function name() public view returns (string)
```

### tokenAddr

```solidity
function tokenAddr() public view returns (address)
```

### balance

```solidity
function balance() public view returns (uint256)
```

## c_21a31ba8

```solidity
function c_21a31ba8(bytes8 c__21a31ba8) internal pure
```

## c_true21a31ba8

```solidity
function c_true21a31ba8(bytes8 c__21a31ba8) internal pure returns (bool)
```

## c_false21a31ba8

```solidity
function c_false21a31ba8(bytes8 c__21a31ba8) internal pure returns (bool)
```

## MockNonceTracker

### c_ec7f875c

```solidity
function c_ec7f875c(bytes8 c__ec7f875c) internal pure
```

### c_trueec7f875c

```solidity
function c_trueec7f875c(bytes8 c__ec7f875c) internal pure returns (bool)
```

### c_falseec7f875c

```solidity
function c_falseec7f875c(bytes8 c__ec7f875c) internal pure returns (bool)
```

### consumeNonce

```solidity
function consumeNonce(uint128 sourceChain_, uint128 nonce_) public
```

