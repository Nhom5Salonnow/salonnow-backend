import {
  IsOptional,
  IsString,
  IsEmail,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStylistDto {
  @ApiPropertyOptional({ example: 'Nguyễn', description: 'Họ' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Văn B', description: 'Tên' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'stylist2@salon.com', description: 'Email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '0977777777', description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar2.jpg', description: 'URL avatar' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: '10 năm kinh nghiệm', description: 'Tiểu sử' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: ['Hair Coloring', 'Perm'],
    description: 'Chuyên môn',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ example: false, description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
