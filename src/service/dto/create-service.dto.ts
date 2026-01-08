import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 'Cắt tóc nam Undercut' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 50000 })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ example: 30, description: 'Thời gian làm (phút)' })
  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @ApiProperty({ example: 'Combo gội sấy vuốt sáp', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-cua-salon-o-day' })
  @IsNotEmpty()
  @IsUUID()
  salonId: string;
}
