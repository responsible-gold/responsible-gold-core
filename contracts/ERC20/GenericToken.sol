// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
import "contracts/libraries/access/accessControl/AccessControlLockableInitializable.sol";
import "contracts/interfaces/IExtHooks/IExtHooks.sol";
import "contracts/libraries/access/targets/hook/ExtHookTarget.sol";
import "contracts/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "contracts/libraries/fees/fees.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol";
import "contracts/ERC721/IAssetNFT.sol";
import "contracts/libraries/ERC20/EnumerableERC20.sol";

abstract contract DecimalOveride {
    uint8 private _decimals;

    function _getDecimals() internal view returns (uint8) {
        return _decimals;
    }

    function _setDecimals(uint8 decimals_) internal {
        _decimals = decimals_;
    }
}

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

/**
 * @title GenericToken
 * @author Hunter Prendergast
 * @notice This is a generic token contract that can be used as is
 * for almost any ERC20 token specification.
 *
 * @dev This token is designed to be extended through the calling of external
 * contracts during `_transfer`.
 *
 * These external calls operate in the same manner as OpenZepplin's
 * hooks, but they allow the logic to exist outside the core token logic.
 * This allows for the core token logic to be immutable and for the
 * hook logic to be upgradeable. This hook logic has been optimalized
 * to only incur one additional SLOAD per transfer if no hook is used.
 * The hook logic address may be locked to prevent future upgrades.
 *
 * If fees are collected, they are transfered to the custody of this
 * token contract and may be collected by the `feeCollector` role.
 *
 * Further, the `mint` and `burn` functions are only callable by the
 * `minter` and `burner` roles respectively. These roles are also
 * upgradeable and are designed to be locked once the system is
 * mature. If it is desired that the end user be able to mint and
 * burn tokens, then the `minter` and `burner` roles should have public
 * functions that allow the user to call them for these purposes.
 *
 */
contract GenericToken is
    AccessControlLockableInitializable,
    ERC20PausableUpgradeable,
    // Extension storage and internal functions
    ExtHookTarget,
    DecimalOveride,
    Fees,
    IGenericToken,
    IERC721ReceiverUpgradeable,
    EnumerableERC20
{
    bytes32 public constant FEE_COLLECTOR_ROLE =
        keccak256("FEE_COLLECTOR_ROLE");
    bytes32 public constant ASSET_GOVERNOR_ROLE =
        keccak256("ASSET_GOVERNOR_ROLE");
    IAssetNFT internal _assetNFT;
    // mapping of asset nft value to list of token ids
    mapping(uint256 => uint256[]) internal _assetNFTValueToTokenIds;
    // mapping account to frozen status
    mapping(address => bool) internal _frozenAccounts;
    error NoNFTWithValue(uint256 amount_);
    error MissingAssetNFTAddress();
    error MissingAssetGovernorAddress();
    error AccountFrozen(address account_);
    error AccountNotFrozen(address account_);
    error NotOwnerOfNFT(uint256 tokenID_);
    event RecapturedFrozenFunds(address account_);
    event FrozeAccount(address account_);
    event UnfrozeAccount(address account_);
    event FeeCollectorChanged(address newFeeCollector);
    event FeeCollectorLocked();
    event AssetGovernorChanged(address newAssetGovernor);
    event AssetGovernorLocked();

    /**
     * @dev This contract uses the OpenZeppelin-Upgradable definitions
     * but these contracts should never be deployed in an upgradeable manner.
     * Token contracts and other core infrastructure should be deployed in
     * a manner that protects users to the greatest extent possible.
     * Rather than upgrading the core handling logic of the system, the
     * system should be upgraded by changing out peripheral contracts while
     * leaving the core logic untouched. Further, by building these peripheral
     * contracts variables such that they may be locked to prevent future
     * manipulation, the system built in layers and locked down as the systems
     * tech stack matures.
     *
     *
     */
    constructor() {}

    /**
     * @dev Initializes the contract with the provided configuration.
     *
     * Requirements:
     *
     * - The contract must not be initialized already.
     * - The `config_` must contain valid values for decimals, name, symbol, feePercent, and assetNFT.
     * - The `config_` must contain a valid address for assetGovernor.
     *
     * @param config_ The configuration for the token, including:
     *   - decimals: The number of decimal places for the token.
     *   - name: The name of the token.
     *   - symbol: The symbol of the token.
     *   - feePercent: The percentage of fees to be charged on transfers.
     *   - assetNFT: The address of the associated asset NFT contract.
     *   - feeCollector: (optional) The address of the fee collector.
     *   - assetGovernor: The address of the asset governor.
     *   - mintHook: (optional) The address of the external mint hook contract.
     *   - burnHook: (optional) The address of the external burn hook contract.
     *   - transferHook: (optional) The address of the external transfer hook contract.
     *   - admin: The address of the admin with special privileges.
     */
    function initialize(
        GenericTokenConfig calldata config_
    ) public initializer {
        _setDecimals(config_.decimals);
        __ERC20_init(config_.name, config_.symbol);
        __Fees_init(config_.feePercent);
        if (config_.assetNFT == address(0)) revert MissingAssetNFTAddress();
        _assetNFT = IAssetNFT(config_.assetNFT);
        if (config_.feeCollector != address(0))
            _setupRole(FEE_COLLECTOR_ROLE, config_.feeCollector);
        if (config_.assetGovernor == address(0))
            revert MissingAssetGovernorAddress();
        if (config_.mintHook != address(0)) _setExtMintHook(config_.mintHook);
        if (config_.burnHook != address(0)) _setExtBurnHook(config_.burnHook);
        if (config_.transferHook != address(0))
            _setExtTransferHook(config_.transferHook);
        _setupRole(ASSET_GOVERNOR_ROLE, config_.assetGovernor);
        __AccessControlLockableInitializable_init(config_.admin);
        __ERC20Pausable_init();
    }

    /**
     * @dev Sets a new asset governor role.
     *
     * Requirements:
     *
     * - The caller must have the current asset governor role.
     *
     * @param newGovernor_ The address of the new asset governor.
     */
    function setAssetGovernorRole(
        address newGovernor_
    ) public onlyRole(ASSET_GOVERNOR_ROLE) {
        _revokeRole(
            ASSET_GOVERNOR_ROLE,
            _role_stats[ASSET_GOVERNOR_ROLE].member
        );
        _grantRole(ASSET_GOVERNOR_ROLE, newGovernor_);
        emit AssetGovernorChanged(newGovernor_);
    }

    /**
     * @dev Permanently locks the asset governor role.
     * Once locked, it cannot be unlocked.
     *
     * Requirements:
     *
     * - The caller must have the asset governor role.
     */
    function lockAssetGovernorRole() public onlyRole(ASSET_GOVERNOR_ROLE) {
        _lockRole(ASSET_GOVERNOR_ROLE);
        emit AssetGovernorLocked();
    }

    /**
     * @dev Changes the fee collector to a new address.
     *
     * Requirements:
     *
     * - The caller must be the admin.
     *
     * @param newFeeCollector_ The address of the new fee collector.
     */
    function changeFeeCollector(address newFeeCollector_) public onlyAdmin {
        _revokeRole(FEE_COLLECTOR_ROLE, _role_stats[FEE_COLLECTOR_ROLE].member);
        _grantRole(FEE_COLLECTOR_ROLE, newFeeCollector_);
        emit FeeCollectorChanged(newFeeCollector_);
    }

    /**
     * @dev Locks the fee collector, preventing further changes.
     *
     * Requirements:
     *
     * - The caller must be the admin.
     */
    function lockFeeCollector() public onlyAdmin {
        _lockRole(FEE_COLLECTOR_ROLE);
        emit FeeCollectorLocked();
    }

    /**
     * @dev Pauses mint, burn, and transfer operations.
     *
     * Requirements:
     *
     * - The caller must be the admin.
     * - The contract must not be paused.
     */
    function pause() public onlyAdmin {
        _pause();
    }

    /**
     * @dev Unpauses mint, burn, and transfer operations.
     *
     * Requirements:
     *
     * - The caller must be the admin.
     * - The contract must be paused.
     */
    function unpause() public onlyAdmin {
        _unpause();
    }

    /**
     * @dev Mints tokens to the specified address with custom hook logic.
     *
     * This function performs the following steps:
     *
     * 1. Retrieves the mint hook address.
     * 2. Gets the token value associated with the given `tokenID_` from the asset NFT contract.
     * 3. Adds the `tokenID_` to the `_assetNFTValueToTokenIds` mapping for the corresponding token value.
     * 4. If the hook address is the zero address:
     *    - Transfers the asset NFT from the caller to this contract.
     *    - Mints the token value to the specified `to_` address.
     * 5. If the hook address is not the zero address:
     *    - Creates an instance of the `IExtHookLogic` interface with the hook address.
     *    - Calls the `beforeTokenMint` function on the hook contract, passing the `to_` address and token value as parameters.
     *    - Transfers the asset NFT from the caller to this contract.
     *    - Mints the token value to the specified `to_` address.
     *    - If the `beforeTokenMint` function returned `true`:
     *      - Calls the `afterTokenMint` function on the hook contract, passing the `to_` address and token value as parameters.
     * Requirements:
     * - caller must not be frozen
     * - caller must pre-approve the transfer of the asset nft to this contract
     * - caller must be the owner of the asset nft
     * - to_ must not be frozen
     * - this contract must not be paused
     * @param to_ The address to mint tokens to.
     * @param tokenID_ The ID of the asset NFT to mint tokens for.
     */
    function mint(address to_, uint256 tokenID_) public whenNotPaused {
        _mint(to_, tokenID_);
    }

    /**
     *
     * @param tokenID_ the id of the asset nft to mint tokens for
     *
     */
    function mint(uint256 tokenID_) public whenNotPaused {
        _mint(msg.sender, tokenID_);
    }

    /**
     * @dev Burns a specified amount of tokens to claim ownership of an NFT with equivalent value.
     *
     * This function performs the following steps:
     *
     * 1. Checks if there are any NFTs available with a value equal to the specified `amount_`.
     *    - If no NFTs are available, the function reverts with a `NoNFTWithValue` error.
     * 2. Retrieves the token ID of an available NFT with the specified `amount_` from the `_assetNFTValueToTokenIds` mapping.
     * 3. Removes the retrieved token ID from the `_assetNFTValueToTokenIds` mapping.
     * 4. Retrieves the burn hook address.
     * 5. If the burn hook address is the zero address:
     *    - Burns the specified `amount_` of tokens from the caller's balance.
     *    - Transfers the asset NFT from the contract to the caller.
     * 6. If the burn hook address is not the zero address:
     *    - Creates an instance of the `IExtHookLogic` interface with the burn hook address.
     *    - Calls the `beforeTokenBurn` function on the burn hook contract, passing the caller's address and `amount_` as parameters.
     *    - Burns the specified `amount_` of tokens from the caller's balance.
     *    - Transfers the asset NFT from the contract to the caller.
     *    - If the `beforeTokenBurn` function returned `true`:
     *      - Calls the `afterTokenBurn` function on the burn hook contract, passing the caller's address and `amount_` as parameters.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     * - The caller must have a sufficient token balance to burn the specified `amount_`.
     * - There must be an available NFT with a value equal to the specified `amount_`.
     *
     * @param amount_ The amount of tokens to burn.
     */
    function burn(uint256 amount_) public whenNotPaused {
        uint256 length = _assetNFTValueToTokenIds[amount_].length;
        if (length == 0) {
            // if there are no nfts with the value of the amount
            revert NoNFTWithValue(amount_);
        }
        // get available nft id
        uint256 tokenID = _assetNFTValueToTokenIds[amount_][length - 1];
        _assetNFTValueToTokenIds[amount_].pop();
        // get the hook address
        address h = _getBurnHook();
        if (h == address(0)) {
            // SHORT CIRCUIT BURN IF NO HOOK
            _burn(msg.sender, amount_);
            // transfer the asset nft to the sender
            _assetNFT.safeTransferFrom(address(this), msg.sender, tokenID);
            return;
        } // ELSE PERFORM HOOKED TRANSFER
        IExtHookLogic impl = IExtHookLogic(h);
        bool doAH;
        // GET FEE AND AFTER HOOK REQUIREMENT FROM BEFORE HOOK
        doAH = impl.beforeTokenBurn(msg.sender, amount_); // wake-disable-line
        _burn(msg.sender, amount_);
        _assetNFT.safeTransferFrom(address(this), msg.sender, tokenID);
        if (doAH) {
            // IF AFTER HOOK IS REQUIRED, CALL IT
            impl.afterTokenBurn(msg.sender, amount_);
        }
    }

    /**
     * @dev Collects all the fees accumulated by the contract and sends them to the specified address.
     *
     * Requirements:
     *
     * - The caller must have the fee collector role.
     *
     * @param to_ The address to send the collected fees to.
     */
    function collect(address to_) public onlyRole(FEE_COLLECTOR_ROLE) {
        uint256 balance = balanceOf(address(this));
        _transfer(address(this), to_, balance);
    }

    /**
     * @dev Freezes an account, preventing it from executing transfers, mints, or burns.
     *
     * Requirements:
     *
     * - The caller must have the asset governor role.
     * - The account must not be already frozen.
     *
     * @param account_ The address of the account to freeze.
     */
    function freezeAccount(
        address account_
    ) public onlyRole(ASSET_GOVERNOR_ROLE) {
        if (_isFrozen(account_)) revert AccountFrozen(account_);
        _frozenAccounts[account_] = true;
        // freeze account on asset nft
        IAssetNFT(_assetNFT).freezeAccount(account_);
        emit FrozeAccount(account_);
    }

    /**
     * @dev Unfreezes an account, allowing it to execute transfers, mints, or burns.
     *
     * Requirements:
     *
     * - The caller must have the asset governor role.
     * - The account must be frozen.
     *
     * @param account_ The address of the account to unfreeze.
     */
    function unfreezeAccount(
        address account_
    ) public onlyRole(ASSET_GOVERNOR_ROLE) {
        if (!_isFrozen(account_)) revert AccountNotFrozen(account_);
        _frozenAccounts[account_] = false;
        // unfreeze account on asset nft
        IAssetNFT(_assetNFT).unfreezeAccount(account_);
        emit UnfrozeAccount(account_);
    }

    /**
     * @dev Recaptures all the frozen funds from an account and sends them to the asset governor.
     *
     * Requirements:
     *
     * - The caller must have the asset governor role.
     * - The account must be frozen.
     *
     * @param account_ The address of the account to recapture funds from.
     */

    function recaptureFrozenFunds(
        address account_
    ) public onlyRole(ASSET_GOVERNOR_ROLE) {
        if (!_isFrozen(account_)) revert AccountNotFrozen(account_);
        _transfer(account_, msg.sender, balanceOf(account_));
        emit RecapturedFrozenFunds(account_);
    }

    /**
     * @dev Returns the number of decimals used by the token.
     *
     * @return The number of decimals used by the token.
     */
    function decimals() public view override returns (uint8) {
        return _getDecimals();
    }

    function getAccruedFees() public view returns (uint256) {
        return balanceOf(address(this));
    }

    /**
     * @dev Returns the address of the asset NFT contract.
     */
    function assetNFT() public view returns (address) {
        return address(_assetNFT);
    }

    /**
     * @dev Returns the address of the current admin.
     */
    function admin() public view returns (address) {
        return _role_stats[DEFAULT_ADMIN_ROLE].member;
    }

    /**
     * @dev Returns the address of the fee collector.
     */
    function feeCollector() public view returns (address) {
        return _role_stats[FEE_COLLECTOR_ROLE].member;
    }

    function onERC721Received(
        address, // operator,
        address, // from,
        uint256, //tokenId,
        bytes calldata // data
    ) public pure returns (bytes4) {
        return IERC721ReceiverUpgradeable.onERC721Received.selector;
    }

    /**
     * @dev checks if an account is frozen
     * @param account_ address to check if frozen
     * @return bool true if frozen, false if not
     */
    function isFrozen(address account_) public view returns (bool) {
        return _isFrozen(account_);
    }

    /**
     * @dev This function wraps the base _transfer function
     * This function invokes the custom before and after hook logic.
     *
     * This function short circuits to just perform a transfer
     * if the hook address is zero. if the hook address is not
     * zero, then the hook logic is called.
     *
     * The hook logic is as follows:
     *
     * The before hook is called first and is passed the
     * `from_`, `to_`, and `amount_` parameters. The before hook
     * returns a fee amount and a bool to indicate if after hook should
     * be called.
     *
     * If the `fee` is greater than zero, `fee` is transfered to
     * the this contracts control. The fee is taken from the caller's
     * balance to ensure that the amount tranfered to `to` matches `amount`.
     * If the `fee` is zero, then no fee is collected.
     *
     * Next, the caller's intended transfer is performed.
     *
     * Lastly, the after hook is called only if the after hook required
     * flag is returned as true by the before hook call. If the after
     * hook is required, it is passed the from, to, amount, and fee
     * parameters.
     *
     * @param amount_ How much to transfer.
     * @param from_ Who to transfer from.
     * @param to_ Who to transfer to.
     */
    function _transfer(
        address from_,
        address to_,
        uint256 amount_
    ) internal override {
        // get the hook address
        address h = _getTransferHook();
        uint256 fee;
        bool zeroFee = true;
        uint256 recipientAmount = amount_;
        if (from_ != address(this))
            (recipientAmount, fee, zeroFee) = _calcFee(amount_);
        if (!zeroFee) {
            //  IF FEE IS NON-ZERO, COLLECT FEE
            super._transfer(from_, address(this), fee);
        }
        if (h == address(0)) {
            // SHORT CIRCUIT TRANSFER IF NO HOOK
            super._transfer(from_, to_, recipientAmount);
            return;
        } // ELSE PERFORM HOOKED TRANSFER
        IExtHookLogic impl = IExtHookLogic(h);
        bool doAH;
        // GET FEE AND AFTER HOOK REQUIREMENT FROM BEFORE HOOK
        doAH = impl.beforeTokenTransfer(from_, to_, amount_); // wake-disable-line
        super._transfer(from_, to_, recipientAmount);
        if (doAH) {
            // IF AFTER HOOK IS REQUIRED, CALL IT
            impl.afterTokenTransfer(from_, to_, amount_, fee); // wake-disable-line
        }
        return;
    }

    /**
     * @dev Mints tokens to the specified address with custom hook logic.
     *
     * This function performs the following steps:
     *
     * 1. Retrieves the mint hook address.
     * 2. Gets the token value associated with the given `tokenID_` from the asset NFT contract.
     * 3. Adds the `tokenID_` to the `_assetNFTValueToTokenIds` mapping for the corresponding token value.
     * 4. If the hook address is the zero address:
     *    - Transfers the asset NFT from the caller to this contract.
     *    - Mints the token value to the specified `to_` address.
     * 5. If the hook address is not the zero address:
     *    - Creates an instance of the `IExtHookLogic` interface with the hook address.
     *    - Calls the `beforeTokenMint` function on the hook contract, passing the `to_` address and token value as parameters.
     *    - Transfers the asset NFT from the caller to this contract.
     *    - Mints the token value to the specified `to_` address.
     *    - If the `beforeTokenMint` function returned `true`:
     *      - Calls the `afterTokenMint` function on the hook contract, passing the `to_` address and token value as parameters.
     *
     * @param to_ The address to mint tokens to.
     * @param tokenID_ The ID of the asset NFT to mint tokens for.
     */
    function _mint(address to_, uint256 tokenID_) internal override {
        // get the hook address
        address h = _getMintHook();
        uint256 value = _assetNFT.getTokenValue(tokenID_);
        // add the token id to the asset nft value mapping
        _assetNFTValueToTokenIds[value].push(tokenID_);
        if (h == address(0)) {
            _assetNFT.safeTransferFrom(msg.sender, address(this), tokenID_);
            super._mint(to_, value);
            return;
        } // ELSE PERFORM HOOKED TRANSFER
        IExtHookLogic impl = IExtHookLogic(h);
        bool doAH;
        doAH = impl.beforeTokenMint(to_, value); // wake-disable-line
        _assetNFT.safeTransferFrom(msg.sender, address(this), tokenID_);
        super._mint(to_, value);
        if (doAH) {
            // IF AFTER HOOK IS REQUIRED, CALL IT
            impl.afterTokenMint(to_, value);
        }
    }

    /**
     * @dev this function overrides the _beforeTokenTransfer function with the
     * _beforeTokenTransfer function from ERC20PausableUpgradeable
     * This function adds the ability to check if an account is frozen
     * before transfering tokens
     * @param from_ address transfering tokens from
     * @param to_  address transfering tokens to
     * @param amount_ the amount of tokens to transfer
     */
    function _beforeTokenTransfer(
        address from_,
        address to_,
        uint256 amount_
    ) internal virtual override(ERC20PausableUpgradeable) {
        if (_isFrozen(from_) && to_ != getRoleMember(ASSET_GOVERNOR_ROLE))
            revert AccountFrozen(from_);
        if (_isFrozen(to_)) revert AccountFrozen(to_);
        ERC20PausableUpgradeable._beforeTokenTransfer(from_, to_, amount_);
    }

    function _afterTokenTransfer(
        address from_,
        address to_,
        uint256 //amount_
    ) internal override {
        _updateTokenOwnerList(from_, to_, balanceOf(from_), balanceOf(to_));
    }

    function _isFrozen(address account_) internal view returns (bool) {
        return _frozenAccounts[account_];
    }

    function _onlyFeesAdmin() internal override onlyAdmin {}

    function _onlyHookAdmin() internal override onlyAdmin {}
}
