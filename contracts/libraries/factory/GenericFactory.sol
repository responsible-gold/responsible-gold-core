// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Create2.sol";

abstract contract GenericFactory {
    address public rgFactory;
    bytes32 private immutable _initHash;
    address[] internal _deployedContracts;
    event DeployedContract(address addr);
    error NotFactory(address sender);
    error InvalidRange();

    modifier onlyFactory() {
        if (msg.sender != rgFactory) {
            revert NotFactory(msg.sender);
        }
        _;
    }

    constructor() {
        _initHash = keccak256(_code());
    }

    /**
     * @notice deploys a generic token contract, and initializes with variables in GenericTokenConfig
     * @param salt_ keccak256 hash of the token symbol
     * @return addr the address of the deployed Generic Token contract
     * @dev deploys a new instance of generic token contract with create2,
     * using the keccak256 hash of its symbol as the salt
     */
    function deploy(bytes32 salt_) public onlyFactory returns (address addr) {
        addr = _deploy(salt_);
        _deployedContracts.push(addr);
        emit DeployedContract(addr);
    }

    /**
     * @dev allows the owner to change the address authorized to token contracts
     * @param factory_ address of the new RGFactory contract
     */
    function changeFactory(address factory_) public {
        _onlyOwner();
        rgFactory = factory_;
    }

    /**
     * @return the number of deployed contracts
     */
    function numDeployedContracts() public view returns (uint256) {
        return _deployedContracts.length;
    }

    /**
     * @param start_ start index
     * @param end_ end index
     * @return result array of deployed contract addresses
     * @dev returns a slice of the deployed contracts array
     */
    function getDeployedContracts(
        uint256 start_,
        uint256 end_
    ) public view returns (address[] memory) {
        if (start_ >= end_ || end_ > _deployedContracts.length) {
            revert InvalidRange();
        }
        address[] memory result = new address[](end_ - start_);
        for (uint256 i = start_; i < end_; i++) {
            result[i - start_] = _deployedContracts[i];
        }
        return result;
    }

    /**
     *
     * @param salt_ keccak256 hash of the token symbol
     * @notice calculates the address of a token contract deployed by this factory,
     * @dev this function uses a immutable deploycode hash, if the logic contract is updated
     * a updated initcode hash must be used to calculate the address
     */
    function addressFor(bytes32 salt_) public view returns (address addr) {
        addr = _address(salt_);
    }

    /**
     *
     * @param symbol_ token symbol
     * @return the keccak256 hash of the token symbol
     */
    function calcSalt(string calldata symbol_) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(symbol_));
    }

    function _deploy(bytes32 salt) internal returns (address addr) {
        addr = Create2.deploy(0, salt, _code());
    }

    function _address(bytes32 salt_) internal view returns (address addr) {
        addr = Create2.computeAddress(salt_, _initHash);
    }

    function _code() internal pure virtual returns (bytes memory) {}

    function _onlyOwner() internal virtual {}

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[44] private __gap;
}
