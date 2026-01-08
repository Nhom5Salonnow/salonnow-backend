import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 'uuid-cua-salon', description: 'ID của salon' })
  @IsNotEmpty()
  @IsUUID()
  salonId: string;

  @ApiPropertyOptional({ example: 'uuid-cua-category', description: 'ID của category' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 'Cắt tóc nam Undercut', description: 'Tên dịch vụ' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 50000, description: 'Giá dịch vụ' })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ example: 30, description: 'Thời gian làm (phút)' })
  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @ApiPropertyOptional({ example: 'Combo gội sấy vuốt sáp', description: 'Mô tả' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: ['https://example.com/service1.jpg'],
    description: 'URLs ảnh dịch vụ',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: true, description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
