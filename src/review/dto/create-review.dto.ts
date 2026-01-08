import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'uuid-cua-booking', description: 'ID của booking đã completed' })
  @IsNotEmpty()
  @IsUUID()
  bookingId: string;

  @ApiProperty({ example: 5, description: 'Đánh giá tổng thể (1-5)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  overallRating: number;

  @ApiPropertyOptional({ example: 5, description: 'Đánh giá dịch vụ (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  serviceRating?: number;

  @ApiPropertyOptional({ example: 5, description: 'Đánh giá stylist (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  stylistRating?: number;

  @ApiPropertyOptional({ example: 'Dịch vụ rất tốt!', description: 'Nhận xét' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    example: ['https://example.com/img1.jpg'],
    description: 'URLs ảnh đánh giá',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
