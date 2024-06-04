// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "contracts/interfaces/IGenericFactory.sol";
import "@openzeppelin/contracts/utils/Address.sol";

abstract contract RGFactoryBase is Ownable2StepUpgradeable {
    using Address for address;
    enum Factories {
        TOKEN,
        NFT
    }
    mapping(Factories => address) public deployers;
    address[] public erc20Tokens;
    address[] public erc721Tokens;
    /**
     * @dev emitted when a new bridge pool is deployed
     * @param poolAddress address of bridge pool
     * @param tokenAddress address of token contract
     */
    event DeployedPool(
        address indexed poolAddress,
        address indexed tokenAddress
    );
    event DeployedERC20(
        address indexed tokenAddress,
        string indexed name,
        string indexed symbol
    );
    event DeployedERC721(
        address indexed tokenAddress,
        string indexed name,
        string indexed symbol
    );
    event DeployedCustomContract(address indexed addr);
    /**
     * @dev Not enough balance for performing a deployment.
     */
    error CreateInsufficientBalance(uint256 balance, uint256 needed);

    error ERC20DeployerNotSet();
    error ERC721DeployerNotSet();
    /**
     * @dev There's no code to deploy.
     */
    error CreateEmptyBytecode();

    /**
     * @dev The deployment failed.
     */
    error CreateFailedDeployment();

    error NotNativeChain();

    constructor() {}

    function updateDeployers(
        Factories factory_,
        address deployer_
    ) external onlyOwner {
        deployers[factory_] = deployer_;
    }

    function _deployGenericToken(
        bytes32 salt_
    ) internal returns (address tokenAddress) {
        // check if token deployer is set
        if (deployers[Factories.TOKEN] == address(0)) {
            revert ERC20DeployerNotSet();
        }
        tokenAddress = IGenericFactory(deployers[Factories.TOKEN]).deploy( //wake-disable-line
            salt_
        );

        erc20Tokens.push(tokenAddress);
    }

    function _deployAssetNFT(
        bytes32 salt_
    ) internal returns (address nftAddress) {
        // check if token deployer is set
        if (deployers[Factories.NFT] == address(0)) {
            revert ERC721DeployerNotSet();
        }
        nftAddress = IGenericFactory(deployers[Factories.NFT]).deploy(salt_); //wake-disable-line
        erc721Tokens.push(nftAddress);
    }

    /**
     * @dev Deploys a contract using `CREATE`.
     *
     * The bytecode for a contract can be obtained from Solidity with
     * `type(contractName).creationCode`.
     *
     * Requirements:
     *
     * - `bytecode` must not be empty.
     * - the factory must have a balance of at least `amount`.
     * - if `amount` is non-zero, `bytecode` must have a `payable` constructor.
     */
    function _deployCustomContract(
        uint256 value_,
        bytes memory bytecode_
    ) internal returns (address addr) {
        if (bytecode_.length == 0) {
            revert CreateEmptyBytecode();
        }
        /// @solidity memory-safe-assembly
        assembly {
            addr := create(value_, add(bytecode_, 0x20), mload(bytecode_))
        }
        if (addr == address(0)) {
            revert CreateFailedDeployment();
        }
        if (!addr.isContract()) {
            revert CreateFailedDeployment();
        }
        emit DeployedCustomContract(addr);
    }

    function _deployCustomCreate2Contract(
        uint256 value_,
        bytes32 salt_,
        bytes memory bytecode_
    ) internal returns (address addr) {
        if (bytecode_.length == 0) {
            revert CreateEmptyBytecode();
        }
        /// @solidity memory-safe-assembly
        assembly {
            addr := create2(
                value_,
                add(bytecode_, 0x20),
                mload(bytecode_),
                salt_
            )
        }

        if (!addr.isContract()) {
            revert CreateFailedDeployment();
        }
        emit DeployedCustomContract(addr);
    }

    function _initalizeDeployed(address addr_, bytes memory payload_) internal {
        addr_.functionCall(payload_);
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[46] private __gap;
}
