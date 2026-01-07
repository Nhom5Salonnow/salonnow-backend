import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSalonDto {
  @ApiProperty({ example: 'Hair Salon Pro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123 Nguyen Hue, Quan 1' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Chuyên cắt tóc nam nữ...', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
