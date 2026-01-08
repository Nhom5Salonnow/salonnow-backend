import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'currentPassword123',
    description: 'Mật khẩu hiện tại',
  })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'newPassword123!',
    description: 'Mật khẩu mới (tối thiểu 6 ký tự)',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;
}
