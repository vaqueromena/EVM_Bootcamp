import {
  createPublicClient, http, createWalletClient,
  formatEther, toHex, compactSignatureToHex,
  hexToString, Hex, WalletClient
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import inquirer from "inquirer";

dotenv.config();

class Constants {
  static readonly providerApiKey = process.env.ALCHEMY_API_KEY || "";
  static readonly deployerPrivateKey = process.env.PRIVATE_KEY || "";
  static readonly deployerPrivateKeySecondWallet = process.env.PRIVATE_KEY_SECOND || "";
}

// walletc1: 0x10B5Ac15fF7836F3d5840Bf1BA9A9B5BFe73F79e
// wallet 2: 0x20184BEF64B772E540b2Ac134ad04F70c06359Cc

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];
enum Actions {
  DEPLOY = 'deploy',
  REGISTER = 'register',
  CHECK_CHAIRPERSON = 'checkChairperson',
  VOTE = 'vote',
  CHECK_RESULTS = 'checkResults',
  EXIT = 'exit'
}

enum StorageKeys {
  CONTRACT_ADDRESS = 'CONTRACT_ADDRESS',
  PRIMISES = 'PRIMISES',
  WALLET_INDEX = 'WALLET_INDEX',
}

type VoteTuple = [string, number];

class ResultStorage {
  private results: { [ket: string]: any } = {};

  publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${Constants.providerApiKey}`),
  });

  setResult(key: string, value: any) {
    this.results[key] = value;
  }

  getResult(key: string): any {
    return this.results[key];
  }

  clearResults(): void {
    this.results = {};
  }
}

const storage = new ResultStorage();

// storage.setResult(StorageKeys.CONTRACT_ADDRESS, '0x42a752b0a9e6bd6690dc1bda3cd499a22e71e6ad');


async function mainMenu() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Your action:',
      choices: [
        { name: 'Select wallet', value: 'select_wallet' },
        { name: 'Deploy contract', value: 'deploy' },
        { name: 'Register contract', value: 'register' },
        { name: 'Vote', value: 'vote' },
        { name: 'Delegate votes', value: 'delegate' },
        { name: 'Give voting rights', value: 'give_voting_rights' },
        { name: 'Check results', value: 'checkResults' },
        { name: 'Exit', value: 'exit' },
      ],
    },
  ]);

  switch (answers.action) {
    case 'select_wallet':
      await selectWalletAction();
      break;
    case 'deploy':
      await deployAction();
      break;
    case 'register':
      await registerAction();
      break;
    case 'checkChairperson':
      console.log('Action: check Chairperson');
      break;
    case 'vote':
      await voteAction();
      break;
    case 'checkResults':
      await checkResultsAction();
      break;
    case 'delegate':
      await delegateAction();
      break;
    case 'give_voting_rights':
      await giveVotingRightsAction();
      break;
    case 'exit':
      console.log('Action: exit');
      process.exit(0);
    default:
      console.log('Unknown action');
  }

  // Repeat the main menu
  console.log(`---------------------------------------------------\n\n`);
  mainMenu();
}

// ACTIONS

async function selectWalletAction() {
  const walletIndex = await inquirer.prompt([
    {
      type: 'input',
      name: 'index',
      message: 'Enter wallet index (0 / 1):',
    },
  ]);
  if (walletIndex.index === '0' || walletIndex.index === '1') {
    storage.setResult(StorageKeys.WALLET_INDEX, walletIndex.index);
  }
  else {
    console.log('Invalid wallet index');
  }
}

async function deployAction(): Promise<void> {
  console.log('-----Action: deploy');
  const contractAddress = await deployContract(PROPOSALS);
  console.log('_Contract address:', contractAddress);
  storage.setResult(StorageKeys.CONTRACT_ADDRESS, contractAddress);
}

async function voteAction(): Promise<void> {
  console.log('-----Action: vote');
  await printProposalList()
  const votedProposal = await inquirer.prompt([
    {
      type: 'input',
      name: 'index',
      message: 'Enter proposal index:',
      // default: storage.getResult(StorageKeys.CONTRACT_ADDRESS),
    },
  ]);
  console.log(`_Voted proposal index: ${votedProposal.index}`);
  await vote(Number(votedProposal.index));
  // const contractAddress = storage.getResult(StorageKeys.CONTRACT_ADDRESS);
}

async function registerAction(): Promise<void> {
  console.log('-----Action: register contract');

  const contractAddressInput = await inquirer.prompt([
    {
      type: 'input',
      name: 'contractAddress',
      message: 'Enter contract address:',
      default: storage.getResult(StorageKeys.CONTRACT_ADDRESS),
    },
  ]);
  registerContract(contractAddressInput.contractAddress);
}

async function checkResultsAction(): Promise<void> {
  console.log('-----Action: checkResults');
  await printProposalList();
}

async function delegateAction(): Promise<void> {
  console.log('-----Action: delegate');
  const input = await inquirer.prompt([
    {
      type: 'input',
      name: 'address',
      message: 'Enter delegate address:',
      // default: storage.getResult(StorageKeys.CONTRACT_ADDRESS),
    },
  ]);
  console.log(`_Delegated to address: ${input.address}`);
  await delegateTo(input.address);
}

async function giveVotingRightsAction(): Promise<void> {
  console.log('-----Action: giveVotingRights');
  
  const input = await inquirer.prompt([
    {
      type: 'input',
      name: 'address',
      message: 'Enter address:',
      // default: storage.getResult(StorageKeys.CONTRACT_ADDRESS),
    },
  ]);
  console.log(`_Delegated to address: ${input.address}`);
  await giveRightsToVote(input.address)
}

// async function main() {
//   const proposals = process.argv.slice(2);
//   if (!proposals || proposals.length < 1)
//     throw new Error("Proposals not provided");
//   const publicClient = storage.publicClient;
//   const blockNumber = await publicClient.getBlockNumber();
//   console.log("Last block number:", blockNumber);

//   const account = privateKeyToAccount(`0x${Constants.deployerPrivateKey}`);
//   const deployer = createWalletClient({
//     account,
//     chain: sepolia,
//     transport: http(`https://eth-sepolia.g.alchemy.com/v2/${Constants.providerApiKey}`),
//   });
//   console.log("Deployer address:", deployer.account.address);
//   const balance = await publicClient.getBalance({
//     address: deployer.account.address,
//   });
//   console.log(
//     "Deployer balance:",
//     formatEther(balance),
//     deployer.chain.nativeCurrency.symbol
//   );

//   const hash = await deployer.deployContract({
//     abi,
//     bytecode: bytecode as `0x${string}`,
//     args: [proposals.map((prop) => toHex(prop, { size: 32 }))],
//   });
//   console.log("Transaction hash:", hash);
//   console.log("Waiting for confirmations...");
//   const receipt = await publicClient.waitForTransactionReceipt({ hash });
//   console.log("Ballot contract deployed to:", receipt.contractAddress);
// }

function createClient(walletHex: Hex): WalletClient {
  const account = privateKeyToAccount(walletHex);
  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${Constants.providerApiKey}`),
  });
  return client;
}

async function deployContract(proposals: string[]): Promise<string> {

  // const account = privateKeyToAccount(`0x${Constants.deployerPrivateKey}`);
  const deployer = createClient(`0x${getWalletPrivateKey()}`)
  //  createWalletClient({
  //   account,
  //   chain: sepolia,
  //   transport: http(`https://eth-sepolia.g.alchemy.com/v2/${Constants.providerApiKey}`),
  // });
  // console.log("Deployer address:", deployer.account.address);
  const updatedProposals = proposals.map((prop, index) => prop += `${index ** 3}`);
  console.log(`---------------------------------------------------`);
  console.log("updated Proposals:", updatedProposals);
  const hash = await deployer.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
    args: [updatedProposals.map((prop) => toHex(prop, { size: 32 }))],
  });
  console.log(`---------------------------------------------------`);
  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmations...");
  const receipt = await storage.publicClient.waitForTransactionReceipt({ hash });
  console.log("Ballot contract deployed to:", receipt.contractAddress);
  if (!receipt.contractAddress) {
    throw new Error("Contract address is undefined");
  }
  return receipt.contractAddress;
}

async function registerContract(contractAddress: string): Promise<void> {
  console.log('getProposalList');
  console.log(`StorageKeys.CONTRACT_ADDRESS = ${contractAddress}`);

  storage.setResult(StorageKeys.CONTRACT_ADDRESS, contractAddress);
  console.log(`_Registered contract: ${contractAddress}`);
}

async function vote(index: number): Promise<void> {
  const wallet = createClient(`0x${getWalletPrivateKey()}`);
  const contractAddress = storage.getResult(StorageKeys.CONTRACT_ADDRESS)
  try {
    const hash = await wallet.writeContract({
      address: contractAddress,
      abi,
      functionName: "vote",
      args: [BigInt(index)],
    });

    console.log(`_Transaction hash: ${hash}`);
    const receipt = await storage.publicClient.waitForTransactionReceipt({ hash });
    console.log(`_Transaction receipt status: ${receipt.status}`);
  }
  catch (error) {
    console.error(`_vote Error: ${error}`);
  }
}

async function giveRightsToVote(giveRightsTo: string): Promise<void> {
  const wallet = createClient(`0x${getWalletPrivateKey()}`);
  const contractAddress = storage.getResult(StorageKeys.CONTRACT_ADDRESS)
  try {
    const hash = await wallet.writeContract({
      address: contractAddress,
      abi,
      functionName: "giveRightToVote",
      args: [giveRightsTo],
    });

    console.log(`_Transaction hash: ${hash}`);
    const receipt = await storage.publicClient.waitForTransactionReceipt({ hash });
    console.log(`_Transaction receipt status: ${receipt.status}`);
  }
  catch (error) {
    console.error(`_giveRightsToVote Error: ${error}`);
  }
}

async function delegateTo(delegateTo: string): Promise<void> {
  const wallet = createClient(`0x${getWalletPrivateKey()}`);
  const contractAddress = storage.getResult(StorageKeys.CONTRACT_ADDRESS)
  try {
    const hash = await wallet.writeContract({
      address: contractAddress,
      abi,
      functionName: "delegate",
      args: [delegateTo],
    });

    console.log(`_Transaction hash: ${hash}`);
    const receipt = await storage.publicClient.waitForTransactionReceipt({ hash });
    console.log(`_Transaction receipt status: ${receipt.status}`);
  }
  catch (error) {
    console.error(`_delegateTo Error: ${error}`);
  }
}


function getWalletPrivateKey(): string {
  const walletIndex = storage.getResult(StorageKeys.WALLET_INDEX);
  if (walletIndex === '0' || walletIndex === undefined) {
    return Constants.deployerPrivateKey;
  } else if (walletIndex === '1') {
    return Constants.deployerPrivateKeySecondWallet;
  } else {
    throw new Error('Invalid wallet index');
  }
}

async function printProposalList(): Promise<void> {
  const proposals = await getProposalList();
  console.log(`---------------------------------------------------`);
  for (let index = 0; index < proposals.length; index++) {
    console.log(`Proposal # ${index}: name : ${proposals[index][0]} voteCount: ${proposals[index][1]}`);
  }
}

async function getProposalList(): Promise<VoteTuple[]> {
  const contractAddress = storage.getResult(StorageKeys.CONTRACT_ADDRESS)

  const f = await storage.publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "chairperson",
  });
  var proposals = [];
  for (let index = 0; index < PROPOSALS.length; index++) {
    const f = await storage.publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "proposals",
      args: [index],
    });
    let name = hexToString(f[0], { size: 32 });
    let voteCount = f[1];
    // proposals.push((hexToString(f[0], { size: 32 }), f[1]));
    const voteData: VoteTuple = [name, voteCount];
    proposals.push(voteData);
  }
  console.log(`---------------------------------------------------`);
  console.log(`proposals: voteCount = ${proposals}`);
  console.log(`proposals list: = ${proposals.map((tuple) => tuple[0])}`);

  return proposals;
}


mainMenu().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});