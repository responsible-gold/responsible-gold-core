// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title ERC20HookExt contract
 * @author Hunter Prendergast
 * @notice ERC20HookExt contract implements the storage, events, and errors
 * for an inheritable ERC20 hook. The inheriting contract must implement
 * the logic for the ERC20 hook. Specifically, the inheriting contract
 * must implement the changeERC20Hook and LockERC20Hook functions.
 *
 * The inheriting contract must also call the _setERC20Hook function in its
 * constructor/initilization function.
 */
abstract contract ERC20HookTarget {
    event ERC20HookChanged(address newHook_);

    error ERC20HookLocked();

    address private _ERC20Hook;
    bool private _ERC20HookLocked;

    function erc20Hook() public view returns (address) {
        return _ERC20Hook;
    }

    function erc20HookIsLocked() public view returns (bool) {
        return _ERC20HookLocked;
    }

    function _setERC20Hook(address newHook_) internal {
        if (_ERC20HookLocked) {
            revert ERC20HookLocked();
        }
        _ERC20Hook = newHook_;
        emit ERC20HookChanged(newHook_);
    }

    function _lockERC20Hook() internal {
        _ERC20HookLocked = true;
    }
}
