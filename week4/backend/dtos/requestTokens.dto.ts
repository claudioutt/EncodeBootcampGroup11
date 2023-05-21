import { ApiProperty } from "@nestjs/swagger";

export class RequestTokensDto {
    @ApiProperty() // in this way swagger now and can adjust documentation based on this API property
    readonly address: string;
    @ApiProperty()
    readonly value: string;
    @ApiProperty()
    readonly signature: string;
}
