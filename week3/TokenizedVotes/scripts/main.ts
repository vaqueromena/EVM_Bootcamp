import { deployMyToken } from './DeployToken';
import { deployTokenizedBallot } from './DeployTokenizedBallot';
import { delegate } from './Delegate';
import { queryResults } from './QueryResults';
import { mint } from './MintVotingTokens';
import { castVote } from './CastVote';


async function main() {
    // await deployMyToken()
    // await deployTokenizedBallot('0x0134bced86d4b2b74ebbfa24508b9989736b859b');
    // await mint('0x10B5Ac15fF7836F3d5840Bf1BA9A9B5BFe73F79e', '2');//, Number(BigInt(0.1)));
    // await delegate('0x10B5Ac15fF7836F3d5840Bf1BA9A9B5BFe73F79e');
    await queryResults()
    // await castVote(1, "0.22");
}


main().catch((error: any) => {
    console.error(error);
    process.exitCode = 1;
}
);
