// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ERC1967/ERC1967UpgradeUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract UUPSProxy is ERC1967Proxy {
    error ConstructionFailed();

    constructor(
        address logicContract,
        bytes memory initCallData
    ) ERC1967Proxy(logicContract, initCallData) {}
}
