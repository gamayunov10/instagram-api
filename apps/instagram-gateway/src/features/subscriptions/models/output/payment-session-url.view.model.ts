import { ApiProperty } from '@nestjs/swagger';

export class PaymentSessionUrlViewModel {
  @ApiProperty({
    type: String,
  })
  url: string;
}
