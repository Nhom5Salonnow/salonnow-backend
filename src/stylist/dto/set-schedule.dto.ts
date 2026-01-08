import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ScheduleItemDto {
  @ApiProperty({ example: 1, description: 'Ngày trong tuần (0=CN, 1=T2...)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00', description: 'Giờ bắt đầu' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ example: '18:00', description: 'Giờ kết thúc' })
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiProperty({ example: true, description: 'Có làm việc không' })
  @IsNotEmpty()
  @IsBoolean()
  isWorking: boolean;
}

export class SetScheduleDto {
  @ApiProperty({
    type: [ScheduleItemDto],
    description: 'Lịch làm việc theo ngày trong tuần',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItemDto)
  schedule: ScheduleItemDto[];
}
