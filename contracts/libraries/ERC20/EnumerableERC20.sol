// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract EnumerableERC20 is Initializable {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    EnumerableSetUpgradeable.AddressSet private _tokenOwners;

    event TokenOwnerAdded(address indexed tokenOwner);
    event TokenOwnerRemoved(address indexed tokenOwner);

    /**
     * @dev Updates the token owner list when tokens are transferred.
     * @param from_ The address tokens are transferred from.
     * @param to_ The address tokens are transferred to.
     * @param fromBalance_ The balance of the `from_` address.
     * @param toBalance_ The balance of the `to_` address.
     */
    function _updateTokenOwnerList(
        address from_,
        address to_,
        uint256 fromBalance_,
        uint256 toBalance_
    ) internal {
        if (fromBalance_ == 0 && _tokenOwners.contains(from_)) {
            _tokenOwners.remove(from_);
            emit TokenOwnerRemoved(from_);
        }
        if (
            toBalance_ > 0 && !_tokenOwners.contains(to_) && to_ != address(0)
        ) {
            _tokenOwners.add(to_);
            emit TokenOwnerAdded(to_);
        }
    }

    /**
     * @dev Returns the number of token owners.
     */
    function getTokenOwnerCount() public view returns (uint256) {
        return _tokenOwners.length();
    }

    /**
     * @dev Returns the token owner at the specified index.
     * @param index The index of the token owner.
     */
    function getTokenOwnerAtIndex(uint256 index) public view returns (address) {
        return _tokenOwners.at(index);
    }

    /**
     * @dev Returns whether the specified address is a token owner.
     * @param account The address to check.
     */
    function isTokenOwner(address account) public view returns (bool) {
        return _tokenOwners.contains(account);
    }

    /**
     * @dev Returns a paginated list of token owners.
     * @param start The starting index.
     * @param limit The maximum number of token owners to return.
     * @return owners A list of token owners.
     */
    function getTokenOwners(
        uint256 start,
        uint256 limit
    ) public view returns (address[] memory) {
        uint256 totalOwners = _tokenOwners.length();
        if (start >= totalOwners) {
            return new address[](0);
        }
        uint256 end = start + limit;
        if (end > totalOwners) {
            end = totalOwners;
        }
        uint256 j = 0;
        address[] memory owners = new address[](end - start);
        for (uint256 i = start; i < end; i++) {
            owners[j] = _tokenOwners.at(i);
            j++;
        }

        return owners;
    }
}
