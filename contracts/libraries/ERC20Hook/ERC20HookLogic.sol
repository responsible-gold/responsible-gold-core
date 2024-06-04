// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "contracts/interfaces/IExtHooks/IExtHooks.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

error InvalidTransfer();

/**
 * @title ERC20HookBase
 * @author Hunter Prendergast
 * @notice This contract provides a minimal tmplate from which custom
 * hook logic contracts may be built.
 */
abstract contract ERC20HookLogic is IExtHookLogic {
    function beforeTokenMint(
        address to_,
        uint256 amount_
    ) public virtual returns (bool isAfterHookRequired) {
        _onlyAuthorizedToken();
        _beforeMint(to_, amount_);
        return _isAfterMintHookRequired();
    }

    /**
     * @dev Hook function called before a token burn operation.
     * Can be overridden by derived contracts to implement custom behavior.
     * @return isAfterHookRequired A boolean indicating whether the after hook is required.
     */
    function beforeTokenBurn(
        address from_,
        uint256 amount_
    ) public virtual returns (bool isAfterHookRequired) {
        _onlyAuthorizedToken();
        _beforeBurn(from_, amount_);
        return _isAfterBurnHookRequired();
    }

    /**
     * @dev Hook function called before a token transfer operation.
     * @param from_ The address of the sender.
     * @param to_ The address of the receiver.
     * @param amount_ The amount of tokens to be transferred.
     * Can be overridden by derived contracts to implement custom behavior.
     * @return isAfterHookRequired A boolean indicating whether the after hook is required.
     */
    function beforeTokenTransfer(
        address from_,
        address to_,
        uint256 amount_
    ) public virtual returns (bool isAfterHookRequired) {
        _onlyAuthorizedToken();
        if (to_ != address(0)) {
            _beforeTransfer(from_, to_, amount_);
        } else {
            revert InvalidTransfer();
        }

        return (_isAfterTransferHookRequired());
    }

    /**
     * @dev Hook function called after a token transfer operation.
     * @param from_ The address of the sender.
     * @param to_ The address of the receiver.
     * @param amount_ The amount of tokens transferred.
     * @param fee_ The fee deducted from the transfer.
     * Can be overridden by derived contracts to implement custom behavior.
     */
    function afterTokenTransfer(
        address from_,
        address to_,
        uint256 amount_,
        uint256 fee_
    ) public virtual {
        _onlyAuthorizedToken();
        if (to_ != address(0)) {
            _afterTransfer(from_, to_, amount_, fee_);
        } else {
            revert InvalidTransfer();
        }
    }

    function afterTokenMint(address to_, uint256 amount_) public virtual {
        _onlyAuthorizedToken();
        if (to_ != address(0)) {
            _afterMint(to_, amount_);
        } else {
            revert InvalidTransfer();
        }
    }

    function afterTokenBurn(address from_, uint256 amount_) public virtual {
        _onlyAuthorizedToken();
        if (from_ != address(0)) {
            _afterBurn(from_, amount_);
        } else {
            revert InvalidTransfer();
        }
    }

    function _isAfterTransferHookRequired() internal virtual returns (bool) {
        return false;
    }

    function _isAfterMintHookRequired() internal virtual returns (bool) {
        return false;
    }

    function _isAfterBurnHookRequired() internal virtual returns (bool) {
        return true;
    }

    function _beforeTransfer(
        address, // from_,
        address, // to_,
        uint256 // amount_
    ) internal virtual returns (uint256 fee) {
        return 0;
    }

    function _beforeMint(
        address, //to_,
        uint256 //amount_
    ) internal virtual {}

    function _beforeBurn(
        address, // from_,
        uint256 // amount_
    ) internal virtual {}

    function _afterMint(
        address, // to_,
        uint256 // amount_,
    ) internal virtual {
        return;
    }

    function _afterBurn(
        address, // from_,
        uint256 // amount_,
    ) internal virtual {
        return;
    }

    function _afterTransfer(
        address, // from_,
        address, // to_,
        uint256, // amount_,
        uint256 // fee_
    ) internal virtual {
        return;
    }

    function _onlyAuthorizedToken() internal virtual;
}

abstract contract ERC20TransferHookLogic {
    /**
     * @dev Hook function called before a token transfer operation.
     * @param from_ The address of the sender.
     * @param to_ The address of the receiver.
     * @param amount_ The amount of tokens to be transferred.
     * Can be overridden by derived contracts to implement custom behavior.
     * @return isAfterHookRequired A boolean indicating whether the after hook is required.
     */
    function beforeTokenTransfer(
        address from_,
        address to_,
        uint256 amount_
    ) public virtual returns (bool isAfterHookRequired) {
        _onlyTransferHookCaller();
        if (to_ != address(0)) {
            _beforeTransfer(from_, to_, amount_);
        } else {
            revert InvalidTransfer();
        }
        return (_isAfterTransferHookRequired());
    }

    /**
     * @dev Hook function called after a token transfer operation.
     * @param from_ The address of the sender.
     * @param to_ The address of the receiver.
     * @param amount_ The amount of tokens transferred.
     * @param fee_ The fee deducted from the transfer.
     * Can be overridden by derived contracts to implement custom behavior.
     */
    function afterTokenTransfer(
        address from_,
        address to_,
        uint256 amount_,
        uint256 fee_
    ) internal virtual {
        _onlyTransferHookCaller();
        if (to_ != address(0)) {
            _afterTransfer(from_, to_, amount_, fee_);
        } else {
            revert InvalidTransfer();
        }
    }

    function _beforeTransfer(
        address, // from_,
        address, // to_,
        uint256 // amount_
    ) internal virtual {}

    function _afterTransfer(
        address, // from_,
        address, // to_,
        uint256, // amount_,
        uint256 // fee_
    ) internal virtual {
        return;
    }

    function _isAfterTransferHookRequired() internal virtual returns (bool) {
        return false;
    }

    function _onlyTransferHookCaller() internal virtual;
}
