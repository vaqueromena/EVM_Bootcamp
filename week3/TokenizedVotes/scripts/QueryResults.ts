import { Address, createPublicClient, createWalletClient, formatEther, getContract, getContractAddress, hexToString, http, parseEther, PublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/TokenisedBallot.sol/TokenizedBallot.json";
import { viem } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY;
const deployerPrivateKey = process.env.PRIVATE_KEY;
const MTK_CONTRACT_ADDRESS = '0x0134bced86d4b2b74ebbfa24508b9989736b859b'; // MyToken contract address
const BALLOT_CONTRACT_ADDRESS = '0x8dafc41885815b055890367d38f3d347e1698970'; // Ballot contract address

type VoteTuple = [string, number];

export async function queryResults() {

    console.log("query results...");
    console.log(`---------------------------------------------------`);
    const publicClient = getPublicClient()
    console.log('---------------------------------------------------');

    const contract = getContract({
        address: BALLOT_CONTRACT_ADDRESS,
        abi: abi,
        client: { public: publicClient },
    });

    var proposals = [];
    const proposalsCount = await contract.read.proposalCount();
    for (let index = 0; index < Number(proposalsCount); index++) {
        const proposal = await contract.read.proposals([index]) as { 0: `0x${string}`; 1: bigint };
        console.log(`PROPOSAL RAW: ${typeof proposal[0]}`);
        if (proposal) {
            let name = hexToString(proposal[0], { size: 32 });
            let voteCount = proposal[1];
            proposals.push({ name, voteCount });
        }
    }
    console.log(`---------------------------------------------------`);
    console.log(`PROPOSALS: = ${proposals.map((tuple) => `\n${tuple.name} count: ${tuple.voteCount}`)}`);
}

function getPublicClient(): PublicClient {
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    })
    return publicClient;
}