// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "contracts/ERC20/GenericToken.sol";

interface IGenericToken is IERC20Upgradeable {
    function initialize(GenericTokenConfig memory config_) external;

    function mint(uint256 amount) external;

    function burn(uint256 amount) external;
}

interface IGenericTokenAdmin {
    function initialize(GenericTokenConfig memory config_) external;

    function changeFeeCollector(address newFeeCollector_) external;

    function lockFeeCollector() external;

    function pause() external;

    function unpause() external;

    function changeERC20Hook(address newHook_) external;

    function lockERC20Hook() external;

    function collect(address to_) external;

    function ERC20Hook() external view returns (address);

    function admin() external view returns (address);

    function feeCollector() external view returns (address);

    function ERC20HookIsLocked() external view returns (bool);

    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);

    function totalSupply() external view returns (uint);

    function balanceOf(address owner) external view returns (uint);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);

    function transfer(address to, uint value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint value
    ) external returns (bool);
}
