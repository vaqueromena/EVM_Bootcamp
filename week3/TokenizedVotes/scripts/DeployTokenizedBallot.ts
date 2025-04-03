import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, createWalletClient, http, toHex } from "viem";
import { sepolia } from "viem/chains";
import { abi, bytecode } from "../artifacts/contracts/TokenisedBallot.sol/TokenizedBallot.json";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY;
const deployerPrivateKey = process.env.PRIVATE_KEY;
const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

export async function deployTokenizedBallot(contractAddress: string) {
    // console.log(`---------------------------------------------------`);
    // console.log(abi);
//     console.log(`---------------------------------------------------`);
// return ;
    console.log("Deploying MyTooken contract...");
    console.log(`---------------------------------------------------`);
    
    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    const deployer = createWalletClient({
        account,
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    })
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });

    const updatedProposals = PROPOSALS.map((prop, index) => prop += `${Math.floor(Math.random() * 10000)}`);
    // updatedProposals
    console.log(`---------------------------------------------------`);
    console.log("updated Proposals:", updatedProposals);
    // const proposalsBytes32 = updatedProposals.map((prop) => {toHex(prop, {size: 32})});
    const proposalsBytes32 = updatedProposals.map((prop) => toHex(prop, { size: 32 }));
    const currentBlock = await publicClient.getBlockNumber();
    const targetBlockNumber = currentBlock - BigInt(2);
    console.log(`---------------------------------------------------`);
    console.log(`currentBlock: ${currentBlock} /n targetBlockNumber: ${targetBlockNumber}`);

    console.log(`---------------------------------------------------`);
    console.log("Deployer account:", deployer.account.address);

    const hash = await deployer.deployContract({
        abi: abi,
        bytecode: bytecode as `0x${string}`,
        args: [proposalsBytes32, contractAddress, targetBlockNumber],
    });
    console.log("Transaction hash:", hash);
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Transaction receipt:", receipt);
}