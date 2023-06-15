const { expect } = require("chai");
const { BN, ether, expectEvent, expectRevert, constants } = require("@openzeppelin/test-helpers");
const TokenSale = artifacts.require("TokenSale");

contract("TokenSale", function ([deployer, buyer, other]) {
  let tokenSale;
  let token;

  beforeEach(async function () {
    // Get the token contract
    const Token = artifacts.require('ABITokenSepolia');
    token = await Token.at('0x11d41428173f7bE020198788f0ed29818a4daC96');
  
    // Mint some tokens to the deployer
    await token.mint(deployer, ether("1000"));
  
    // Deploy the TokenSale contract
    tokenSale = await TokenSale.new(token.address, ether("1"), { from: deployer });
  
    // Transfer some tokens to the TokenSale contract
    await token.transfer(tokenSale.address, ether("500"), { from: deployer });
  });
  
  it("should correctly initialize the token sale contract", async function () {
    expect(await tokenSale.token()).to.equal(token.address);
    expect(await tokenSale.price()).to.be.bignumber.equal(ether("1"));
  });

  it("should allow users to buy tokens", async function () {
    let amountToBuy = ether("1");
    await tokenSale.buyTokens({ from: buyer, value: amountToBuy });
    expect(await token.balanceOf(buyer)).to.be.bignumber.equal(amountToBuy);
  });

  it("should not allow users to buy more tokens than available", async function () {
    let amountToBuy = ether("1000"); // More than the tokens transferred to the contract
    await expectRevert(
      tokenSale.buyTokens({ from: buyer, value: amountToBuy }),
      "Not enough tokens left for sale"
    );
  });

  it("should allow only owner to end the sale", async function () {
    await expectRevert(
      tokenSale.endSale({ from: other }),
      "Ownable: caller is not the owner"
    );

    const initialOwnerBalance = await token.balanceOf(deployer);
    const initialContractBalance = await token.balanceOf(tokenSale.address);

    await tokenSale.endSale({ from: deployer });

    const finalOwnerBalance = await token.balanceOf(deployer);
    const finalContractBalance = await token.balanceOf(tokenSale.address);

    expect(finalContractBalance).to.be.bignumber.equal("0");
    expect(finalOwnerBalance.sub(initialOwnerBalance)).to.be.bignumber.equal(initialContractBalance);
  });

  it("should allow only owner to set the price", async function () {
    const newPrice = ether("0.01");

    await expectRevert(
      tokenSale.setPrice(newPrice, { from: other }),
      "Ownable: caller is not the owner"
    );

    await tokenSale.setPrice(newPrice, { from: deployer });

    expect(await tokenSale.price()).to.be.bignumber.equal(newPrice);
  });

  // Add more tests as needed
});
