import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondReviewDto {
  @ApiProperty({ example: 'Cảm ơn bạn đã đánh giá!', description: 'Phản hồi của chủ salon' })
  @IsNotEmpty()
  @IsString()
  response: string;
}
