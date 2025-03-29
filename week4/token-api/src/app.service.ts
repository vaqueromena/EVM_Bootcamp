import { Injectable } from '@nestjs/common';
import * as tokenJson from "./assets/MyToken.json";
import { Address, createPublicClient, createWalletClient, formatEther, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

class Constants {
    static readonly providerApiKey = process.env.ALCHEMY_API_KEY || "";
    static readonly deployerPrivateKey = process.env.PRIVATE_KEY || "";
    static readonly deployerPrivateKeySecondWallet = process.env.PRIVATE_KEY_SECOND || "";
}

@Injectable()
export class AppService {

    publicClient;
    walletClient;

    constructor() {
        const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
        this.publicClient = createPublicClient({
            chain: sepolia,
            transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
        });
        this.walletClient = createWalletClient({
            transport: http(process.env.RPC_ENDPOINT_URL),
            chain: sepolia,
            account: account,
        });
    }

    // publicClient;
    // constructor() {
    //     this.publicClient = createPublicClient({
    //         chain: sepolia,
    //         transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
    //     });
    // }

    getHello(): string {
        return 'Hello World!';
    }

    getContractAddress(): string {
        // return process.env.ALCHEMY_API_KEY as string;
        return "0x2282A77eC5577365333fc71adE0b4154e25Bb2fa";
    }

    async getTokenName(): Promise<string> {
        const publicClient = createPublicClient({
            chain: sepolia,
            transport: http(`https://eth-sepolia.g.alchemy.com/v2/PpWGDU7fhOL-GpjUCk_2tvV9U28lj2Gj`),
        });
        const name = await publicClient.readContract({
            address: this.getContractAddress() as Address,
            abi: tokenJson.abi,
            functionName: "name"
        });
        return name as string;
    }

    getTransactionReceipt(hash: string) {
        throw new Error('Method not implemented.');
    }
    // ?????
    async getTokenBalance(address: string) {
        const balance = await this.publicClient.readContract({
            address: this.getContractAddress() as Address,
            abi: tokenJson.abi,
            functionName: "balanceOf",
            args: [address as Address]
        });
        const balanceFormatted = formatEther(balance as bigint);
        return balanceFormatted;
    }

    async getTotalSupply() {
        const publicClient = createPublicClient({
            chain: sepolia,
            transport: http(`https://eth-sepolia.g.alchemy.com/v2/PpWGDU7fhOL-GpjUCk_2tvV9U28lj2Gj`),
        });
        const totalSupplyBN = await publicClient.readContract({
            address: this.getContractAddress() as Address,
            abi: tokenJson.abi,
            functionName: "totalSupply"
        });
        const totalSupply = formatEther(totalSupplyBN as bigint);
        return totalSupply;
    }

    getServerWalletAddress(): string {
        return this.walletClient.account.address;
      }
    
      async checkMinterRole(address: string): Promise<boolean> {
        const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
        // const MINTER_ROLE =  await this.publicClient.readContract({
        //   address: this.getContractAddress(),
        //   abi: tokenJson.abi,
        //   functionName: 'MINTER_ROLE'
        // });
        const hasRole = await this.publicClient.readContract({
          address: this.getContractAddress(),
          abi: tokenJson.abi,
          functionName: 'hasRole',
          args: [MINTER_ROLE, address],
        });
        return hasRole;
      }

}

/*

# MNEMONIC="here is where your extracted twelve words mnemonic phrase should be put"
PRIVATE_KEY="78871a47d9ed96cd2f968a686a9e72ac828a017cbd5e2913b4082839b15dc3e6"
PRIVATE_KEY_SECOND="55ca4eaec16f907906c5d20b40d7faf42024b582848e222dba4f2f0f2dce1a61"
ALCHEMY_API_KEY="PpWGDU7fhOL-GpjUCk_2tvV9U28lj2Gj"
*/

