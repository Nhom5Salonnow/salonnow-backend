import { IsNotEmpty, IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingStatusDto {
  @ApiProperty({
    example: 'CONFIRMED',
    description: 'Trạng thái mới: CONFIRMED, CANCELLED, COMPLETED, NO_SHOW, IN_PROGRESS',
    enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'IN_PROGRESS'],
  })
  @IsNotEmpty()
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiPropertyOptional({
    example: 'Khách hàng yêu cầu hủy',
    description: 'Lý do hủy (bắt buộc nếu status = CANCELLED)',
  })
  @ValidateIf((o) => o.status === BookingStatus.CANCELLED)
  @IsNotEmpty({ message: 'cancelReason is required when status is CANCELLED' })
  @IsString()
  cancelReason?: string;
}
