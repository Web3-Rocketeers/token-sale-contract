const { expect } = require("chai");
const { BN, ether, expectEvent, expectRevert, constants } = require("@openzeppelin/test-helpers");
const TokenSale = artifacts.require("TokenSale");
const ERC20 = artifacts.require("IERC20");

contract("TokenSale", function (accounts) {
    const [deployer, buyer, other] = accounts;
    let tokenSale, token;
  
    beforeEach(async function () {
      // Deploy the token contract and give some tokens to the token sale contract
      token = await ERC20.new("Test Token", "TST", 18, { from: deployer });
      const initialSupply = ether("1000");
      await token.transfer(tokenSale.address, initialSupply, { from: deployer });
  
      // Deploy the token sale contract with the token address and a token price
      const tokenPrice = ether("0.000005");
      tokenSale = await TokenSale.new(token.address, tokenPrice, { from: deployer });
    });
  
    it("should initialize the token sale contract with correct values", async function () {
      expect(await tokenSale.admin()).to.equal(deployer);
      expect(await tokenSale.tokenContract()).to.equal(token.address);
      expect(await tokenSale.tokenPrice()).to.be.bignumber.equal(tokenPrice);
    });
  
    // ...add more test cases
  });
  