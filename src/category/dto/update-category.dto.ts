import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Hair Design', description: 'Tên danh mục' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'hair', description: 'Slug (URL friendly)' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Dịch vụ tóc', description: 'Mô tả' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'cut', description: 'Icon name hoặc URL' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new.jpg', description: 'Banner image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: 2, description: 'Thứ tự hiển thị' })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ example: false, description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
