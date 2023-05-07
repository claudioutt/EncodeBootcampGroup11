import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";
import { extendConfig } from "hardhat/config";

const PROPOSALS = ["Roast Beef", "Frankfurter", "Risotto"];

const VOTERS = ['0xFc4A978B4D7d3A931419d3d5cc0F7Efb408c8457', 
'0x034CF18e2Ff18a5bEe003d46444D3F2743Ca7Ca8', 
'0x8e241633b239865f971bb21604aBaAADdC34eb50', 
'0x8ab781088D9D97Aa7b48118964a3157c13a0cBEc'];

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
      const chairperson = await ballotContract.chairperson();
      expect(chairperson).to.eq(await ballotContract.signer.getAddress())
    });

    it("sets the voting weight for the chairperson as 1", async function () {
      const chairperson = await ballotContract.chairperson();
      const chairperson_voter = await ballotContract.voters(String(chairperson));
      expect(chairperson_voter.weight).to.eq(1);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
    it("gives right to vote for another address", async function () {
        for (let index = 0; index < VOTERS.length; index++) {
            const voter = VOTERS[index];
            const voter_obj_pre = await ballotContract.voters(voter);
            expect(voter_obj_pre.weight).to.eq(0);
            const tx = await ballotContract.giveRightToVote(voter);
            const receipt = await tx.wait();

            const voter_obj = await ballotContract.voters(voter);
            expect(voter_obj.weight).to.eq(1);
            }
    });

    it("can not give right to vote for someone that has already voting rights", async function () {
      const tx = await ballotContract.giveRightToVote(VOTERS[0]);
      const receipt = await tx.wait();
      expect(receipt.status).to.eq(1);

      await expect(ballotContract.giveRightToVote(VOTERS[0])).to.be.reverted;
    });

    it("can not give right to vote for someone that has voted", async function () {
      const vote_tx = await ballotContract.vote(1);
      const vote_receipt = await vote_tx.wait();
      expect(vote_receipt.status).to.eq(1);

      const chairperson = await ballotContract.chairperson();
      await expect(ballotContract.giveRightToVote(String(chairperson))).to.be.reverted;
    });
  });
});
