import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum RevenuePeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class QueryRevenueDto {
  @ApiPropertyOptional({ example: '2024-01-01', description: 'Ngày bắt đầu' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Ngày kết thúc' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    enum: RevenuePeriod,
    example: RevenuePeriod.MONTH,
    description: 'Nhóm theo kỳ',
  })
  @IsEnum(RevenuePeriod)
  @IsOptional()
  period?: RevenuePeriod;
}
