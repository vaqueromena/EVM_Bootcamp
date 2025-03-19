import { expect } from "chai";
import { toHex, hexToString } from "viem";
import { viem } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function deployContract() {
    const publicClient = await viem.getPublicClient();
    const [deployer, otherAccount] = await viem.getWalletClients();
    const ballotContract = await viem.deployContract("Ballot", [
    PROPOSALS.map((prop) => toHex(prop, { size: 32 })),
]);
return { ballotContract, deployer, otherAccount };
}

describe("Ballot", async () => {
  describe("when the contract is deployed", async () => {
    it("has the provided proposals", async () => {
        const {ballotContract, deployer, otherAccount} = await loadFixture(deployContract);
        const proposals0 = await await ballotContract.read.proposals([0n]);
        expect(hexToString(proposals0[0], { size: 32 })).to.equal(PROPOSALS[0]);
        // expect(chairperson.toLowerCase()).to.equal(deployer.account.address.toLowerCase());
        console.log(proposals0);
    });

    it("has zero votes for all proposals", async () => {
      // TODO
      throw Error("Not implemented");
    });

    it("sets the deployer address as chairperson", async () => {
        const {ballotContract, deployer, otherAccount} = await loadFixture(deployContract);
        console.log(deployer.account.address);
          const chairperson = await await ballotContract.read.chairperson();
        expect(chairperson.toLowerCase()).to.equal(deployer.account.address.toLowerCase());
        console.log(chairperson);
    });
    it("sets the voting weight for the chairperson as 1", async () => {
      // TODO
      throw Error("Not implemented");
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", async () => {
    it("gives right to vote for another address", async () => {
      const { ballotContract, deployer, otherAccount } = await loadFixture(deployContract);
      await ballotContract.write.giveRightToVote([otherAccount.account.address]);
      const otherVoterPower = await ballotContract.read.voters([otherAccount.account.address]);
      expect(otherVoterPower[0]).to.eq(1n);
    });
    it("can not give right to vote for someone that has voted", async () => {
      const { ballotContract, deployer } = await loadFixture(deployContract);
      await  ballotContract.write.vote([2n]);
      const voterPower = await ballotContract.read.voters([deployer.account.address]);
      
      expect(voterPower[1]).to.eq(true);
      await expect(ballotContract.write.giveRightToVote([deployer.account.address]))
      .to.be.rejected;
      
    });
    it("can not give right to vote for someone that has already voting rights", async () => {
      // TODO
      throw Error("Not implemented");
    });
  });

  describe("when the voter interacts with the vote function in the contract", async () => {
    it("should register the vote", async () => {
      throw Error("Not implemented");
      // // NOTE: using 'otherAccount', could do the same with the owner
      // const { otherAccount, ballotContract } = await loadFixture(deployContract);
      // await ballotContract.write.giveRightToVote([otherAccount.account.address]);
      // await ballotContract.write.vote([BigInt(0)], {"account": otherAccount.account});
      // const otherVoter = await ballotContract.read.voters([otherAccount.account.address]);
      // expect(otherVoter[0]).to.eq(1n);        // weight
      // expect(otherVoter[1]).to.eq(true);      // voted
      // expect(otherVoter[3]).to.eq(BigInt(0)); // vote
    });
  });

  describe("when the voter interacts with the delegate function in the contract", async () => {
    // TODO
    it("should transfer voting power", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when an account other than the chairperson interacts with the giveRightToVote function in the contract", async () => {
    // TODO
    it("should revert", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when an account without right to vote interacts with the vote function in the contract", async () => {
    // TODO
    it("should revert", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when an account without right to vote interacts with the delegate function in the contract", async () => {
    // TODO
    it("should revert", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when someone interacts with the winningProposal function before any votes are cast", async () => {
    // TODO
    it("should return 0", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when someone interacts with the winningProposal function after one vote is cast for the first proposal", async () => {
    // TODO
    it("should return 0", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when someone interacts with the winnerName function before any votes are cast", async () => {
    // TODO
    it("should return name of proposal 0", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when someone interacts with the winnerName function after one vote is cast for the first proposal", async () => {
    // TODO
    it("should return name of proposal 0", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when someone interacts with the winningProposal function and winnerName after 5 random votes are cast for the proposals", async () => {
    // TODO
    it("should return the name of the winner proposal", async () => {
      throw Error("Not implemented");
    });
  });
});