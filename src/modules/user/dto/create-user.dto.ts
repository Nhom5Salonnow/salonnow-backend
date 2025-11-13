import { IsString, IsNumber, IsNotEmpty, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 30,
    description: 'The age of the user',
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @IsOptional()
  age?: number;
}