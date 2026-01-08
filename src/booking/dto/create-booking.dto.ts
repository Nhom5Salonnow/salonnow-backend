import { IsNotEmpty, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid of salon' })
  @IsNotEmpty()
  @IsUUID()
  salonId: string;

  @ApiProperty({ example: '2026-01-08T09:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-01-08T10:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  endTime: string;
}
