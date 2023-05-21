import { ethers } from "ethers";
 import { Ballot__factory, MyERC20Votes, MyERC20Votes__factory } from "../typechain-types";
 import * as dotenv from 'dotenv';
 //dotenv.config();
 require('dotenv').config();
 

 
 const ERC20ContractAddress = "0x8C344075F9F48042a465a812Bb80fA649786b4D6";
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
    // blocksToAdd = 300 75 minutes in the future
    const targetBlock = lastBlock.number + blocksToAdd;
    console.log(`Target block number is ${targetBlock}`);


    // adding the constructor args with target block
    const ballotContract = await contractFactoryBallot.deploy
    (proposals.map(ethers.utils.formatBytes32String), 
    ERC20ContractAddress, targetBlock);
    const deployTxReceipt = await ballotContract.deployTransaction.wait()
    console.log(`The tokenized ballot contract was deployed at address 
    ${ballotContract.address} at the block ${deployTxReceipt.blockNumber}`);

    // granting minter role to my tokenized ballot contract
    const ERC20ContractFactory  = new MyERC20Votes__factory(signer);
    const ERC20Contract =  ERC20ContractFactory.attach(ERC20ContractAddress);
    const MINTER_ROLE = ERC20Contract.MINTER_ROLE();
    const roleTX = await ERC20Contract.grantRole(
        MINTER_ROLE,
        ballotContract.address
      );
    };


main().catch((err) => {
    console.log(err);
    process.exitCode = 1;
});

/*
PS C:\Users\giopag81\Solidity\encode-week3> yarn run ts-node --files scripts\DeployBallot2.0.ts "Surf" "Climb" "Sail" "Snowboard" "Kayak"
Connecting to blockchain
Etherscan key is of length 32
Using wallet address 0xFc4A978B4D7d3A931419d3d5cc0F7Efb408c8457
Balance of 0xFc4A978B4D7d3A931419d3d5cc0F7Efb408c8457 is 63.61739418142501 WEI
Proposals:
Proposal N. 1: Surf
Proposal N. 2: Climb
Proposal N. 3: Sail
Proposal N. 4: Snowboard
Proposal N. 5: Kayak
Deploying Ballot contract...
The last block is 9039407
Target block number is 9039707
The tokenized ballot contract was deployed at address
    0x4Fde4cfa468c6B155916Af85F79bB3818B4b0B35 at the block 9039408
  */
