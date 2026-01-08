import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackType } from '../entities/feedback.entity';

export class CreateFeedbackDto {
  @ApiProperty({
    example: 'BUG',
    description: 'Loại feedback',
    enum: FeedbackType,
  })
  @IsNotEmpty()
  @IsEnum(FeedbackType)
  type: FeedbackType;

  @ApiProperty({ example: 'Lỗi không thể đặt lịch', description: 'Tiêu đề' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({
    example: 'Khi tôi nhấn nút đặt lịch, app bị crash',
    description: 'Nội dung chi tiết',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional({
    example: ['https://example.com/screenshot.jpg'],
    description: 'URLs file đính kèm',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
