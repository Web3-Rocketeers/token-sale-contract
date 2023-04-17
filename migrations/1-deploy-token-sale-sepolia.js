const TokenSale = artifacts.require("TokenSale");
const ERC20 = artifacts.require("IERC20");

module.exports = function (deployer, network, accounts) {
    const { sepoliaTokenAddress } = require("../truffle-config");
    const tokenContractAddress = sepoliaTokenAddress;    
    const tokenPrice = web3.utils.toWei("0.000005", "ether");

    console.log("Token contract address:", tokenContractAddress);

    return ERC20.at(tokenContractAddress).then((tokenInstance) => {
        console.log("Token instance address:", tokenInstance.address);
        return deployer.deploy(TokenSale, tokenInstance.address, tokenPrice);
    }).then((tokenSaleInstance) => {
        console.log("TokenSale contract address:", tokenSaleInstance.address);
    }).catch((error) => {
        console.error("Error during deployment:", error);
    });
};
