// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenSale {
    address public admin;
    IERC20 public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(IERC20 _tokenContract, uint256 _tokenPrice) {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(
            msg.value == multiply(_numberOfTokens, tokenPrice),
            "Incorrect amount of ether sent"
        );
        require(
            tokenContract.balanceOf(address(this)) >= _numberOfTokens,
            "Not enough tokens available in the contract"
        );
        require(
            tokenContract.transfer(msg.sender, _numberOfTokens),
            "Token transfer failed"
        );

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin, "Only admin can end the sale");
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            ),
            "Unable to transfer tokens to admin"
        );

        // Just transfer the balance to the admin, but you can also implement a withdrawal pattern here
        payable(admin).transfer(address(this).balance);
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(
            y == 0 || (z = x * y) / y == x,
            "SafeMath: multiplication overflow"
        );
    }
}
