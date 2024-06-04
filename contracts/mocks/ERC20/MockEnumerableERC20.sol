// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "contracts/libraries/ERC20/EnumerableERC20.sol";

contract MockEnumerableERC20 is EnumerableERC20 {
    function updateTokenOwnerList(
        address from,
        address to,
        uint256 fromBalance,
        uint256 toBalance
    ) public {
        _updateTokenOwnerList(from, to, fromBalance, toBalance);
    }
}
