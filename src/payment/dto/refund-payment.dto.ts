import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefundPaymentDto {
  @ApiProperty({ example: 'Khách hàng yêu cầu hoàn tiền', description: 'Lý do hoàn tiền' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}
