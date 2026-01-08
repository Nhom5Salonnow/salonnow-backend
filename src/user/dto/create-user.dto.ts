import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'khachhang@gmail.com',
    description: 'Email đăng nhập',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải dài hơn 6 ký tự' })
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
