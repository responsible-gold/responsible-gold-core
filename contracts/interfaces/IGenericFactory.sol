// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IGenericFactory {
    function deploy(bytes32 salt_) external returns (address addr);

    function addressFor(bytes32 salt) external view returns (address addr);
}
