 
 import { ethers } from "ethers";
 import { Ballot__factory, MyErc20Votes, MyErc20Votes__factory } from "../typechain-types";
 import * as dotenv from 'dotenv';
 //dotenv.config();
 require('dotenv').config();
 
 
 
 const VOTERS = ['0x8ab781088D9D97Aa7b48118964a3157c13a0cBEc', 
 '0x034CF18e2Ff18a5bEe003d46444D3F2743Ca7Ca8', 
 '0x8e241633b239865f971bb21604aBaAADdC34eb50', 
 '0x8ab781088D9D97Aa7b48118964a3157c13a0cBEc'];
 const ERC20Contract = "0xD47F9678A8FC7D0a52E2D8BA6FFC6553fe8d1A36";
 const blocksToAdd = 300;
 
 
 async function main() {
    // connecting to blockchain goerli
    console.log("Connecting to blockchain");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
    console.log(`Etherscan key is of length ${process.env.ALCHEMY_API_KEY?.length}`)
    const provider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY_API_KEY);
    console.log(`Using wallet address ${wallet.address}`);

    // getting my deployer balance
    const deployer = wallet.address;
    const signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`Balance of ${signer.address} is ${Number(balance) / 1e18} WEI`);

    // getting the proposal from command line
    const proposals = process.argv.slice(2);
    console.log("Proposals: ");
    proposals.forEach((element, index) => {
      console.log(`Proposal N. ${index + 1}: ${element}`);
    });

    // Deploying contract
    const contractFactoryBallot = new Ballot__factory(signer);
    console.log("Deploying Ballot contract...");
    const lastBlock = await provider.getBlock("latest");
    console.log(`The last block is ${lastBlock.number}`);
    // blocksToAdd = 300 about 75 minutes in the future
    // the time every voter has to delegate an address
    // or to self delegate
    const targetBlock = lastBlock.number + blocksToAdd;
    console.log(`Target block number is ${targetBlock}`);

    // adding the constructor args with target block
    const ballotContract = await contractFactoryBallot.deploy
    (proposals.map(ethers.utils.formatBytes32String), 
    ERC20Contract, targetBlock);
    const deployTxReceipt = await ballotContract.deployTransaction.wait()
    console.log(`The tokenized ballot contract contract was deployed at address 
    ${ballotContract.address} at the block ${deployTxReceipt.blockNumber}`);
};

main().catch((err) => {
    console.log(err);
    process.exitCode = 1;
});

/*
PS C:\Users\giopag81\Solidity\encode-week3> yarn run ts-node --files scripts\DeployBallot.ts "Water" "Whisky" "Rhum" "Beer" "Coke"
Connecting to blockchain
Etherscan key is of length 32
Using wallet address 0xFc4A978B4D7d3A931419d3d5cc0F7Efb408c8457
Balance of 0xFc4A978B4D7d3A931419d3d5cc0F7Efb408c8457 is 66.5981334369252 WEI
Proposals:
Proposal N. 1: Water
Proposal N. 2: Whisky
Proposal N. 3: Rhum
Proposal N. 4: Beer
Proposal N. 5: Coke
Deploying Ballot contract...
The last block is 9004700
The tokenized ballot contract contract was deployed at address
    0x31fef990CB2467E792b5908518a114a46453FdFA at the block 9004701
*/
