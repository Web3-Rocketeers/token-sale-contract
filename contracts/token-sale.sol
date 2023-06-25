// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract TokenSale is Ownable, Pausable {
    IERC20 public token;
    uint256 public price;
    uint256 private constant ONE_TOKEN = 10 ** 18; //Tokens are typically divisible to 18 decimal places
    bool public isTimeBased = false;
    uint256[] public prices;
    uint256[] public priceChangeTimestamps;

    event Sell(address indexed _buyer, uint256 _amount);

    constructor(IERC20 _token, uint256 _price) {
        token = _token;
        price = _price;
    }

    function buyTokens() external payable whenNotPaused {
        uint256 amountToBuy;
        if (isTimeBased) {
            amountToBuy = msg.value * getCurrentPrice() / ONE_TOKEN;
        } else {
            amountToBuy = msg.value * price / ONE_TOKEN;
        }
        uint256 contractBalance = token.balanceOf(address(this));

        require(amountToBuy > 0, "You need to send some ether");
        require(
            amountToBuy <= contractBalance,
            "Not enough tokens left for sale"
        );

        token.transfer(msg.sender, amountToBuy);

        emit Sell(msg.sender, amountToBuy);
    }

    function getCurrentPrice() public view returns (uint256) {
        if (!isTimeBased) {
            return price;
        }
        for (uint i = priceChangeTimestamps.length; i > 0; i--) {
            if (block.timestamp >= priceChangeTimestamps[i - 1]) {
                return prices[i - 1];
            }
        }
        revert("No price defined for current time");
    }

    function setPrice(uint256 _price) external onlyOwner {
        require(
            !isTimeBased,
            "Cannot manually set price during time-based phase"
        );
        price = _price;
    }

    function switchToTimeBasedTiers(
        uint256[] memory newPrices,
        uint256[] memory timestamps
    ) external onlyOwner {
        require(
            newPrices.length == timestamps.length,
            "Arrays must be the same length"
        );
        prices = newPrices;
        priceChangeTimestamps = timestamps;
        isTimeBased = true;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function endSale() external onlyOwner {
        // Send unsold tokens to the owner
        require(
            token.transfer(owner(), token.balanceOf(address(this))),
            "Error transferring tokens to owner"
        );

        // Send Ether received during the sale to the owner
        payable(owner()).transfer(address(this).balance);
    }
}
