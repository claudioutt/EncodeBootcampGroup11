import { BigNumber, ethers } from "ethers";
import { Ballot__factory, MyErc20Votes, MyErc20Votes__factory } from "../typechain-types";
import * as dotenv from 'dotenv';
//dotenv.config();
require('dotenv').config();


const MINT_VALUE = ethers.utils.parseUnits("0.1")


const VOTERS = ['0x8ab781088D9D97Aa7b48118964a3157c13a0cBEc', 
'0x034CF18e2Ff18a5bEe003d46444D3F2743Ca7Ca8', 
'0x8e241633b239865f971bb21604aBaAADdC34eb50', 
'0x8ab781088D9D97Aa7b48118964a3157c13a0cBEc'];


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
    let tokenContract: MyErc20Votes;
    const tokenFactory = new MyErc20Votes__factory(signer);
    tokenContract = await tokenFactory.deploy();
    const deployTxReceipt = await tokenContract.deployTransaction.wait()
    console.log(`The ERC20 vote contract was deployed at address ${tokenContract.address} at the
    block ${deployTxReceipt.blockNumber}`);

    // minting some token for the deployer
    let mintTx = await tokenContract.mint(deployer, MINT_VALUE);
    let mintTxReceipt = await mintTx.wait();
    //let tokenBalanceDec: BigNumber;
    let tokenBalanceDec = await tokenContract.balanceOf(wallet.address);
    let tokenBalance = Number(tokenBalanceDec)/1e18;
    console.log(`Minted for account ${deployer} BLT token amount of 
    ${tokenBalance.toString()} at block number: ${mintTxReceipt.blockNumber}
    with trasaction hash ${mintTxReceipt.transactionHash}`); 

    // minting some token for the voters
    for (let i = 0; i < VOTERS.length; i++) {
        mintTx = await tokenContract.mint(VOTERS[i], MINT_VALUE);
        mintTxReceipt = await mintTx.wait()
        tokenBalanceDec = await tokenContract.balanceOf(VOTERS[i]);
        tokenBalance = Number(tokenBalanceDec)/1e18 ;
        console.log(`Minted for voter account ${VOTERS[i]} 
        BLT token amount of ${tokenBalance.toString()} 
        at block number: ${mintTxReceipt.blockNumber}
        with trasaction hash ${mintTxReceipt.transactionHash}`); 
    }       
};

main().catch((err) => {
    console.log(err);
    process.exitCode = 1;
});

/*
PS C:\Users\giopag81\Solidity\encode-week3> yarn hardhat run .\scripts\deployERC20Votes.ts --network goerli
Connecting to blockchain
Etherscan key is of length 32
The last block is 9004502
Using wallet address 0xFc4A978B4D7d3A931419d3d5cc0F7Efb408c8457
Balance of 0xFc4A978B4D7d3A931419d3d5cc0F7Efb408c8457 is 66.60590099804898 WEI
The ERC20 vote contract was deployed at address 0xD47F9678A8FC7D0a52E2D8BA6FFC6553fe8d1A36 at the
    block 9004503
Minted for account 0xFc4A978B4D7d3A931419d3d5cc0F7Efb408c8457 BLT token amount of
    10 at block number: 9004504
    with trasaction hash 0xef40eea3a41150d9adcc03beb2ebe08b17e8b69a385f1cec358d75fff4e56462
Minted for voter account 0x8ab781088D9D97Aa7b48118964a3157c13a0cBEc
        BLT token amount of 10
        at block number: 9004505
        with trasaction hash 0xca88dcb10db74d6806b3df2fb90483600323393ba5b5985e69786e3ed7346b7d
Minted for voter account 0x034CF18e2Ff18a5bEe003d46444D3F2743Ca7Ca8
        BLT token amount of 10
        at block number: 9004506
        with trasaction hash 0xddb44019d5d12a56eea9b2254d11d103f265f6aecae4089ce98e5f2787ce7268
Minted for voter account 0x8e241633b239865f971bb21604aBaAADdC34eb50
        BLT token amount of 10
        at block number: 9004507
        with trasaction hash 0x2dec11bd920109c24a81138dc3dfb2e9c45fde52995c3f2a94056c7f1fc099b4
*/
