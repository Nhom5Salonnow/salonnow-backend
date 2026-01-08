import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'abc123xyz',
    description: 'Token reset mật khẩu (từ email)',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    example: 'newPassword123!',
    description: 'Mật khẩu mới (tối thiểu 6 ký tự)',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;
}
