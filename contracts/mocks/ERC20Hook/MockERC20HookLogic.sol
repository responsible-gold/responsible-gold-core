// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "contracts/libraries/ERC20Hook/ERC20HookLogic.sol";
import "contracts/interfaces/IExtHooks/IExtHooks.sol";

contract MockERC20HookLogic is ERC20HookLogic, Ownable {
    address constant _token = address(0x1);

    uint256 public beforeTransferFee = 3;
    bool public afterHookEnabled;

    address public beforeMintTo;
    uint256 public beforeMintAmount;
    bool public afterMintHookRan;

    address public beforeBurnFrom;
    uint256 public beforeBurnAmount;
    bool public afterBurnHookRan;
    address public beforeTransferFrom;
    address public beforeTransferTo;
    uint256 public beforeTransferAmount;
    bool public afterTransferHookRan;

    constructor(address token_) Ownable() {}

    function turnOnAfterHook() external {
        afterHookEnabled = true;
    }

    function turnOffAfterHook() external {
        afterHookEnabled = false;
    }

    function _isAfterTransferHookRequired()
        internal
        view
        override
        returns (bool)
    {
        return afterHookEnabled;
    }

    function _isAfterMintHookRequired() internal view override returns (bool) {
        return afterHookEnabled;
    }

    function _isAfterBurnHookRequired() internal view override returns (bool) {
        return afterHookEnabled;
    }

    function _beforeMint(
        address to_,
        uint256 amount_
    ) internal virtual override {
        beforeMintTo = to_;
        beforeMintAmount = amount_;
    }

    function _beforeBurn(
        address from_,
        uint256 amount_
    ) internal virtual override {
        beforeBurnFrom = from_;
        beforeBurnAmount = amount_;
    }

    function _beforeTransfer(
        address from_,
        address to_,
        uint256 amount_
    ) internal virtual override returns (uint256 fee) {
        beforeTransferFrom = from_;
        beforeTransferTo = to_;
        beforeTransferAmount = amount_;
        return beforeTransferFee;
    }

    function _afterMint(
        address to_,
        uint256 amount_
    ) internal virtual override {
        afterMintHookRan = true;
        return;
    }

    function _afterBurn(
        address from_,
        uint256 amount_
    ) internal virtual override {
        afterBurnHookRan = true;
        return;
    }

    function _afterTransfer(
        address from_,
        address to_,
        uint256 amount_,
        uint256 fee_
    ) internal virtual override {
        afterTransferHookRan = true;
        return;
    }

    function _onlyAuthorizedToken() internal override {}
}
