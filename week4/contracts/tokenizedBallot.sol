// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
import "./MyERC20Votes.sol"; 
import "./Potato.sol";
//interface IMyVotingToken {
//   function getPastVotes(address, uint256) external view returns (uint256);


contract Ballot {
    
    struct Proposal {
        bytes32 name;   
        uint voteCount; 
    }

    //IMyVotingToken public tokenContract;
    MyERC20Votes public ERC20Token;
    uint256 public targetBlockNumber;
    Proposal[] public proposals;
    uint256 public constant ETH_TOKEN_EXCHANGE_RATE = 100;
    uint256 public constant VOTE_RATIO = 10**16;


    mapping(address => uint256) public votingPowerSpent;

    
    constructor(
        bytes32[] memory proposalNames, 
        address _ERC20Token, 
        uint256 _targetBlocknumber) 
        {
        targetBlockNumber = _targetBlocknumber;
        ERC20Token = MyERC20Votes(_ERC20Token);

        for (uint i = 0; i < proposalNames.length; i++) {           
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    function buyVotingTokens() external payable {
        ERC20Token.mint(msg.sender, msg.value * ETH_TOKEN_EXCHANGE_RATE);
    }

  
    
    function vote(uint proposal, uint256 amountToVote) external { 
        // TODO: compute the voting power
        uint256 delegatedAmount = amountToVote / VOTE_RATIO;
        require(
            votingPower(msg.sender) >= delegatedAmount
        );

        votingPowerSpent[msg.sender] += amountToVote;
        proposals[proposal].voteCount += amountToVote;
    }

    function votingPower(address account) public 
    view returns (uint256 votingPower_) {
        //VOTE_DIVIDEND;
        votingPower_ = 
        (ERC20Token.getPastVotes(account, targetBlockNumber) 
        - votingPowerSpent[account]) / VOTE_RATIO;
    }
    
    function winningProposal() public view
            returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }


    function winnerName() external view
            returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }
}
