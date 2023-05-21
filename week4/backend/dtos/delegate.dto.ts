import { ApiProperty } from "@nestjs/swagger";

export class DelegateDto {
    @ApiProperty() 
    readonly address: string;
}
