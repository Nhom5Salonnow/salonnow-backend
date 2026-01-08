import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWaitlistDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  salonId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;

  @ApiProperty({ example: '2026-01-20' })
  @IsNotEmpty()
  @IsDateString()
  preferredDate: string;

  @ApiProperty({ example: '14:00', description: 'HH:mm format' })
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be HH:mm',
  })
  startWindow: string;

  @ApiProperty({ example: '18:00', description: 'HH:mm format' })
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be HH:mm',
  })
  endWindow: string;

  @ApiProperty({ example: true, description: 'Tự động đặt nếu có chỗ' })
  @IsBoolean()
  isAutoBook: boolean;
}
