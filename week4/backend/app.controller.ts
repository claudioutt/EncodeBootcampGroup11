import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import  { RequestTokensDto } from './dtos/requestTokens.dto';
import  { DelegateDto } from './dtos/delegate.dto';
import  { VoteDto } from './dtos/vote.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // this should be a post, since we
  // querying the provider, if we use get
  // a bunch of times we can expire
  // our number of free requests
  @Get("last-block")
  getLastBlock() {
    return this.appService.getLastBlock();
  }


  @Get("token-contract-address")
  getTokenAddress() {
    return this.appService.getTokenAddress();
  }

  @Get("ballot-contract-address")
  getBallotAddress() {
    return this.appService.getBallotAddress();

  }
  @Get("total-supply")
  getTotalSupply() {
    return this.appService.getTotalSupply();
  }

  @Get('balance/:address')
  getBalanceOf(@Param('address') address: string) {
    return this.appService.getBalanceOf(address);
  }

  @Get('transaction-receipt/')
  async getTransactionReceipt(@Query('hash') hash:
  string) {
    return await this.appService.getTransactionReceipt(hash);
  }

  @Get('voting-power/:address')
  async getVotingPower(@Param('address') address: string) {
    return await this.appService.getVotingPower(address);
  }

  @Get('proposals')
  getProposals() {
    return this.appService.getProposals();
  }

  @Post('buy-tokens')
    buyVotingTokens(@Body() body: RequestTokensDto) {// Dto data transfer object
      //return body;
      return this.appService.buyVotingTokens(body.address, body.value, body.signature);
    }

  @Post('delegate')
    delegate(@Body() body: DelegateDto) {// Dto data transfer object
      //return body;
      return this.appService.delegate(body.address);
    }

  @Post('vote')
    vote(@Body() body: VoteDto) {// Dto data transfer object
      //return body;
      return this.appService.vote(body.proposal, body.voteNumbers);
    }


}
