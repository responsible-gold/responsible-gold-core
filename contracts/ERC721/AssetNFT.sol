// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "contracts/libraries/access/accessControl/AccessControlLockableInitializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";

import "contracts/interfaces/IExtHooks/IExtHooks.sol";
import "contracts/libraries/access/targets/hook/ExtHookTarget.sol";
import "contracts/libraries/fees/fees.sol";
// import "hardhat/console.sol";
struct NFTTokenConfig {
    address admin;
    address assetGovernor;
    address minter;
    address burner;
    address metaDataOperator;
    address ERC20Address;
    string name;
    string symbol;
    string baseURI;
}

contract AssetNFT is
    ERC721EnumerableUpgradeable,
    AccessControlLockableInitializable,
    ERC721PausableUpgradeable,
    ExtHookTarget
{
    struct AssetData {
        uint256 erc20Value;
        string tokenURI;
    }
    // IAllocationRegistry private _allocationRegistry;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant ASSET_GOVERNOR_ROLE =
        keccak256("ASSET_GOVERNOR_ROLE");
    bytes32 public constant META_DATA_OPERATOR_ROLE =
        keccak256("META_DATA_OPERATOR_ROLE");
    string internal _baseURIString;
    address public erc20TokenAddress;
    // CountersUpgradeable.Counter private _tokenIdCounter;
    // Fees.FeesData private _fees;
    // mapping of tokenID Asset data
    mapping(uint256 => AssetData) public assets;
    // mapping account to frozen status
    mapping(address => bool) internal _frozenAccounts;
    event RedeemedGoldBar(
        address indexed recipient,
        uint256 indexed tokenID,
        uint256 indexed amountGcoins
    );
    event MintedNFTWithoutERC20(uint256 indexed tokenID, address indexed to);
    event MintedERC20(
        uint256 indexed tokenID,
        address indexed recipient,
        uint256 indexed erc20Amount
    );
    event RecapturedFrozenFunds(address account_, uint256 tokenID_);
    event FrozeAccount(address account_);
    event UnfrozeAccount(address account_);
    error NFTAlreadyCreated(uint256 tokenID, string chip);
    error TokenAlreadyClaimed(uint256 tokenID);
    error NotOwnerOfToken(uint256 tokenID, address sender);
    error ChipNotUsed();
    error InvalidRanges();
    error InvalidERC20Value();
    error NotApprovedOrOwner(address caller, address owner, uint256 tokenID_);
    error MissingMinterAddress();
    error MissingBurnerAddress();
    error MissingAdminAddress();
    error MissingMetaDataOperatorAddress();
    error MissingAssetGovernorAddress();
    error AccountFrozen(address account_);
    error AccountNotFrozen(address account_);
    error IndexOutOfRange();
    error MissingERC20Address();
    error NotERC20();

    /**
     * @dev Modifier that checks if the caller is the ERC20 token contract.
     *
     * Requirements:
     *
     * - The caller must be the ERC20 token contract.
     */
    modifier onlyERC20() {
        if (msg.sender != erc20TokenAddress) revert NotERC20();
        _;
    }

    /**
     * @dev Initializes the contract with the given configuration.
     *
     * Requirements:
     *
     * - The contract must not be initialized already.
     * - The `config_` must contain valid addresses for admin, minter, burner, metaDataOperator, ERC20Address, and assetGovernor.
     *
     * @param config_ The configuration struct containing the necessary addresses and settings.
     */
    function initialize(NFTTokenConfig memory config_) public initializer {
        __ERC721_init(config_.name, config_.symbol);
        if (config_.admin == address(0)) revert MissingAdminAddress();
        if (config_.minter == address(0)) revert MissingMinterAddress();
        if (config_.burner == address(0)) revert MissingBurnerAddress();
        if (config_.metaDataOperator == address(0))
            revert MissingMetaDataOperatorAddress();
        if (config_.ERC20Address == address(0)) revert MissingERC20Address();
        if (config_.assetGovernor == address(0))
            revert MissingAssetGovernorAddress();
        _grantRole(MINTER_ROLE, config_.minter);
        _grantRole(BURNER_ROLE, config_.burner);
        _grantRole(META_DATA_OPERATOR_ROLE, config_.metaDataOperator);
        _grantRole(ASSET_GOVERNOR_ROLE, config_.assetGovernor);
        __AccessControlLockableInitializable_init(config_.admin);
        _baseURIString = config_.baseURI;
        erc20TokenAddress = config_.ERC20Address;
    }

    /**
     * @dev Sets a new asset governor role.
     *
     * Requirements:
     *
     * - The caller must have the current asset governor role.
     *
     * @param newGovernor_ The address of the new asset governor.
     */
    function setAssetGovernorRole(
        address newGovernor_
    ) public onlyRole(ASSET_GOVERNOR_ROLE) {
        _revokeRole(
            ASSET_GOVERNOR_ROLE,
            _role_stats[ASSET_GOVERNOR_ROLE].member
        );
        _grantRole(ASSET_GOVERNOR_ROLE, newGovernor_);
    }

    /**
     * @dev Locks the asset governor role, preventing further modifications.
     *
     * Requirements:
     *
     * - The caller must have the current asset governor role.
     */
    function lockAssetGovernorRole() public onlyRole(ASSET_GOVERNOR_ROLE) {
        _lockRole(ASSET_GOVERNOR_ROLE);
    }

    /**
     * @dev only address with DEFAULT_ADMIN_ROLE can call this function
     * @param newMinter_ address of new minter
     */
    function setMinterRole(address newMinter_) public onlyAdmin {
        _revokeRole(MINTER_ROLE, _role_stats[MINTER_ROLE].member);
        _grantRole(MINTER_ROLE, newMinter_);
    }

    /**
     * @dev Allows the default admin to permanently lock the minter role, preventing further changes.
     * this method locks all reassigning of the minter role
     */
    function lockMinterRole() public onlyAdmin {
        _lockRole(MINTER_ROLE);
    }

    /**
     *
     * @dev only address with DEFAULT_ADMIN_ROLE can call this function
     * allows the admin to change the burner role
     * @param newBurner_ address of new burner
     */
    function setBurnerRole(address newBurner_) public onlyAdmin {
        _revokeRole(BURNER_ROLE, _role_stats[BURNER_ROLE].member);
        _grantRole(BURNER_ROLE, newBurner_);
    }

    /**
     * @dev Allows the default admin to permanently lock the burner role, preventing further changes.
     */
    function lockBurnerRole() public onlyAdmin {
        _lockRole(BURNER_ROLE);
    }

    /**
     * @dev only address with DEFAULT_ADMIN_ROLE can call this function
     * allows the admin to change the metaDataOperator role
     * @param newOperator_ address of new metaDataOperator
     */
    function setMetaDataOperatorRole(address newOperator_) public onlyAdmin {
        _revokeRole(
            META_DATA_OPERATOR_ROLE,
            _role_stats[META_DATA_OPERATOR_ROLE].member
        );
        _grantRole(META_DATA_OPERATOR_ROLE, newOperator_);
    }

    /**
     * @dev Allows the default admin to permanently lock the metaDataOperator role, preventing further changes.
     */
    function lockMetaDataOperatorRole() public onlyAdmin {
        _lockRole(META_DATA_OPERATOR_ROLE);
    }

    struct ChangeTokenURIInput {
        uint256 tokenId;
        string newTokenURI;
    }

    /**
     * @dev allows the metaDataOperator to change the tokenURI of a token
     * @param input_ the input data for the changeTokenURI function struct with tokenID and newTokenURI
     */
    function changeTokenURI(
        ChangeTokenURIInput calldata input_
    ) public onlyRole(META_DATA_OPERATOR_ROLE) {
        _requireMinted(input_.tokenId);
        assets[input_.tokenId].tokenURI = input_.newTokenURI;
    }

    /**
     * @dev allows the metaDataOperator to change the tokenURI of a token
     * @param inputs_ array of input data for the changeTokenURI function struct with tokenID and newTokenURI
     */
    function changeTokenURIBatch(
        ChangeTokenURIInput[] calldata inputs_
    ) public onlyRole(META_DATA_OPERATOR_ROLE) {
        for (uint256 i = 0; i < inputs_.length; i++) {
            _requireMinted(inputs_[i].tokenId);
            assets[inputs_[i].tokenId].tokenURI = inputs_[i].newTokenURI;
        }
    }

    /**
     * @dev allows the admin to change the baseURI
     * @param newBaseURI_ the new baseURI
     */
    function changeBaseURI(string memory newBaseURI_) public onlyAdmin {
        _baseURIString = newBaseURI_;
    }

    /**
     * @dev Pauses mint burn and transfer operations
     * can only be called by the admin and only while it is not paused
     *
     */
    function pause() public onlyAdmin {
        _pause();
    }

    /**
     * @dev Unpauses mint burn and transfer operations
     * can only be called by the admin and only while it is not paused
     */
    function unpause() public onlyAdmin {
        _unpause();
    }

    struct MintInput {
        address to;
        uint256 erc20Value;
        string tokenURI;
        string chip;
    }

    function mint(
        MintInput calldata input_
    ) public whenNotPaused onlyRole(MINTER_ROLE) {
        _mint(input_.to, input_.erc20Value, input_.tokenURI, input_.chip);
    }

    function mint(
        MintInput[] calldata inputs_
    ) public whenNotPaused onlyRole(MINTER_ROLE) {
        for (uint256 i = 0; i < inputs_.length; i++) {
            _mint(
                inputs_[i].to,
                inputs_[i].erc20Value,
                inputs_[i].tokenURI,
                inputs_[i].chip
            );
        }
    }

    struct BurnInput {
        uint256 tokenID;
        address owner;
    }

    /**
     *
     * @dev this function takes in a tokenID and burns it
     * and deletes the asset data
     * the user must approve this contract to spend the token
     * @param input_ the input data for the burn function struct with tokenID and owner address
     */
    function burn(
        BurnInput calldata input_
    ) public whenNotPaused onlyRole(BURNER_ROLE) {
        if (!_isApprovedOrOwner(msg.sender, input_.tokenID))
            revert NotApprovedOrOwner(
                msg.sender,
                ownerOf(input_.tokenID),
                input_.tokenID
            );
        _burn(input_.tokenID);
        delete assets[input_.tokenID];
        emit RedeemedGoldBar(
            msg.sender,
            input_.tokenID,
            assets[input_.tokenID].erc20Value
        );
    }

    /**
     * @dev this function allows the erc20 contract to freeze an account. this function
     * should only be called by the freezeAccount function in the erc20 contract
     * @param account_ the address of the account to freeze
     *
     */
    function freezeAccount(address account_) public onlyERC20 {
        if (_isFrozen(account_)) revert AccountFrozen(account_);
        _frozenAccounts[account_] = true;
        emit FrozeAccount(account_);
    }

    /**
     * @dev this function allows the erc20 contract to unfreeze an account. this function
     * should only be called by the unfreezeAccount function in the erc20 contract
     * @param account_ the address of the account to unfreeze
     */
    function unfreezeAccount(address account_) public onlyERC20 {
        if (!_isFrozen(account_)) revert AccountNotFrozen(account_);
        _frozenAccounts[account_] = false;
        emit UnfrozeAccount(account_);
    }

    /**
     * @dev this function allows the assetGovernor to recapture frozen funds from an account
     * that has been frozen. the assetGovernor can recapture any number of tokens from the account
     * @param account_ the address of the account to recapture the funds from
     * @param numTokens_ the number of tokens to recapture
     */
    function recaptureFrozenFunds(
        address account_,
        uint256 numTokens_
    ) public onlyRole(ASSET_GOVERNOR_ROLE) {
        if (!_isFrozen(account_)) revert AccountNotFrozen(account_);
        if (numTokens_ > balanceOf(account_)) revert IndexOutOfRange();
        for (uint256 i = 0; i < numTokens_; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(account_, 0);
            _transfer(account_, msg.sender, tokenId);
        }
        emit RecapturedFrozenFunds(account_, numTokens_);
    }

    /**
     * this is public view function that returns a list of AssetData structs containing metadata of the user's positions
     * @param user_ the address of the user
     * @param startIndex_ the index to start from
     * @param endIndex_ the index to end at
     * @return an array of AssetData structs
     */

    function getUserPositions(
        address user_,
        uint256 startIndex_,
        uint256 endIndex_
    ) public view returns (AssetData[] memory) {
        uint256 total = balanceOf(user_);
        if (endIndex_ > total || startIndex_ >= endIndex_) {
            revert InvalidRanges();
        }
        AssetData[] memory positions = new AssetData[](endIndex_ - startIndex_);
        uint256 counter = 0;
        for (uint256 i = startIndex_; i < endIndex_; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user_, i);
            positions[counter] = assets[tokenId];
            counter++;
        }
        return positions;
    }

    /**
     * @dev this function returns the asset data of a token
     * @param tokenId_ the tokenID of the nft
     * @return AssetData struct containing the asset data. the struct contains the erc20Value and tokenURI
     */
    function getPositionData(
        uint256 tokenId_
    ) public view returns (AssetData memory) {
        return assets[tokenId_];
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(
            AccessControlDefaultAdminRulesUpgradeable,
            ERC721EnumerableUpgradeable,
            ERC721Upgradeable
        )
        returns (bool)
    {
        return
            ERC721EnumerableUpgradeable.supportsInterface(interfaceId) ||
            AccessControlDefaultAdminRulesUpgradeable.supportsInterface(
                interfaceId
            );
    }

    /**
     * @dev Returns the value of the token with the given `tokenId_`.
     * @param tokenId_ The identifier of the token to get the value for
     * @return uint256 The number of ERC20 tokens this nft is worth
     */
    function getTokenValue(uint256 tokenId_) public view returns (uint256) {
        return _getTokenValue(tokenId_);
    }

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     * @param tokenId_ The identifier of the token to get the URI for
     * @return string The URI for the token
     */
    function tokenURI(
        uint256 tokenId_
    ) public view override returns (string memory) {
        _requireMinted(tokenId_);
        string memory baseURIString = _baseURI();
        string memory tokenURIString = assets[tokenId_].tokenURI;
        return
            bytes(baseURIString).length > 0
                ? string(abi.encodePacked(baseURIString, tokenURIString))
                : string(abi.encodePacked(tokenURIString));
    }

    /**
     * @dev Returns the base URI for token URIs.
     * @return string The base URI for token URIs
     */
    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function isFrozen(address account_) public view returns (bool) {
        return _isFrozen(account_);
    }

    function _transfer(
        address from_,
        address to_,
        uint256 tokenId_
    ) internal override {
        // get the hook address
        address hook = _getTransferHook();
        if (hook == address(0)) {
            // transfer the token
            super._transfer(from_, to_, tokenId_);
            return;
        }
        // call the before token transfer hook
        bool doAH = IExtHookLogic(hook).beforeTokenTransfer( //wake-disable-line
            from_,
            to_,
            tokenId_
        );
        super._transfer(from_, to_, tokenId_);
        if (doAH) {
            // call the after token transfer hook
            IExtHookLogic(hook).afterTokenTransfer(from_, to_, tokenId_, 0); //wake-disable-line
        }
    }

    function _beforeTokenTransfer(
        address from_,
        address to_,
        uint256 firstTokenId_,
        uint256 batchSize_
    )
        internal
        override(ERC721EnumerableUpgradeable, ERC721PausableUpgradeable)
    {
        if (_isFrozen(from_) && to_ != getRoleMember(ASSET_GOVERNOR_ROLE))
            revert AccountFrozen(from_);
        if (_isFrozen(to_)) revert AccountFrozen(to_);
        ERC721PausableUpgradeable._beforeTokenTransfer(
            from_,
            to_,
            firstTokenId_,
            batchSize_
        );
    }

    /**
     *
     * @param to_ address to mint the tokens to
     * @param erc20Value_ the value of the asset in gcoins(the weight of the bar in grams)
     * @param chip_ unique chip id of the asset
     * @return tokenID the keccak256 hash of the chip as a uint256
     * @dev mints an nft without minting Gcoins, and sets the nft price in gcoins
     */
    function _mint(
        address to_,
        uint256 erc20Value_,
        string calldata tokenURI_,
        string calldata chip_
    ) internal returns (uint256 tokenID) {
        if (erc20Value_ == 0) {
            revert InvalidERC20Value();
        }
        tokenID = uint256(keccak256(abi.encodePacked(chip_)));
        // get the hook address
        address hook = _getMintHook();
        // set the asset data
        assets[tokenID] = AssetData(erc20Value_, tokenURI_);
        // increment the tokenID counter
        // _tokenIdCounter.increment();
        if (hook == address(0)) {
            _mint(to_, tokenID);
            return tokenID;
        }
        bool doAH = IExtHookLogic(hook).beforeTokenMint(to_, tokenID); //wake-disable-line
        _mint(to_, tokenID);
        if (doAH) {
            IExtHookLogic(hook).afterTokenMint(to_, tokenID); //wake-disable-line
        }
    }

    /**
     *
     * @param tokenId_ the tokenID of the nft to burn
     * @dev this function burns the nft and deletes the asset data
     */
    function _burn(uint256 tokenId_) internal override {
        // get the burn gook
        address hook = _getBurnHook();
        if (hook == address(0)) {
            // burn the token
            super._burn(tokenId_);
            // delete the asset data
            delete assets[tokenId_];
            return;
        }
        address nftOwner = ownerOf(tokenId_);
        bool doAH = IExtHookLogic(hook).beforeTokenBurn(nftOwner, tokenId_); //wake-disable-line
        // burn the token
        super._burn(tokenId_);
        // delete the asset data
        delete assets[tokenId_];
        if (doAH) {
            IExtHookLogic(hook).afterTokenBurn(nftOwner, tokenId_);
        }
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseURIString;
    }

    function _getTokenValue(uint256 tokenId_) internal view returns (uint256) {
        return assets[tokenId_].erc20Value;
    }

    function _isFrozen(address account_) internal view returns (bool) {
        return _frozenAccounts[account_];
    }

    function _onlyHookAdmin() internal override onlyAdmin {}
}
