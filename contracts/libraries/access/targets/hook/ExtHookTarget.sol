// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title HookExt contract
 * @author Hunter Prendergast
 * @notice HookExt contract implements the storage, events, and errors
 * for inheritable transfer hooks. The inheriting contract must implement
 * the logic for the transfer hooks. Specifically, the inheriting contract
 * must implement the changeExtHook and LockExtHook functions.
 *
 * The inheriting contract must also call the _setERC20Hook function in its
 * constructor/initilization function.
 */
abstract contract ExtHookTarget {
    event TransferHookChanged(address newHook_);
    event MintHookChanged(address newHook_);
    event BurnHookChanged(address newHook_);
    error HookLocked();

    address private _extTransferHook;
    bool private _extTransferHookLocked;
    address private _extMintHook;
    bool private _extMintHookLocked;
    address private _extBurnHook;
    bool private _extBurnHookLocked;

    /**
     * @dev Changes the ERC20 transfer hook to a new address.
     * @param hook_ The address of the new ERC20 hook.
     */
    function setExtTransferHook(address hook_) public {
        _onlyHookAdmin();
        _setExtTransferHook(hook_);
    }

    /**
     * @dev Changes the ERC20 mint hook to a new address.
     * @param hook_ The address of the new ERC20 hook.
     */
    function setExtMintHook(address hook_) public {
        _onlyHookAdmin();
        _setExtMintHook(hook_);
    }

    /**
     * @dev Changes the ERC20 burn hook to a new address.
     * @param hook_ The address of the new ERC20 hook.
     */
    function setExtBurnHook(address hook_) public {
        _onlyHookAdmin();
        _setExtBurnHook(hook_);
    }

    /**
     * @dev Locks the ERC20 mint hook, preventing further changes.
     */
    function lockExtMintHook() public {
        _onlyHookAdmin();
        _lockExtMintHook();
    }

    /**
     * @dev Locks the ERC20 transfer hook, preventing further changes.
     */
    function lockExtTransferHook() public {
        _onlyHookAdmin();
        _lockExtTransferHook();
    }

    /**
     * @dev Locks the ERC20 burn hook, preventing further changes.
     */
    function lockExtBurnHook() public {
        _onlyHookAdmin();
        _lockExtBurnHook();
    }

    function transferHook() public view returns (address) {
        return _extTransferHook;
    }

    function mintHook() public view returns (address) {
        return _extMintHook;
    }

    function burnHook() public view returns (address) {
        return _extBurnHook;
    }

    function transferHookIsLocked() public view returns (bool) {
        return _extTransferHookLocked;
    }

    function mintHookIsLocked() public view returns (bool) {
        return _extMintHookLocked;
    }

    function burnHookIsLocked() public view returns (bool) {
        return _extBurnHookLocked;
    }

    function _setExtMintHook(address newHook_) internal {
        if (_extMintHookLocked) {
            revert HookLocked();
        }
        _extMintHook = newHook_;
        emit MintHookChanged(newHook_);
    }

    function _setExtTransferHook(address newHook_) internal {
        if (_extTransferHookLocked) {
            revert HookLocked();
        }
        _extTransferHook = newHook_;
        emit TransferHookChanged(newHook_);
    }

    function _setExtBurnHook(address newHook_) internal {
        if (_extBurnHookLocked) {
            revert HookLocked();
        }
        _extBurnHook = newHook_;
        emit BurnHookChanged(newHook_);
    }

    function _lockExtTransferHook() internal {
        _extTransferHookLocked = true;
    }

    function _lockExtMintHook() internal {
        _extMintHookLocked = true;
    }

    function _lockExtBurnHook() internal {
        _extBurnHookLocked = true;
    }

    function _getTransferHook() internal view returns (address) {
        return _extTransferHook;
    }

    function _getMintHook() internal view returns (address) {
        return _extMintHook;
    }

    function _getBurnHook() internal view returns (address) {
        return _extBurnHook;
    }

    function _onlyHookAdmin() internal virtual;
}
