import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UserService } from '../user/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    if (!user) console.log('Login fail: Email not found');
    else if (!user.password)
      console.log('Login fail: User has no password in DB');
    else console.log('Login fail: Wrong password');

    return null;
  }

  private generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600, // 1 hour in seconds
    };
  }

  async login(user: any) {
    const tokens = this.generateTokens(user);

    // Save refresh token to database
    await this.usersService.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      success: true,
      data: {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber || null,
          avatar: user.avatarUrl || null,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const emailExists = await this.usersService.checkEmailExists(registerDto.email);
    if (emailExists) {
      throw new ConflictException({
        success: false,
        message: 'Email already exists',
        error: 'DUPLICATE_EMAIL',
      });
    }

    // Create new user
    const newUser = await this.usersService.createUser(registerDto);

    // Generate tokens
    const tokens = this.generateTokens(newUser);

    // Save refresh token
    await this.usersService.updateRefreshToken(newUser.id, tokens.refresh_token);

    return {
      success: true,
      message: 'Registration successful',
      data: {
        ...tokens,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phoneNumber: newUser.phoneNumber || null,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
      },
    };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findOne(userId);
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || null,
        avatar: user.avatarUrl || null,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);

      // Get user with refresh token
      const user = await this.usersService.findByRefreshToken(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException({
          success: false,
          message: 'Invalid refresh token',
          error: 'INVALID_REFRESH_TOKEN',
        });
      }

      // Verify stored refresh token matches
      const isValidToken = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValidToken) {
        throw new UnauthorizedException({
          success: false,
          message: 'Invalid refresh token',
          error: 'INVALID_REFRESH_TOKEN',
        });
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Update refresh token in database
      await this.usersService.updateRefreshToken(user.id, tokens.refresh_token);

      return {
        success: true,
        data: tokens,
      };
    } catch (error) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid or expired refresh token',
        error: 'INVALID_REFRESH_TOKEN',
      });
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    // Get user with password
    const user = await this.usersService.findByEmail(
      (await this.usersService.findOne(userId)).email,
    );

    if (!user || !user.password) {
      throw new BadRequestException({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException({
        success: false,
        message: 'Current password is incorrect',
        error: 'INVALID_PASSWORD',
      });
    }

    // Update password
    await this.usersService.updatePassword(userId, changePasswordDto.newPassword);

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  async forgotPassword(email: string) {
    const resetToken = await this.usersService.createPasswordResetToken(email);

    // In production, send email with reset link
    // For now, we just return success (don't reveal if email exists)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return {
      success: true,
      message: 'Password reset email sent',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByPasswordResetToken(token);

    if (!user) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid or expired reset token',
        error: 'INVALID_RESET_TOKEN',
      });
    }

    await this.usersService.resetPassword(user.id, newPassword);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}
