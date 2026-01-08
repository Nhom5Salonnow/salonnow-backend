import { IsNotEmpty, IsISO8601, IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-cua-salon' })
  @IsNotEmpty()
  @IsUUID()
  salonId: string;

  @ApiProperty({ example: 'uuid-cua-dich-vu' })
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;

  @ApiPropertyOptional({ example: 'uuid-cua-stylist', description: 'ID của stylist (tùy chọn)' })
  @IsOptional()
  @IsUUID()
  stylistId?: string;

  @ApiProperty({
    example: '2026-01-10T09:00:00Z',
    description: 'ISO 8601 Date format',
  })
  @IsNotEmpty()
  @IsISO8601()
  startTime: string;

  @ApiPropertyOptional({ example: 'Tôi muốn cắt ngắn hơn bình thường', description: 'Ghi chú cho booking' })
  @IsOptional()
  @IsString()
  notes?: string;
}
