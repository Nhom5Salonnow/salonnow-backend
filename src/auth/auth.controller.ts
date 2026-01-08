import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập lấy Token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'tran.thi.b@example.com' },
        password: { type: 'string', example: 'SecurePass456!' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không chính xác' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
  @ApiResponse({ status: 200, description: 'Thông tin user' })
  async getMe(@Request() req) {
    return this.authService.getMe(req.user.id);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Token mới' })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  @ApiResponse({ status: 200, description: 'Đổi mật khẩu thành công' })
  @ApiResponse({ status: 400, description: 'Mật khẩu hiện tại không đúng' })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Quên mật khẩu - gửi email reset' })
  @ApiResponse({ status: 200, description: 'Email reset đã được gửi' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu' })
  @ApiResponse({ status: 200, description: 'Đặt lại mật khẩu thành công' })
  @ApiResponse({ status: 400, description: 'Token không hợp lệ hoặc đã hết hạn' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }
}
