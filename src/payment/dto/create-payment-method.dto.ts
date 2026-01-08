import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Length,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethodType } from '../entities/payment-method.entity';

export class CreatePaymentMethodDto {
  @ApiProperty({
    example: 'CARD',
    description: 'Loại payment method',
    enum: PaymentMethodType,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @ApiProperty({ example: '4242424242424242', description: 'Số thẻ (chỉ lưu 4 số cuối)' })
  @IsNotEmpty()
  @IsString()
  @Length(13, 19)
  cardNumber: string;

  @ApiProperty({ example: 'NGUYEN VAN A', description: 'Tên chủ thẻ' })
  @IsNotEmpty()
  @IsString()
  cardHolderName: string;

  @ApiProperty({ example: 12, description: 'Tháng hết hạn' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(12)
  expiryMonth: number;

  @ApiProperty({ example: 2028, description: 'Năm hết hạn' })
  @IsNotEmpty()
  @IsNumber()
  @Min(2024)
  expiryYear: number;

  @ApiProperty({ example: '123', description: 'CVV (không lưu)' })
  @IsNotEmpty()
  @IsString()
  @Length(3, 4)
  cvv: string;

  @ApiPropertyOptional({ example: false, description: 'Đặt làm mặc định' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
