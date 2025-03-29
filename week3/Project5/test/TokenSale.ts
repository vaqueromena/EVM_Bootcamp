import { expect } from "chai";
import { viem } from "hardhat"
import { createPublicClient, parseEther } from "viem"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";


const RATIO = 10n;
const PRICE = 5n;
const TEST_BUY_TOKENS = parseEther("1");

async function deployContract() {
  const publicClient = await viem.getPublicClient()
  const [deployer, otherAccount] = await viem.getWalletClients();
  const paymentTokenContract = await viem.deployContract("MyToken");
  const nftContract = await viem.deployContract("MyNFT");
  const tokenSaleContract = await viem.deployContract("TokenSale", [
    RATIO,
    PRICE,
    paymentTokenContract.address,
    nftContract.address,
  ]);
  const MINTER_ROLE = await paymentTokenContract.read.MINTER_ROLE();
  const grantMinterRolePaymentTokenContractTx =
    await paymentTokenContract.write.grantRole([
      MINTER_ROLE,
      tokenSaleContract.address,
    ]);
  await publicClient.waitForTransactionReceipt({
    hash: grantMinterRolePaymentTokenContractTx,
  });
  return {
    publicClient,
    deployer,
    otherAccount,
    paymentTokenContract,
    nftContract,
    tokenSaleContract,
  };
}

describe("NFT Shop", async () => {
  describe("When the Shop contract is deployed", async () => {
    it("defines the ratio as provided in parameters", async () => {
      const { tokenSaleContract } = await loadFixture(deployContract);
      const ratio = await tokenSaleContract.read.ratio();
      expect(ratio).to.eq(RATIO);
    })
    it("defines the price as provided in parameters", async () => {
      const { tokenSaleContract } = await loadFixture(deployContract);
      const price = await tokenSaleContract.read.price();
      expect(price).to.eq(PRICE);
    });
    it("uses a valid ERC20 as payment token", async () => {
      const { tokenSaleContract } = await loadFixture(deployContract);
      const tokenConstractAddress = await tokenSaleContract.read.tokenContract();
      const tokenContract = await viem.getContractAt("MyToken", tokenConstractAddress);
      const totalSupply = await tokenContract.read.totalSupply();
      expect(totalSupply).to.greaterThanOrEqual(0n);
    });
    it("uses a valid ERC721 as NFT collection", async () => {
      const { nftContract, tokenSaleContract } = await loadFixture(deployContract);
      const nftConstractAddress = await  tokenSaleContract.read.nftContract();
      expect(nftConstractAddress.toLowerCase).to.equal(nftContract.address.toLowerCase);
      
    });
  })
  describe("When a user buys an ERC20 from the Token contract", async () => {
    it("charges the correct amount of ETH", async () => {
      throw new Error("Not implemented");
    })
    it("gives the correct amount of tokens", async () => {
      const { tokenSaleContract, otherAccount, paymentTokenContract} = await loadFixture(deployContract);
      const tokenBalanceBefore = await paymentTokenContract.read.balanceOf([otherAccount.account.address]);
      const tx = await tokenSaleContract.write.buyTokens({
        value: TEST_BUY_TOKENS, 
        account: otherAccount.account
      });
        const tokenBalanceAfter = await paymentTokenContract.read.balanceOf([otherAccount.account.address]);
        const diff = tokenBalanceAfter - tokenBalanceBefore;
        expect(diff).to.eq(TEST_BUY_TOKENS * RATIO);
    });
    
  })
  describe("When a user burns an ERC20 at the Shop contract", async () => {
    it("gives the correct amount of ETH", async () => {
      const { tokenSaleContract, otherAccount, paymentTokenContact } = await loadFixture(deployContract);
      const tokenBalanceBefore = await paymentTokenContact.balanceOf([otherAccount.address]);
      const tx = await tokenSaleContract.write.buyToken({
        value: TEST_BUY_TOKENS,
        account: otherAccount.account
      });
      // const receipt = await viem.getPublicClient().waitForTransactionReceipt(tx); 

      const tokenBalanceAfter = await paymentTokenContact.balanceOf([otherAccount.address]);


      throw new Error("Not implemented");
    })
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
  })
  describe("When a user buys an NFT from the Shop contract", async () => {
    it("charges the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    })
    it("gives the correct NFT", async () => {
      throw new Error("Not implemented");
    });
  })
  describe("When a user burns their NFT at the Shop contract", async () => {
    it("gives the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
  })
  describe("When the owner withdraws from the Shop contract", async () => {
    it("recovers the right amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    })
    it("updates the owner pool account correctly", async () => {
      throw new Error("Not implemented");
    });
  });
});