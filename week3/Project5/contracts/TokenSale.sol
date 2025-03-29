// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MyToken} from "./MyToken.sol";
import {MyNFT} from "./MyNFT.sol";

contract TokenSale {
    uint256 public ratio;
    uint256 public price;
    MyToken public tokenContract;
    MyNFT public nftContract;

    constructor(
        uint256 _ratio,
        uint256 _price,
        MyToken _tokenContract,
        MyNFT _nftContract
    ) {
        ratio = _ratio;
        price = _price;
        tokenContract = _tokenContract;
        nftContract = _nftContract;
    }

    function buyTokens() public payable {
        tokenContract.mint(msg.sender, msg.value * ratio);
    }
}

/*

function buyTokens() public payable {
tokenContract.mint(msg.sender, msg.value * ratio);
}

function burnTokens(uint256 amount) public {
tokenContract.burnFrom(msg.sender, amount);
payable(msg.sender).transfer(amount / ratio);
*/


/*

The import
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
 
Ivan Melnychuk (Mar 19, 2025, 16:35)
no, Myjtoken.sol with Burnable....
 
Bootcamp 2 Encode (Mar 19, 2025, 16:35)
it("burns the correct amount of tokens", async () => {
const {
publicClient,
tokenSaleContract,
otherAccount,
paymentTokenContract,
} = await loadFixture(deployContract);
const tx = await tokenSaleContract.write.buyTokens({
value: TEST_BUY_TOKENS,
account: otherAccount.account,
});
await publicClient.waitForTransactionReceipt({ hash: tx });
const tokenBalanceAfterBuyTx = await paymentTokenContract.read.balanceOf([
otherAccount.account.address,
]);
const approveTx = await paymentTokenContract.write.approve(
[tokenSaleContract.address, tokenBalanceAfterBuyTx],
{
account: otherAccount.account,
}
);
await publicClient.waitForTransactionReceipt({ hash: approveTx });
const tx2 = await tokenSaleContract.write.burnTokens(
[tokenBalanceAfterBuyTx],
{
account: otherAccount.account,
}
);
await publicClient.waitForTransactionReceipt({ hash: tx2 });
const tokenBalanceAfterBurnTx = await paymentTokenContract.read.balanceOf([
otherAccount.account.address,
]);
expect(tokenBalanceAfterBurnTx).to.eq(0n);
});

*/