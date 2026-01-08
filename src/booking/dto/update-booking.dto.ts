import { IsISO8601, IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookingDto {
  @ApiPropertyOptional({
    example: '2026-01-10T10:00:00Z',
    description: 'Thời gian mới (ISO 8601)',
  })
  @IsOptional()
  @IsISO8601()
  startTime?: string;

  @ApiPropertyOptional({ example: 'uuid-cua-stylist', description: 'ID stylist mới' })
  @IsOptional()
  @IsUUID()
  stylistId?: string;

  @ApiPropertyOptional({ example: 'Cập nhật ghi chú', description: 'Ghi chú mới' })
  @IsOptional()
  @IsString()
  notes?: string;
}
