import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsArray,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalonDto {
  @ApiProperty({ example: 'Hair Salon Pro', description: 'Tên salon' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123 Nguyen Hue, Quan 1', description: 'Địa chỉ' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: 'Chuyên cắt tóc nam nữ...', description: 'Mô tả' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '0988888888', description: 'Số điện thoại' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'salon@example.com', description: 'Email' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png', description: 'Logo URL' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({
    example: ['https://example.com/img1.jpg'],
    description: 'Gallery images',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ example: '09:00', description: 'Giờ mở cửa (HH:mm)' })
  @IsString()
  @IsOptional()
  openTime?: string;

  @ApiPropertyOptional({ example: '21:00', description: 'Giờ đóng cửa (HH:mm)' })
  @IsString()
  @IsOptional()
  closeTime?: string;

  @ApiPropertyOptional({
    example: [1, 2, 3, 4, 5, 6],
    description: 'Ngày làm việc (0=CN, 1=T2...)',
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  workingDays?: number[];

  @ApiPropertyOptional({ example: 10.762622, description: 'Vĩ độ GPS' })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 106.660172, description: 'Kinh độ GPS' })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
