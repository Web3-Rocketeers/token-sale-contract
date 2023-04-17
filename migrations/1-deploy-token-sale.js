const TokenSale = artifacts.require("TokenSale");
const ERC20 = artifacts.require("IERC20");

module.exports = function (deployer, network, accounts) {
  const tokenContractAddress = "0xcEAAc35a8992CA451a85A377C831eD9Bc45026e1";
  const tokenPrice = web3.utils.toWei("0.000005", "ether");

  return ERC20.at(tokenContractAddress).then((tokenInstance) => {
    deployer.deploy(TokenSale, tokenInstance.address, tokenPrice);
  });
};
