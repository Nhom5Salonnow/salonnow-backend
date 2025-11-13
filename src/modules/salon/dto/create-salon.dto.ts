import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSalonDto {
  @ApiProperty({
    example: 'The Grand Salon',
    description: 'The name of the salon',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '123 Main St, Anytown, USA',
    description: 'The address of the salon',
  })
  @IsString()
  @IsOptional()
  address?: string;
}
