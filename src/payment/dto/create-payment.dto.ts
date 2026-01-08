import { IsNotEmpty, IsUUID, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-cua-booking' })
  @IsNotEmpty()
  @IsUUID()
  bookingId: string;

  @ApiProperty({ example: 50000, description: 'Số tiền thanh toán' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    example: 'CARD',
    description: 'Phương thức thanh toán',
    enum: PaymentMethod,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({
    example: 'uuid-cua-payment-method',
    description: 'ID của payment method đã lưu (nếu dùng card đã lưu)',
  })
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;
}
