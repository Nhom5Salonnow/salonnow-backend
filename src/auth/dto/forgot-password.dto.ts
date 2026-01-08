import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email đăng ký tài khoản',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
