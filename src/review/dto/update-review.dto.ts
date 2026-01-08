import {
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: 4, description: 'Đánh giá tổng thể mới (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  overallRating?: number;

  @ApiPropertyOptional({ example: 4, description: 'Đánh giá dịch vụ mới (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  serviceRating?: number;

  @ApiPropertyOptional({ example: 4, description: 'Đánh giá stylist mới (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  stylistRating?: number;

  @ApiPropertyOptional({ example: 'Cập nhật nhận xét', description: 'Nhận xét mới' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    example: ['https://example.com/img2.jpg'],
    description: 'URLs ảnh mới',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
