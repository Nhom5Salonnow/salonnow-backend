import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSalonDto {
  @ApiProperty({
    example: 'The Grand Salon',
    description: 'The updated name of the salon',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: '123 Main St, Anytown, USA',
    description: 'The updated address of the salon',
  })
  @IsString()
  @IsOptional()
  address?: string;
}
