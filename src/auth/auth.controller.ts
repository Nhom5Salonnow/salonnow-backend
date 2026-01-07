import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';


class LoginDto {
  email: string;
  pass: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập lấy Token' })
  async login(@Body() req: LoginDto) {

    const user = await this.authService.validateUser(req.email, req.pass);
    if (!user) {
      throw new UnauthorizedException('Sai email hoặc mật khẩu');
    }

    return this.authService.login(user);
  }
}
