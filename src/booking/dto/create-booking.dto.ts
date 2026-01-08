import { IsNotEmpty, IsISO8601, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-cua-salon' })
  @IsNotEmpty()
  @IsUUID()
  salonId: string;

  @ApiProperty({ example: 'uuid-cua-dich-vu' })
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;

  @ApiProperty({
    example: '2026-01-10T09:00:00Z',
    description: 'ISO 8601 Date format',
  })
  @IsNotEmpty()
  @IsISO8601()
  startTime: string;
}
