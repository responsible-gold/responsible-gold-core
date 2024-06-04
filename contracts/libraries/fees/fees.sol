// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract Fees is Initializable {
    uint24 public constant UNIT_ONE = 1000000; //1 -> 0.000001, 10 -> 0.00001, 100 -> 0.0001, 1000 -> 0.001, 10000 -> 0.01, 100000 -> 0.1, 1000000 -> 1
    error FeeTooHigh();
    error FeeLocked();
    event FeeLockedAt(uint24 fee);
    event FeeChanged(uint24 newFee);
    struct FeesData {
        bool locked;
        uint24 _feePercent; // fee in percent * 10**6
        uint256 _accruedFees;
    }

    FeesData internal _fees;

    function __Fees_init(uint24 fee_) public onlyInitializing {
        __Fees_init_unchained(fee_);
    }

    function __Fees_init_unchained(uint24 fee_) internal onlyInitializing {
        _setFee(fee_);
    }

    /**
     * @dev Allows the admin of this contract to change the fee percentage.
     * @param fee_ The new fee percentage to be set.
     * This function can only be called by an account with the admin role.
     * After the fee is changed, it will be applied to all future transactions.
     */
    function setFee(uint24 fee_) public {
        _onlyFeesAdmin();
        _setFee(fee_);
        emit FeeChanged(fee_);
    }

    function lockFee() public {
        _onlyFeesAdmin();
        _lockFees();
        emit FeeLockedAt(_fees._feePercent);
    }

    function getFee() public view returns (uint24) {
        return _getFee();
    }

    function isFeeLocked() public view returns (bool) {
        return _isFeeLocked();
    }

    /**
     * @dev Calculates the fee for a given amount.
     * The function returns the transferred amount less fees, the fee amount, and a boolean indicating whether the fee is zero.
     * @param amount_ The amount for which the fee is to be calculated.
     * @return recipientAmount The transfer amount less fees.
     * @return feeAmout The fee amount.
     * @return zeroFee A boolean indicating whether the fee is zero.
     */
    function calcFee(
        uint256 amount_
    )
        public
        view
        returns (uint256 recipientAmount, uint256 feeAmout, bool zeroFee)
    {
        return _calcFee(amount_);
    }

    /**
     *
     * @param amount_ amount in wei to calculate fees for
     * @return recipientAmount  amount with fees applied
     * @return feeAmout amount of fees
     * @return zeroFee zero fees flag
     */
    function _calcFee(
        uint256 amount_
    )
        internal
        view
        returns (uint256 recipientAmount, uint256 feeAmout, bool zeroFee)
    {
        uint256 f = _fees._feePercent;
        zeroFee = f == 0;
        recipientAmount = ((UNIT_ONE - f) * amount_) / UNIT_ONE;
        feeAmout = amount_ - recipientAmount;
    }

    function _isFeeLocked() internal view returns (bool) {
        return _fees.locked;
    }

    function _lockFees() internal {
        _fees.locked = true;
    }

    function _getFee() internal view returns (uint24) {
        return _fees._feePercent;
    }

    function _setFee(uint24 fee_) internal {
        FeesData memory fees = _fees;

        if (fees.locked) {
            revert FeeLocked();
        }
        if (fee_ >= UNIT_ONE) {
            revert FeeTooHigh();
        }
        _fees._feePercent = fee_;
    }

    function _onlyFeesAdmin() internal virtual;
}
