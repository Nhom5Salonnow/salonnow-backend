import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryBookingDto {
  @ApiPropertyOptional({
    example: 'PENDING,CONFIRMED',
    description: 'Filter by status (comma separated)',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: '2026-01-15',
    description: 'Filter by specific date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Range start date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-01-31',
    description: 'Range end date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}
