import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot, Ballot__factory } from "../typechain-types";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

describe("Ballot", function () {
  let ballotContract: Ballot;

  beforeEach(async function () {
    const ballotFactory = await ethers.getContractFactory("Ballot");
    ballotContract = await ballotFactory.deploy(
      convertStringArrayToBytes32(PROPOSALS)
    );
    await ballotContract.deployed();
  });

  describe("when the contract is deployed", function () {
    it("has the provided proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(
          PROPOSALS[index]
        );
      }
    });

    it("has zero votes for all proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.voteCount).to.eq(0);
      }
    });

    
    it("sets the deployer address as chairperson", async function () {
      const accounts = await ethers.getSigners();
    // https://docs.ethers.io/v5/api/contract/contract/#Contract-functionsCall
      const chairperson = await ballotContract.chairperson();
    // https://www.chaijs.com/api/bdd/#method_equal
      expect(chairperson).to.equal(accounts[0].address);
    });

    it("sets the voting weight for the chairperson as 1", async function () {
      // he talkes account 0 from signer
      const chairperson = await ballotContract.chairperson();
      expect((await ballotContract.voters(chairperson)).weight).eq(1)
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
    it("gives right to vote for another address", async function () {
      const accounts = await ethers.getSigners();
      const voter = accounts[1];
      const chairperson = accounts[0];
      await expect(
        ballotContract
          .connect(chairperson)
          .giveRightToVote(accounts[1].address)
      ).to.be.ok;
    }); 

 
    it("can not give right to vote for someone that has voted", async function () {
      const [chairperson, voter1] = await ethers.getSigners();
      // give right to vote to voter 1
      ballotContract.connect(chairperson).giveRightToVote(voter1.address)   
      // Cast a vote
      await ballotContract.connect(voter1).vote(1);
      // Try to give the right to vote again
      await expect(
        ballotContract.connect(chairperson).giveRightToVote(voter1.address)
      ).to.be.revertedWith("The voter already voted.");
    });
  

    it("can not give right to vote for someone that has already voting rights", async function () {
      const [chairperson, voter1] = await ethers.getSigners();
      
      // give right to vote to voter 1
      ballotContract.connect(chairperson)
          .giveRightToVote(voter1.address);

      // it can't give right to vote again to voter1
      await expect(
        ballotContract
          .connect(chairperson)
          .giveRightToVote(voter1.address)
      ).to.be.reverted;
    });
  });

  describe("when the voter interact with the vote function in the contract", function () {
    // TODO
    it("should register the vote", async () => {
      const [chairperson, voter1] = await ethers.getSigners();
      // give right to vote to voter 1

      await ballotContract.connect(chairperson)
          .giveRightToVote(voter1.address);

      // Cast a vote
      await ballotContract.connect(voter1).vote(1);
      const voteCount = (await ballotContract.proposals(1)).voteCount;
      const voterWeight = (await ballotContract.voters(voter1.address)).weight;      
      expect(voteCount).to.eq(voterWeight);
      });
    });
    

  describe("when the voter interact with the delegate function in the contract", function () {
    // TODO
    it("should transfer voting power", async () => {
      const [chairperson, voter1] = await ethers.getSigners();  
        // give rith to vote to voter2, otherwise
        // voter2 can't vote
        await ballotContract.connect(chairperson)
            .giveRightToVote(voter1.address);
        // chairperson delegate to voter1
        await expect(ballotContract.connect(chairperson)
        .delegate(voter1.address)).to.be.ok; 
  });
});

  describe("when the an attacker interact with the giveRightToVote function in the contract", function () {
    // TODO
    it("should revert", async () => {
      const [chairperson, attacker] = await ethers.getSigners();
      "Only chairperson can give right to vote."
      await expect (ballotContract.connect(attacker)
      .giveRightToVote(chairperson.address)).to.be.revertedWith(
        "Only chairperson can give right to vote.");
    });
  });

  describe("when the an attacker interact with the vote function in the contract", function () {
    // TODO
    it("should revert", async () => {
      const [chairperson, attacker] = await ethers.getSigners();
      "Only chairperson can give right to vote."
      await expect (ballotContract.connect(attacker).vote(1)).
      to.be.revertedWith("Has no right to vote");
      
    });
  });

  describe("when the an attacker interact with the delegate function in the contract", function () {
    // TODO
    it("should revert", async () => {
      const [chairperson, attacker, attacker2] = await ethers.getSigners();
      await expect (ballotContract.connect(attacker)
      .delegate(attacker2.address)).
      to.be.revertedWith("You have no right to vote");
    });
  });

  describe("when someone interact with the winningProposal function before any votes are cast", function () {
    // TODO
    it("should return 0", async () => {
      const accounts = await ethers.getSigners();
      const chairman = accounts[0];
      expect(await ballotContract.connect(chairman)
        .winningProposal()).to.eq(0);
    });
  });

  describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", function () {
    // TODO
    it("should return 0", async () => {
      const [chairman, voter] = await ethers.getSigners();
      //Chairperson gives right to vote to voter
      await ballotContract.connect(chairman).
      giveRightToVote(voter.address);
      // voter vote proposal number 0
      await ballotContract.connect(voter).vote(0);
      await expect (await ballotContract.connect(chairman)
      .winningProposal()).to.eq(0);
  });
});

  describe("when someone interact with the winnerName function before any votes are cast", function () {
    // TODO
    it("should return name of proposal 0", async () => {
      const accounts = await ethers.getSigners();
      const chairman = accounts[0];
      // convert Proposal 1 string to its byte32 version
      const prop0Byte32 = ethers.utils.formatBytes32String("Proposal 1");
      expect (await ballotContract.connect(chairman)
      .winnerName()).to.be.eq(prop0Byte32);
    });
  });

  describe("when someone interact with the winnerName function after one vote is cast for the first proposal", function () {
    // TODO
    it("should return name of proposal 0", async () => {
      const accounts = await ethers.getSigners();
      const chairman = accounts[0];
      // chairman votes for "Proposal 1"
      await ballotContract.connect(chairman).vote(0);
      // convert Proposal 1 string to its byte32 version
      const prop0Byte32 = ethers.utils.formatBytes32String("Proposal 1");
      expect (await ballotContract.connect(chairman)
      .winnerName()).to.be.eq(prop0Byte32);//
    });
  });

  describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {
    // TODO
    it("should return the name of the winner proposal", async () => {
      const accounts = await ethers.getSigners();
      const chairperson = accounts[0];
      const voteCounts = new Array(PROPOSALS.length).fill(0);
      console.log(voteCounts);
      var winningCount = 0;
      var winner = 0;
      const numVoters = 5;
      for (let index = 0; index <= numVoters; index++) {
        if (index >0) {
          await ballotContract.connect(chairperson).
          giveRightToVote(accounts[index].address);
        }
        const randProposal = PROPOSALS[Math.floor(Math.random() 
          * PROPOSALS.length)];   
        const randProposalIndex = PROPOSALS.indexOf(randProposal);
        voteCounts[randProposalIndex]++;
        await ballotContract.connect(accounts[index]).vote(randProposalIndex);
        if (voteCounts[randProposalIndex] > winningCount) {
          winningCount = voteCounts[randProposalIndex];
          winner = randProposalIndex;
        }
        console.log("vote count is: " +  voteCounts);
      }  
      console.log("The winner is: " + PROPOSALS[winner]);
      const propWinnerByte32 = ethers.utils.formatBytes32String(PROPOSALS[winner]);
      expect (await ballotContract.connect(chairperson)
      .winnerName()).to.be.eq(propWinnerByte32);
    });
  });
});
