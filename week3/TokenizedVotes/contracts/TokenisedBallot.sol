// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface IMyToken {
    function getPastVotes(address account, uint256 blockNumber) external view returns (uint256);
    function delegates(address account) external view returns (address);
}

contract TokenizedBallot {
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    IMyToken public tokenContract;
    Proposal[] public proposals;
    uint256 public targetBlockNumber;

    mapping(address => uint256) public spentVotingPower;

    constructor(
        bytes32[] memory _proposalNames,
        address _tokenContract,
        uint256 _targetBlockNumber
    ) {
        require(block.number > _targetBlockNumber, "Target block number should be in the past");
        tokenContract = IMyToken(_tokenContract);
        targetBlockNumber = _targetBlockNumber;

        for (uint i = 0; i < _proposalNames.length; i++) {
            proposals.push(Proposal({name: _proposalNames[i], voteCount: 0}));
        }
    }

    function vote(uint256 proposal, uint256 amount) external {
        require(tokenContract.delegates(msg.sender) == msg.sender,"You must self-delegate your tokens first");
        require(getRemainingVotingPower(msg.sender) >= amount, "Not enough voting power");

        spentVotingPower[msg.sender] += amount;
        proposals[proposal].voteCount += amount;
    }
    
    function getRemainingVotingPower(address voter) public view returns (uint256 votePower_) {
        votePower_ = tokenContract.getPastVotes(voter, targetBlockNumber) - spentVotingPower[voter];
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }

    function proposalVotes(uint256 proposalIndex) external view returns (uint256) {
        require(proposalIndex < proposals.length, "Invalid proposal index");
        return proposals[proposalIndex].voteCount;
    }

    function proposalCount() external view returns (uint256) {
        return proposals.length;
    }
}