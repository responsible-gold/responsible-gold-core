// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IExtHookLogic {
    function beforeTokenTransfer(
        address from_,
        address to_,
        uint256 amount_
    ) external returns (bool isAfterHookRequired);

    function afterTokenTransfer(
        address from_,
        address to_,
        uint256 amount_,
        uint256 fee_
    ) external;

    function beforeTokenMint(
        address to_,
        uint256 amount_
    ) external returns (bool isAfterHookRequired);

    function beforeTokenBurn(
        address from_,
        uint256 amount_
    ) external returns (bool isAfterHookRequired);

    function afterTokenBurn(address from_, uint256 amount_) external;

    function afterTokenMint(address to_, uint256 amount_) external;
}

interface ITransferHooks {
    function beforeTokenTransfer(
        address from_,
        address to_,
        uint256 amount_
    ) external returns (uint256 fee, bool isAfterHookRequired);

    function afterTokenTransfer(
        address from_,
        address to_,
        uint256 amount_,
        uint256 fee_
    ) external;
}

interface IMintHooks {
    function beforeTokenMint(
        address to_,
        uint256 amount_
    ) external returns (bool isAfterHookRequired);

    function afterTokenMint(address to_, uint256 amount_) external;
}

interface IBurnHooks {
    function beforeTokenBurn(
        address from_,
        uint256 amount_
    ) external returns (bool isAfterHookRequired);

    function afterTokenBurn(address from_, uint256 amount_) external;
}
