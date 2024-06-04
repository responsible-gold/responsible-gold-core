// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IAssetNFT {
    function getTokenValue(uint256 tokenID_) external view returns (uint256);

    function ownerOf(uint256 tokenID_) external view returns (address);

    function safeTransferFrom(
        address from_,
        address to_,
        uint256 tokenID_
    ) external;

    function freezeAccount(address account_) external;

    function unfreezeAccount(address account_) external;
}
