import { expect } from "chai";
import { ethers } from "hardhat";
import { MyERC20Votes__factory, MyERC20Votes, TokenizedBallot, TokenizedBallot__factory } from "../typechain-types";
import { BigNumber, Signer } from "ethers";
import { SignerWithAddress } from  "@nomiclabs/hardhat-ethers/signers"
import { beforeEach } from "mocha";
import { token } from "../typechain-types/@openzeppelin/contracts";

const PROPOSALS = ['Amalfi', 'Cannes', 'Brighton', 'Jersey Shore', 'Barcelona'];
const TARGET_BLOCK = 23;
const NUM_TOKENS_TO_MINT = 15;
const NUM_VOTES_TO_PLACE = 5;
const PROPOSAL_TO_VOTE_ON = 0;

function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
      bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
  }

describe("Tokenized Ballot", async () => {
    let ballotContract: TokenizedBallot;
    let token: MyERC20Votes;
    let deployer: SignerWithAddress;
    let acc1: SignerWithAddress;
    let acc2: SignerWithAddress;

  beforeEach(async () => {
    // get signers and deploy the token contract
    [deployer, acc1, acc2] = await ethers.getSigners();
    const tokenFactory = new MyERC20Votes__factory(deployer);
    token = await tokenFactory.deploy();
    await token.deployed();

    // deploy the tokenized ballot contract
    const ballotFactory = new TokenizedBallot__factory(deployer);
    const bytesProposals = convertStringArrayToBytes32(PROPOSALS);
    ballotContract = await ballotFactory.deploy(bytesProposals, token.address, TARGET_BLOCK); 
    await ballotContract.deployed();
  });

  describe("When the ballot contract is deployed", async () => {
    it("Each proposal starts with 0 votes", async () => {
        const numOfProposals = PROPOSALS.length
        for (let i=0; i<numOfProposals; i++) {
            const numVotes = (await ballotContract.proposals(i)).voteCount;
            expect(numVotes).to.eq(0);
        }
    });

    it("uses a valid ERC20 as payment token", async () => {
        const tokenAddress = await ballotContract.tokenContract();
        const tokenContractFactory = new MyERC20Votes__factory(deployer);
        const tokenContract = tokenContractFactory.attach(tokenAddress);
        expect(tokenContract.totalSupply()).not.to.be.reverted;
        await expect(tokenContract.balanceOf(deployer.address)).not.to.be.reverted;
        await expect(tokenContract.approve(acc1.address, 0)).not.to.be.reverted;
    });
  });

  describe("When a user is allocated a number of tokens", async () => {
    let tokenBalanceBeforeAllocation: BigNumber; 
    let totalSupplyBeforeAllocation: BigNumber; 

    beforeEach(async () => {
      tokenBalanceBeforeAllocation = await token.balanceOf(acc1.address);
      totalSupplyBeforeAllocation = await token.totalSupply();
      const minterRole = await token.MINTER_ROLE();
      const minterRoleTx = await token.connect(deployer).grantRole(minterRole, deployer.address);
      const minterRoleTxReceipt = await minterRoleTx.wait();
      const mintTx = await token.connect(deployer).mint(acc1.address, NUM_TOKENS_TO_MINT);
      const mintTxReceipt = await mintTx.wait();
    });

    it("The total supply increases appropriately", async () => {
      const totalSupplyAfterAllocation = await token.totalSupply();
      const totalSupplyDiff = totalSupplyAfterAllocation.sub(totalSupplyBeforeAllocation);
      expect(totalSupplyDiff).to.eq(NUM_TOKENS_TO_MINT);
    });

    it("The user has the right number of tokens but no votes", async () => {
      const numVotes = await token.getVotes(acc1.address);
      const numTokens = await token.balanceOf(acc1.address);
      expect(numVotes).to.eq(0);
      expect(numTokens).to.eq(NUM_TOKENS_TO_MINT);
    });

    describe("When a user delegates to themselves", async () => {
      let numVotesBeforeDelegation: BigNumber; 
      let proposalVotesBeforeVoting: BigNumber;

      beforeEach(async () => {
        numVotesBeforeDelegation = await token.getVotes(acc1.address);
        proposalVotesBeforeVoting = (await ballotContract.proposals(PROPOSAL_TO_VOTE_ON)).voteCount;
        const delegateTx = await token.connect(acc1).delegate(acc1.address);
        const delegateTxReceipt = await delegateTx.wait();
      });
  
      it("The number of votes updates correctly", async () => {
        const numVotesAfterDelegation = await token.getVotes(acc1.address);
        const numVotesDiff = numVotesAfterDelegation.sub(numVotesBeforeDelegation);
        expect(numVotesDiff).to.eq(NUM_TOKENS_TO_MINT);
      });
  
      it("The user is able to vote on a proposal", async () => {
        const voteTx = await ballotContract.connect(acc1).vote(PROPOSAL_TO_VOTE_ON, NUM_VOTES_TO_PLACE)
        const voteTxReceipt = await voteTx.wait();
        const proposalVotesAfterVoting = (await ballotContract.proposals(PROPOSAL_TO_VOTE_ON)).voteCount;
        const voteDiff = proposalVotesAfterVoting.sub(proposalVotesBeforeVoting);
        expect(voteDiff).to.eq(NUM_VOTES_TO_PLACE);
      });
    });

    describe("When a user sends tokens to another user", async () => {
        let numVotesAcc1BeforeSending: BigNumber; 
        let numVotesAcc2BeforeSending: BigNumber; 
        let numTokensAcc1BeforeSending: BigNumber;
        let numTokensAcc2BeforeSending: BigNumber;
        let proposalVotesBeforeVoting: BigNumber;

      beforeEach(async () => {
        numVotesAcc1BeforeSending = await token.getVotes(acc1.address);
        numVotesAcc2BeforeSending = await token.getVotes(acc2.address);
        numTokensAcc1BeforeSending = await token.balanceOf(acc1.address);
        numTokensAcc2BeforeSending = await token.balanceOf(acc2.address);
        const transferTx = await token.connect(acc1).transfer(acc2.address, NUM_TOKENS_TO_MINT);
        const transferTxReceipt = await transferTx.wait();
      });

      it("Each user has the correct number of votes and tokens", async () => {
        const numVotesAcc1AfterSending = await token.getVotes(acc1.address);
        const numVotesAcc2AfterSending = await token.getVotes(acc2.address);
        const numTokensAcc1AfterSending = await token.balanceOf(acc1.address);
        const numTokensAcc2AfterSending = await token.balanceOf(acc2.address);
        const tokenBalanceDiffAcc1 = numTokensAcc1BeforeSending.sub(numTokensAcc1AfterSending);
        const tokenBalanceDiffAcc2 = numTokensAcc2AfterSending.sub(numTokensAcc2BeforeSending);
        expect(tokenBalanceDiffAcc1).to.eq(NUM_TOKENS_TO_MINT);
        expect(tokenBalanceDiffAcc2).to.eq(NUM_TOKENS_TO_MINT);
        const voteDiffAcc1 = numVotesAcc1BeforeSending.sub(numVotesAcc1AfterSending);
        const voteDiffAcc2 = numVotesAcc2AfterSending.sub(numVotesAcc2BeforeSending);
        expect(voteDiffAcc1).to.eq(0);
        expect(voteDiffAcc2).to.eq(0);
      });
  
      it("Users cannot vote with tokens they have sent", async () => {
        expect(ballotContract.connect(acc1).vote(PROPOSAL_TO_VOTE_ON, NUM_VOTES_TO_PLACE)).to.be.reverted;
      });

      describe("When a token receiptant delegates to themselves", async () => {
        let numVotesBeforeDelegation: BigNumber; 
        let numPastVotesBeforeDelegation: BigNumber; 
        let proposalVotesBeforeVoting: BigNumber;
  
        beforeEach(async () => {
          numVotesBeforeDelegation = await token.getVotes(acc2.address);
          numPastVotesBeforeDelegation = await token.getPastVotes(acc2.address, TARGET_BLOCK);
          proposalVotesBeforeVoting = (await ballotContract.proposals(PROPOSAL_TO_VOTE_ON)).voteCount;
          const delegateTx = await token.connect(acc2).delegate(acc2.address);
          const delegateTxReceipt = await delegateTx.wait();
        });
    
        it("The number of current votes updates correctly", async () => {
          const numVotesAfterDelegation = await token.getVotes(acc2.address);
          const numVotesDiff = numVotesAfterDelegation.sub(numVotesBeforeDelegation);
          expect(numVotesDiff).to.eq(NUM_TOKENS_TO_MINT);
        });
    
        it("The number of past votes does not change", async () => {
            const numPastVotesAfterDelegation = await token.getPastVotes(acc2.address, TARGET_BLOCK);
            const numVotesDiff = numPastVotesAfterDelegation.sub(numPastVotesBeforeDelegation);
            expect(numVotesDiff).to.eq(0);
          });

        it("The user is not able to vote on a proposal", async () => {
          expect(ballotContract.connect(acc2).vote(PROPOSAL_TO_VOTE_ON, NUM_VOTES_TO_PLACE)).to.be.reverted;
        });
        
        describe("Winner is correct", async () => {
            let winnerCheck: String = "none";
            let mostVotes: BigNumber = BigNumber.from(0);
            it("Winner is correct", async () => {
              const winner = await ballotContract.winnerName();
              const winnerCheck = (await ballotContract.proposals(PROPOSAL_TO_VOTE_ON)).name
              expect(winner).to.eq(winnerCheck);
            });
          });
      });
    });
  });
});
