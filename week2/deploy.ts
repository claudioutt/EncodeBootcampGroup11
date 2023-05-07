import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot, Ballot__factory } from "../typechain-types";
import { extendConfig } from "hardhat/config";
import * as dotenv from 'dotenv';
dotenv.config()

const PROPOSALS = ["Roast Beef", "Frankfurter", "Risotto"];

const VOTERS = ['0xFc4A978B4D7d3A931419d3d5cc0F7Efb408c8457', 
'0x034CF18e2Ff18a5bEe003d46444D3F2743Ca7Ca8', 
'0x8e241633b239865f971bb21604aBaAADdC34eb50', 
'0x8ab781088D9D97Aa7b48118964a3157c13a0cBEc'];

const chairAddress = '0x75dE164aa2f83625def6257cC99d40C8C4f659d9'

function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
      bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
  }

async function main() {
    console.log("Connecting to blockchain");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
    console.log(`Using address ${chairAddress}`);
    console.log(`Alchemy key is of length ${process.env.ALCHEMY_API_KEY?.length}`)
    const provider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY_API_KEY);
    const lastBlock = await provider.getBlock("latest");
    console.log(`The last block is ${lastBlock.number}`)

    const signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`Wallet balance is ${Number(balance) / 1e18} ETH`); 

    console.log("Deploying Ballot contract");
    console.log("Proposals: ");
    PROPOSALS.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
    });

    let ballotContract: Ballot;
    const ballotFactory = new Ballot__factory(signer);
    ballotContract = await ballotFactory.deploy(convertStringArrayToBytes32(PROPOSALS));
    const deployTx = await ballotContract.deployTransaction.wait()
    console.log(`The ballot contract deployed at ${ballotContract.address} at block ${deployTx.blockNumber}`);

    for (let index = 0; index < VOTERS.length; index++) {
        const voter = VOTERS[index];
        console.log(`Giving right to vote to ${voter}`);
        const tx = await ballotContract.giveRightToVote(voter);
        const receipt = await tx.wait();
        console.log(`Tx hash is ${receipt.transactionHash} in block ${receipt.blockNumber}`);
    }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
