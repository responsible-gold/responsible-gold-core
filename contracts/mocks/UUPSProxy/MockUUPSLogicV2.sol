// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MockUUPSLogicV2 is UUPSUpgradeable, OwnableUpgradeable {
    constructor() {}

    error Unauthorized();

    /**
     * @dev Initializes the BridgePoolFactory contract.
     * This function can only be called by the authorized initializer.
     */
    function initialize() public reinitializer(2) {
        __Ownable_init_unchained();
    }

    function call2() external pure returns (uint256) {
        return 2;
    }

    // access restriction for upgrade calls
    /**
     * @dev Authorizes an upgrade.
     * @param newImplementation The address of the new implementation.
     * This function can only be called by an admin.
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
