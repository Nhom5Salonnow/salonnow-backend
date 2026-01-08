import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Hair Design & Cut', description: 'Tên danh mục' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'hair-design', description: 'Slug (URL friendly)' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'Các dịch vụ cắt tóc, tạo kiểu', description: 'Mô tả' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'scissors', description: 'Icon name hoặc URL' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: 'https://example.com/hair.jpg', description: 'Banner image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: 1, description: 'Thứ tự hiển thị' })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ example: true, description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
