import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryStatsDto {
  @ApiPropertyOptional({ example: '2024-01-01', description: 'Ngày bắt đầu' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Ngày kết thúc' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
