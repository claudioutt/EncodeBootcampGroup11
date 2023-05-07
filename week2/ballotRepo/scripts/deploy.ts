import { ethers, utils } from "ethers";
import * as dotenv from 'dotenv';
import { Ballot__factory } from "../typechain-types";
dotenv.config();

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];


function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}




async function main1() {
  const provider = ethers.getDefaultProvider("sepolia"); 
  let path = "m/44'/60'/0'/0/1";
  const lastBlock = await provider.getBlock("latest");
  console.log(`The last block is ${lastBlock.number}`)
  const deployerWallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC?? "", path);
  const signer = deployerWallet.connect(provider);
  const ballotFactory = new Ballot__factory(signer); // exactly same as above except now I pass a singer
  const ballotContract = await ballotFactory.deploy(
    PROPOSALS.map(ethers.utils.formatBytes32String)
  );
  const deployTx = (await ballotContract).deployTransaction.wait();
  //console.log({deployTx}); 
  console.log(`The contract was deployed at address: ${ballotContract.address},
  at block; ${(await deployTx).blockNumber}`)

  const delegateVoteTx1 = await ballotContract.giveRightToVote("0x75dE164aa2f83625def6257cC99d40C8C4f659d9" );
  const delegateVoteTx1Receipt = delegateVoteTx1.wait();
  console.log(`Gave vote right to Chris: ${(await delegateVoteTx1Receipt).transactionHash}`);
  const delegateVoteTx2 = await ballotContract.giveRightToVote("0xFc4A978B4D7d3A931419d3d5cc0F7Efb408c8457" );
  const delegateVoteTx2Receipt = delegateVoteTx2.wait();
  console.log(`Gave vote right to Gioben: ${(await delegateVoteTx2Receipt).transactionHash}`);
  const delegateVoteTx3 = await ballotContract.giveRightToVote("0x8e241633b239865f971bb21604aBaAADdC34eb50" );
  const delegateVoteTx3Receipt = delegateVoteTx3.wait();
  console.log(`Gave vote right to Desmo: ${(await delegateVoteTx3Receipt).transactionHash}`);
  const delegateVoteTx4 = await ballotContract.giveRightToVote("0x8ab781088D9D97Aa7b48118964a3157c13a0cBEc " );
  const delegateVoteTx4Receipt = delegateVoteTx4.wait();
  console.log(`Gave vote right to Yeg: ${(await delegateVoteTx4Receipt).transactionHash}`);
}
async function main() {
  const provider = ethers.getDefaultProvider("sepolia"); 
  let path = "m/44'/60'/0'/0/1";
  const lastBlock = await provider.getBlock("latest");
  console.log(`The last block is ${lastBlock.number}`)
  const deployerWallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC?? "", path);
  const signer = deployerWallet.connect(provider);
  const ballotFactory = new Ballot__factory(signer);
  const myContract = await ballotFactory.attach("0xA262656989D4A6CDD68Dd7c1B7C307D6e3B62545");
  console.log(await myContract.address);
  const delegateVoteTx4 = await myContract.giveRightToVote("0x8ab781088D9D97Aa7b48118964a3157c13a0cBEc" );
  const delegateVoteTx4Receipt = delegateVoteTx4.wait();
  console.log(`Gave vote right to Yeg: ${(await delegateVoteTx4Receipt).transactionHash}`);

}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
