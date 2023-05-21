import { BigNumber, ethers } from "ethers";
import { Ballot__factory, MyERC20Votes, MyERC20Votes__factory } from "../typechain-types";
import * as dotenv from 'dotenv';
//dotenv.config();
require('dotenv').config();




async function main() {
    // connecting to blockchain goerli
    console.log("Connecting to blockchain");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
    console.log(`Etherscan key is of length ${process.env.ALCHEMY_API_KEY?.length}`)
    const provider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY_API_KEY);
    const lastBlock = await provider.getBlock("latest");
    console.log(`The last block is ${lastBlock.number}`)
    console.log(`Using wallet address ${wallet.address}`);

    // getting my deployer balance
    const deployer = wallet.address;
    const signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`Balance of ${signer.address} is ${Number(balance) / 1e18} WEI`);

    // Deploying the token contract 
    let tokenContract: MyERC20Votes;
    const tokenFactory = new MyERC20Votes__factory(signer);
    tokenContract = await tokenFactory.deploy();
    const deployTxReceipt = await tokenContract.deployTransaction.wait()
    console.log(`The ERC20 vote contract was deployed at address ${tokenContract.address} at the
    block ${deployTxReceipt.blockNumber}`);

};

main().catch((err) => {
    console.log(err);
    process.exitCode = 1;
});

/*
PS C:\Users\giopag81\Solidity\encode-week3> yarn hardhat run .\scripts\DeployERC20Votes2.0.ts
Connecting to blockchain
Etherscan key is of length 32
The last block is 9039384
Using wallet address 0xFc4A978B4D7d3A931419d3d5cc0F7Efb408c8457
Balance of 0xFc4A978B4D7d3A931419d3d5cc0F7Efb408c8457 is 64.0720337229098 WEI
The ERC20 vote contract was deployed at address 0x8C344075F9F48042a465a812Bb80fA649786b4D6 at the
    block 9039385
*/
