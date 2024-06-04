pragma solidity ^0.8.23;

interface IAssetNFT {
    function mintWithoutERC20Tokens(
        address to_,
        uint256 erc20Value_,
        string memory chip_
    ) external;

    /**
     * @param to_ address to mint g-coins to
     * @param erc20Value_ the value of the asset in gcoins(the weight of the bar in grams)
     * @param chip_ unique chip id of the asset
     * @dev this function mints a new nft to the gcoin token contract,
     * and mints the corresponding gcoins to the address specified
     */
    function mintWithERC20Tokens(
        address to_,
        uint256 erc20Value_,
        string memory chip_
    ) external;

    struct BatchMintInput {
        address to;
        uint256 erc20Value;
        string chipID;
    }

    /**
     * @dev this function takes in multiple asset data and mints a nft for each asset to the token contract,
     * and mints the corresponding gcoins to the recipient specified
     * @param assets_ array of asset data to mint
     */
    function batchMintWithERC20Tokens(BatchMintInput[] memory assets_) external;

    function batchMintWithoutERC20Tokens(
        BatchMintInput[] memory assets_
    ) external;

    /**
     *
     * @param tokenID_ the tokenID of the nft to exchange
     * @dev this function allows users to exchange their nft for gcoins
     * the nft must be owned by the user calling this function
     * the nft must be transfered to the Gcoin contract
     */
    function exchangeNFT(uint256 tokenID_) external;

    /**
     * @dev this function allows users to exchange their gcoins for a nft associated with a physical gold bar
     * this function will first call the gcoin contract to burn the gcoins required from the sender balance
     * then transfers the specified tokenID from the token contract to the sender
     * @param tokenID_ the tokenID of the nft to claim
     */
    function claimNFT(uint256 tokenID_) external;

    /**
     *
     * @param tokenID_ the tokenID of the nft to redeem
     * @dev this function allows users to redeem their nft for a physical gold bar
     * the nft must be owned by the user calling this function
     */
    function redeemNFT(uint256 tokenID_) external;

    struct AssetData {
        uint256 erc20Value;
        string chipID;
    }

    function getUserPositions(
        address user_,
        uint256 startIndex_,
        uint256 endIndex_
    ) external view returns (AssetData[] memory);

   
}
