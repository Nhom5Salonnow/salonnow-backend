import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsString,
  IsEmail,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStylistDto {
  @ApiProperty({ example: 'uuid-cua-salon', description: 'ID của salon' })
  @IsNotEmpty()
  @IsUUID()
  salonId: string;

  @ApiProperty({ example: 'Nguyễn', description: 'Họ' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Văn A', description: 'Tên' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'stylist@salon.com', description: 'Email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '0988888888', description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'URL avatar' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: '5 năm kinh nghiệm cắt tóc nam', description: 'Tiểu sử' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: ['Hair Coloring', 'Haircut'],
    description: 'Chuyên môn',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ example: true, description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
