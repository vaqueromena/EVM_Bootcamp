import {Address, createPublicClient, createWalletClient, formatEther, getContract, getContractAddress, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/MyToken.sol/MyToken.json";
import { viem } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY;
const deployerPrivateKey = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = '0x0134bced86d4b2b74ebbfa24508b9989736b859b'; // MyToken contract address

export async function mint(recipient_address: Address, amount: string) {
    console.log("Minting MyTooken contract...");
    console.log(`---------------------------------------------------`);
    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    console.log("Deployer account:", account.address);
    console.log('---------------------------------------------------');
    const deployer = createWalletClient({
        account,
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });
    console.log('---------------------------------------------------');
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    })
    console.log('---------------------------------------------------');
    
    const contract = getContract({
        address: CONTRACT_ADDRESS,
        abi: abi,
        client: {wallet: deployer, public: publicClient},
    });
    const balanceOfTokenBefore = await contract.read.balanceOf([deployer.account.address]);
    console.log(`balance before minting: ${formatEther(balanceOfTokenBefore as bigint)} of MTK`);
    console.log('---------------------------------------------------');
    console.log("minting to:", recipient_address);
    console.log('---------------------------------------------------');
    const mintTx = await contract.write.mint([
        recipient_address, 
        parseUnits(amount, 18), // amount
    ]);
    await publicClient.waitForTransactionReceipt({ hash: mintTx });
    console.log("Transaction hash:", mintTx);
    console.log('---------------------------------------------------');
    const balanceOfTokenAfter = await contract.read.balanceOf([deployer.account.address]);
    console.log(`balance after minting: ${formatEther(balanceOfTokenAfter as bigint)} of MTK`);

    console.log('---------------------------------------------------');
}