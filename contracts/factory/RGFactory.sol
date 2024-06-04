// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "contracts/libraries/factory/RGFactoryBase.sol";

import "contracts/ERC20/GenericToken.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title RGFactory
 * @notice this is a UUPS upgradeable factory contract for deploying bridge pools
 * @dev this contract is used to deploy bridge pools using deterministic create2.
 * The salt used for the create2 is the keccak256 hash of the token address
 * that the bridge pool represents.
 *
 * deploy this contract as a uups upgradeable proxy
 */
contract RGFactory is UUPSUpgradeable, RGFactoryBase {
    error MissingInitCallData();

    constructor() RGFactoryBase() {}

    /**
     * @dev initializes the contract, sets msg.sender as the owner
     */
    function initialize(address owner_) public initializer {
        _transferOwnership(owner_);
    }

    function deployAssetNFT(
        string memory name_,
        string memory symbol_,
        bytes calldata initCallData_
    ) public onlyOwner returns (address tokenAddr) {
        bytes32 salt = keccak256(abi.encodePacked(symbol_));
        tokenAddr = _deployAssetNFT(salt);
        if (initCallData_.length == 0) revert MissingInitCallData();
        _initalizeDeployed(tokenAddr, initCallData_);
        emit DeployedERC721(tokenAddr, name_, symbol_);
    }

    function deployGenericToken(
        string memory name_,
        string memory symbol_,
        bytes calldata initCallData_
    ) public onlyOwner returns (address tokenAddr) {
        bytes32 salt = keccak256(abi.encodePacked(symbol_));
        tokenAddr = _deployGenericToken(salt);
        if (initCallData_.length == 0) revert MissingInitCallData();
        _initalizeDeployed(tokenAddr, initCallData_);
        emit DeployedERC20(tokenAddr, name_, symbol_);
    }

    function deployCreateCustomContract(
        uint256 amount_,
        bytes calldata bytecode_,
        bytes calldata initCallData_
    ) public onlyOwner returns (address addr) {
        addr = _deployCustomContract(amount_, bytecode_);
        if (initCallData_.length > 0) {
            _initalizeDeployed(addr, initCallData_);
        }
    }

    function deployCreate2CustomContract(
        uint256 amount_,
        bytes32 salt_,
        bytes calldata bytecode_,
        bytes calldata initCallData_
    ) public onlyOwner returns (address addr) {
        addr = _deployCustomCreate2Contract(amount_, salt_, bytecode_);
        if (initCallData_.length > 0) {
            _initalizeDeployed(addr, initCallData_);
        }
    }

    /**
     * @dev allows owner to upgrade the implementation of the bridge pool
     * @param newImplementation address of new logic contract
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
