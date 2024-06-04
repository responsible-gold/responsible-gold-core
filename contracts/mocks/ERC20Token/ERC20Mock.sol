pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor(
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) {}

    function mint(address to_, uint256 amount_) external returns (bool) {
        _mint(to_, amount_);
        return true;
    }

    function burn(address from_, uint256 amount_) external returns (bool) {
        _burn(from_, amount_);
        return true;
    }
}
