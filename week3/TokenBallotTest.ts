import { expect } from "chai";
import { ethers } from "hardhat";
import { TokenizedBallot, TokenizedBallot__factory, MyERC20Votes, MyERC20Votes__factory } from "../typechain-types";
import { BigNumber } from "ethers";
import * as dotenv from 'dotenv';
dotenv.config()

const PROPOSALS = ['Amalfi', 'Cannes', 'Brighton', 'Jersey Shore', 'Barcelona'];

const VOTERS = ['0xFc4A978B4D7d3A931419d3d5cc0F7Efb408c8457', 
'0x034CF18e2Ff18a5bEe003d46444D3F2743Ca7Ca8', 
'0x8e241633b239865f971bb21604aBaAADdC34eb50', 
'0x8ab781088D9D97Aa7b48118964a3157c13a0cBEc',
'0x75dE164aa2f83625def6257cC99d40C8C4f659d9'];

const chairAddress = '0x75dE164aa2f83625def6257cC99d40C8C4f659d9'
const blockOffset: number = 100;
const TOTAL_NUM_TOKENS_TO_MINT = 100;


function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
      bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
  }

async function main() {

    let ballotContract: TokenizedBallot;
    let token: MyERC20Votes;
    let targetBlock: Number;

    console.log("Connecting to blockchain");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
    console.log(`Using address ${chairAddress}`);
    console.log(`Alchemy key is of length ${process.env.ALCHEMY_API_KEY?.length}`)
    const provider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY_API_KEY);
    const lastBlock = await provider.getBlock("latest");
    console.log(`The last block is ${lastBlock.number}`)
    targetBlock = lastBlock.number + blockOffset;
    console.log(`The ballot will end at block number ${targetBlock}`)

    const signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`Wallet balance is ${Number(balance) / 1e18} ETH`); 
    console.log("\n")
    console.log("Deploying Ballot contract");
    console.log("Proposals: ");
    PROPOSALS.forEach((element, index) => {
        console.log(`Proposal N. ${index + 1}: ${element}`);
    });
    console.log("\n")

    const tokenFactory = new MyERC20Votes__factory(signer);
    token = await tokenFactory.deploy();
    await token.deployed();
    const deployTokenTx = token.deployTransaction;
    console.log(`The token deployed at ${token.address} at block ${deployTokenTx.blockNumber}`);
    const ballotFactory = new TokenizedBallot__factory(signer);
    const bytesProposals = convertStringArrayToBytes32(PROPOSALS);
    ballotContract = await ballotFactory.deploy(bytesProposals, token.address, BigNumber.from(targetBlock)); 
    await ballotContract.deployed();
    const deployTx = ballotContract.deployTransaction;
    console.log(`The ballot contract deployed at ${ballotContract.address} at block ${deployTx.blockNumber}`);

    const minterRole = await token.MINTER_ROLE();
    const minterRoleTx = await token.connect(signer).grantRole(minterRole, signer.address);
    const minterRoleTxReceipt = await minterRoleTx.wait();
    console.log(`Minter role assigned at block ${minterRoleTxReceipt.blockNumber}`);
    
    const token_allocation = TOTAL_NUM_TOKENS_TO_MINT / VOTERS.length;
    for (let index = 0; index < VOTERS.length; index++) {
        const voter = VOTERS[index];
        console.log(`Minting ${token_allocation} tokens for voter ${voter}`);
        const mintTx = await token.connect(signer).mint(voter, token_allocation);
        const mintTxReceipt = await mintTx.wait();
        console.log(`Minting hash is ${mintTxReceipt.transactionHash} in block ${mintTxReceipt.blockNumber}`);
        console.log("\n");
    }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
