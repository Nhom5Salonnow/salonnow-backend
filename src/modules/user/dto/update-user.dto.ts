import { IsString, IsNumber, IsNotEmpty, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'The updated name of the user',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 30,
    description: 'The updated age of the user',
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @IsOptional()
  age?: number;
}