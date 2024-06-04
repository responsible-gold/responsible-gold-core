// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract MockInitializable {
    bool public initialized;

    function initialize() public {
        initialized = true;
    }
}
