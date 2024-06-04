// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "contracts/libraries/factory/GenericFactory.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "contracts/ERC20/GenericToken.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title ERC20Factory
 * @notice This is UUPS upgradeable factory contract used to deploy new instances of Generic Token
 * @dev The contract initalizer sets the owner as msg.sender. The token contract will be deployed with
 * create2 and the salt used to calculate the address is the keccak256 hash of the symbol.
 */
contract ERC20Factory is GenericFactory, OwnableUpgradeable, UUPSUpgradeable {
    using Address for address;

    event DeployedToken(address tokenAddress);

    constructor() GenericFactory() {}

    /**
     * @notice initializes the contract, sets msg.sender as the owner
     * @dev must be called directly after deployment, can only be called once
     */
    function initialize(
        address owner_,
        address rsGoldFactory_
    ) public initializer {
        rgFactory = rsGoldFactory_;
        _transferOwnership(owner_);
    }

    /**
     * @dev this function is used to get the contract creation code
     */
    function _code() internal pure override returns (bytes memory) {
        return type(GenericToken).creationCode;
    }

    /**
     *
     * @param newImplementation new implementation contract address
     * overrides parent function with onlyOwner modifer to restrict access
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    /**
     * @dev this function is used to restrict access to only the owner
     */
    function _onlyOwner() internal override onlyOwner {}
}
