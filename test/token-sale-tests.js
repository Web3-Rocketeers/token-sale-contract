const { expect } = require("chai");
const { BN, ether, expectEvent, expectRevert, constants } = require("@openzeppelin/test-helpers");
const TokenSale = artifacts.require("TokenSale");
const truffleConfig = require('../truffle-config');

contract("TokenSale", function (accounts) {
  const [deployer, buyer, other] = accounts;
  let tokenSale, token;

  beforeEach(async function () {
    const network = await web3.eth.net.getNetworkType();
    const tokenABI = truffleConfig.getABI(network);
    const deployedTokenAddress = 0xcEAAc35a8992CA451a85A377C831eD9Bc45026e1;

    // Create a contract instance using the ABI and the token contract address
    token = new web3.eth.Contract(tokenABI, deployedTokenAddress);

    // Deploy TokenSale contract
    tokenSale = await TokenSale.new(deployedTokenAddress);

    // Transfer some tokens to the TokenSale contract
    const tokensToTransfer = web3.utils.toBN(1e18);
    await token.methods.transfer(tokenSale.address, tokensToTransfer.toString()).send({ from: deployer });
  });

  it("should correctly initialize the token sale contract", async function () {
    const tokenAddress = await tokenSale.tokenContract();
    assert.equal(tokenAddress, token.options.address, "TokenSale contract has incorrect token address");
  });

  it("should allow users to buy tokens", async function () {
    const tokensToBuy = web3.utils.toBN(1e17);
    const tokenSaleRate = await tokenSale.rate();
    const value = tokensToBuy.mul(tokenSaleRate);
    
    // Buy tokens
    await tokenSale.buyTokens(tokensToBuy.toString(), { from: buyer, value: value.toString() });

    // Check buyer balance
    const buyerBalance = await token.methods.balanceOf(buyer).call();
    assert.equal(buyerBalance.toString(), tokensToBuy.toString(), "Buyer has incorrect token balance after purchase");
  });

  it("should not allow users to buy more tokens than available", async function () {
    const tokensToBuy = web3.utils.toBN(2e18); // More than the tokens transferred to the contract
    const tokenSaleRate = await tokenSale.rate();
    const value = tokensToBuy.mul(tokenSaleRate);

    // Attempt to buy tokens
    await expectRevert(
      tokenSale.buyTokens(tokensToBuy.toString(), { from: buyer, value: value.toString() }),
      "Not enough tokens left for sale"
    );
  });

  it("should allow only owner to end the sale", async function () {
    await expectRevert(
      tokenSale.endSale({ from: other }),
      "Ownable: caller is not the owner"
    );
  });

  it("should transfer remaining tokens and Ether to owner on endSale", async function () {
    const initialOwnerBalance = await token.methods.balanceOf(deployer).call();
    const initialContractBalance = await token.methods.balanceOf(tokenSale.address).call();

    // End sale
    await tokenSale.endSale({ from: deployer });

    const finalOwnerBalance = await token.methods.balanceOf(deployer).call();
    const finalContractBalance = await token.methods.balanceOf(tokenSale.address).call();

    assert.equal(finalContractBalance, 0, "Contract should have no tokens left");
    assert.equal(finalOwnerBalance - initialOwnerBalance, initialContractBalance, "Owner should have received the remaining tokens");
  });

  it("should allow only owner to set the price", async function () {
    const newPrice = web3.utils.toWei("0.00001", "ether");
  
    // Attempt to set price from non-owner account
    await expectRevert(
      tokenSale.setPrice(newPrice, { from: other }),
      "Ownable: caller is not the owner"
    );
  
    // Set price from owner account
    await tokenSale.setPrice(newPrice, { from: deployer });
  
    // Check that the price has been updated
    const tokenSalePrice = await tokenSale.price();
    assert.equal(tokenSalePrice.toString(), newPrice, "Price was not updated correctly");
  });
  
  // Add more test cases as needed
});