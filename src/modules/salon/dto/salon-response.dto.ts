import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Salon } from '../../../entities/Salon';

export class SalonResponseDto {
  @ApiProperty({ example: 1, description: 'The unique ID of the salon' })
  id: number;

  @ApiProperty({ example: 'The Grand Salon', description: 'The name of the salon' })
  name: string;

  @ApiPropertyOptional({ example: '123 Main St, Anytown, USA', description: 'The address of the salon (optional)' })
  address?: string;

  @ApiProperty({
    description: 'The date and time the salon was created',
    example: '2025-11-08T16:56:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time the salon was last updated',
    example: '2025-11-08T16:56:00.000Z',
  })
  updatedAt: Date;

  constructor(salon: Salon) {
    this.id = salon.id;
    this.name = salon.name;
    this.address = salon.address;
    this.createdAt = salon.createdAt;
    this.updatedAt = salon.updatedAt;
  }
}
