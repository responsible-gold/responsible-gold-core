// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockAssetNFT is ERC721 {
    struct AssetData {
        uint256 erc20Value;
    }
    mapping(uint256 => AssetData) public assets;
    // mapping account to frozen status
    mapping(address => bool) internal _frozenAccounts;
    event FrozeAccount(address account_);
    event UnfrozeAccount(address account_);
    error AccountFrozen(address account_);
    error AccountNotFrozen(address account_);

    constructor() ERC721("MockAssetNFT", "ANFT") {}

    function mint(uint256 erc20Value_, uint256 tokenId_, address to_) public {
        assets[tokenId_] = AssetData(erc20Value_);
        _mint(to_, tokenId_);
    }

    function getTokenValue(uint256 tokenId) public view returns (uint256) {
        return assets[tokenId].erc20Value;
    }

    function freezeAccount(address account_) public {
        if (_isFrozen(account_)) revert AccountFrozen(account_);
        _frozenAccounts[account_] = true;
        emit FrozeAccount(account_);
    }

    function unfreezeAccount(address account_) public {
        if (!_isFrozen(account_)) revert AccountNotFrozen(account_);
        _frozenAccounts[account_] = false;
        emit UnfrozeAccount(account_);
    }

    function _isFrozen(address account_) internal view returns (bool) {
        return _frozenAccounts[account_];
    }
}
