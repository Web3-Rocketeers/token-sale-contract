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

  // Add more test cases as needed
});
