import { ApiProperty } from "@nestjs/swagger";

export class VoteDto {
    @ApiProperty() 
    readonly proposal: Number;
    @ApiProperty() 
    readonly voteNumbers: Number;
}
