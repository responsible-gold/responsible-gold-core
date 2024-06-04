// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "contracts/libraries/fees/fees.sol";

contract MockFees is Fees {
    function initialize(uint24 fee_) internal initializer {
        __Fees_init(fee_);
    }

    function _onlyFeesAdmin() internal override {}
}
