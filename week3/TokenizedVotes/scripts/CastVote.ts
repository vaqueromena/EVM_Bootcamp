import {Address, createPublicClient, createWalletClient, formatEther, getContract, getContractAddress, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/TokenisedBallot.sol/TokenizedBallot.json";
import { viem } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY;
const deployerPrivateKey = process.env.PRIVATE_KEY;
const BALLOT_CONTRACT_ADDRESS = '0x8dafc41885815b055890367d38f3d347e1698970'; // Ballot contract address

export async function castVote(index:number, voteAmount: string) {
    console.log("Cast Vote...");
    console.log(`---------------------------------------------------`);
    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    console.log("Deployer account:", account.address);
    console.log('---------------------------------------------------');
    const deployer = createWalletClient({
        account,
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    })
    
    const contract = getContract({
        address: BALLOT_CONTRACT_ADDRESS,
        abi: abi,
        client: {wallet: deployer, public: publicClient},
    });
    console.log("Cast Vote amount (string) : ", voteAmount);
    console.log("Cast Vote amount : ", parseEther(voteAmount));
    const voteTx = await contract.write.vote([index, parseEther(voteAmount)]);
    await publicClient.waitForTransactionReceipt({ hash: voteTx });
    console.log("Transaction hash:", voteTx);
    console.log('-----------------------VOTED----------------------------');
    // const delegateTx = await contract.write.delegate([delegateToAddress]);
    // await publicClient.waitForTransactionReceipt({ hash: delegateTx });
    // console.log("Transaction hash:", delegateTx);
    // console.log('---------------------------------------------------');
    // const votesAfter = await contract.read.getVotes([delegateToAddress]) as bigint;
    // console.log("votes  after:", formatEther(votesAfter));
    // console.log('-------------------------END--------------------------');
}