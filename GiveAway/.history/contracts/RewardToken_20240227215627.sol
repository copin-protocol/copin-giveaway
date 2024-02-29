// contracts/MyNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RewardToken is ERC20 {
    uint256 public const initialSupply = 50_000_000_000 * 10 ** uint256(18);

    constructor() ERC20("RewardToken", "RWT") {
        _mint(msg.sender, initialSupply);
    }
}
