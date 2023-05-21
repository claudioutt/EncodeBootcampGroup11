import { Injectable, Query } from '@nestjs/common';
import { BigNumber, Signer, ethers } from 'ethers';
import * as tokenJson from './assets/MyERC20Votes.json';
import * as ballotJson from './assets/Ballot.json';
import { ConfigService } from '@nestjs/config';




@Injectable()
export class AppService {
  provider: ethers.providers.BaseProvider;
  provider1: ethers.providers.BaseProvider;
  ERC20Contract: ethers.Contract;
  BallotContract: ethers.Contract;
  signer: ethers.Signer;
  pkey: string;
  wallet: ethers.Wallet;
  //proposals : [];
  

  //private configService: ConfigService

  constructor(private configService: ConfigService) {
    //const VALUE = ethers.utils.parseUnits("0.005");
    const apiKey = this.configService.get<string>('INFURA_API_KEY');
    this.provider = new ethers.providers.InfuraProvider('goerli', apiKey);
    //this.provider = ethers.getDefaultProvider('goerli');
    this.ERC20Contract = new ethers.Contract(this.getTokenAddress(), tokenJson.abi, this.provider);
    this.BallotContract = new ethers.Contract(this.getBallotAddress(), ballotJson.abi, this.provider);
    this.pkey = this.configService.get<string>('PRIVATE_KEY');
    const wallet = new ethers.Wallet(this.pkey);
    this.signer = wallet.connect(this.provider);
    //this.proposals = this.BallotContract.proposals;
    
  }

  getHello(): string {
    return 'Hello World!';
  }

  getLastBlock(): Promise<ethers.providers.Block> {
   return this.provider.getBlock("latest");
  }

  getTokenAddress() {
    const tokenAddress = this.configService.get<string>('TOKEN_ADDRESS');
    return tokenAddress;
    //return "0xD47F9678A8FC7D0a52E2D8BA6FFC6553fe8d1A36";
    }

  getBallotAddress() {
    const tokenAddress = this.configService.get<string>('BALLOT_ADDRESS');
    return tokenAddress;
    }

  getTotalSupply() {
    return this.ERC20Contract.totalSupply();
    }

  async getBalanceOf(address: string) {
    return (await this.ERC20Contract.balanceOf(address)).toString();
  }

  getVotingPower(address: string) {
    return this.BallotContract.votingPower(address);
  }



  async getProposals() {
    const result = [];
    for (let i = 0; i < 5; i++) {
       //const proposal = proposals(i);
       const proposal = await this.BallotContract.proposals(i)
       const name = ethers.utils.parseBytes32String(proposal.name);
       const voteCount = proposal.voteCount.toString(); // Assuming voteCount is a numerical value
       result.push(`${i + 1}) ${name} has ${voteCount} Votes`);
    } 

     return result;
}

  async getTransactionReceipt(hash:string) {
    const tx = await this.provider.getTransaction(hash);
    const receipt = await this.getReceipt(tx);
    return receipt;
  }

  async getReceipt(tx: ethers.providers.TransactionResponse) {
    return await tx.wait();
  }

  async buyVotingTokens (address: string, value: string, signature: string) {
    return this.BallotContract.connect(this.signer)
    .buyVotingTokens({ value: ethers.utils.parseUnits(value) });
}

  async delegate(address: string) {
    return this.ERC20Contract.connect(this.signer).delegate(address);
}

  async vote(proposal: Number, voteNumbers: Number ) {
    return this.BallotContract.connect(this.signer).vote(proposal, voteNumbers);
  }
}
