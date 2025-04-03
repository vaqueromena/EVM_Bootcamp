import {Address, createPublicClient, createWalletClient, formatEther, getContract, getContractAddress, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/MyToken.sol/MyToken.json";
import { viem } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY;
const deployerPrivateKey = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = '0x0134bced86d4b2b74ebbfa24508b9989736b859b'; // MyToken contract address

export async function delegate(_delegateTo: Address) {
    console.log("delegate MyToken...");
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
    const votesBefore = await contract.read.getVotes([deployer.account.address]) as bigint;
    console.log("votes  before to:", formatEther(votesBefore));
    console.log('--------------------------self delegate-------------------------');

    let delegateToAddress: Address = deployer.account.address;
    if (_delegateTo)  {
        // check iif _delegateTo is a valid address
        if (!/^0x[a-fA-F0-9]{40}$/.test(_delegateTo)) {
            console.error("Invalid address:", _delegateTo);
        } else {
            delegateToAddress = _delegateTo;
        }
    };
    console.log("delegate token to address:", delegateToAddress);
    const delegateTx = await contract.write.delegate([delegateToAddress]);
    await publicClient.waitForTransactionReceipt({ hash: delegateTx });
    console.log("Transaction hash:", delegateTx);
    console.log('---------------------------------------------------');
    const votesAfter = await contract.read.getVotes([delegateToAddress]) as bigint;
    console.log("votes  after:", formatEther(votesAfter));
    console.log('-------------------------END--------------------------');
}