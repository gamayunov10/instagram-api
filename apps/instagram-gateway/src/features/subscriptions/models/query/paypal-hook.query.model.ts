import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PaypalHookQueryModel {
  @ApiProperty({ type: String })
  @IsString()
  token: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  PayerID?: string;
}
