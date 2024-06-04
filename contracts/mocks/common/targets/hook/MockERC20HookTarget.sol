// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "contracts/libraries/access/targets/hook/ERC20HookTarget.sol";

contract MockERC20HookTarget is ERC20HookTarget {
    constructor(address a_) {
        _setERC20Hook(a_);
    }

    function setERC20Hook(address a_) public {
        _setERC20Hook(a_);
    }

    function lockERC20Hook() public {
        _lockERC20Hook();
    }
}
