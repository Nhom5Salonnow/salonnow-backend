import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email đăng nhập',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Mật khẩu (tối thiểu 6 ký tự)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({ example: 'Nguyễn', description: 'Họ' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Văn A', description: 'Tên' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '0988888888', description: 'Số điện thoại' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}
