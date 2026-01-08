import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FeedbackStatus } from '../entities/feedback.entity';

export class RespondFeedbackDto {
  @ApiProperty({
    example: 'Chúng tôi đã sửa lỗi này',
    description: 'Phản hồi của admin',
  })
  @IsNotEmpty()
  @IsString()
  response: string;

  @ApiProperty({
    example: 'RESOLVED',
    description: 'Trạng thái mới',
    enum: ['IN_REVIEW', 'RESOLVED', 'CLOSED'],
  })
  @IsNotEmpty()
  @IsEnum(FeedbackStatus)
  status: FeedbackStatus;
}
