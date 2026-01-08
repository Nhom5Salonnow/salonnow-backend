import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from './entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Sửa logic update một chút để an toàn hơn:
    // Check xem user có tồn tại không trước khi update
    await this.findOne(id);

    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.softDelete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'firstName', 'lastName'],
    });
  }

  async createMany(usersData: CreateUserDto[]) {
    const results: any[] = [];

    for (const user of usersData) {
      try {
        const newUser = await this.createUser(user);
        results.push(newUser);
      } catch (error) {
        console.error(`Lỗi khi tạo user ${user.email}:`, error.message);
        results.push({ email: user.email, error: error.message });
      }
    }

    return results;
  }

  async updateRole(userId: string, newRole: UserRole): Promise<void> {
    await this.userRepository.update(userId, { role: newRole });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'firstName', 'lastName', 'phoneNumber', 'avatarUrl', 'createdAt', 'updatedAt'],
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    if (refreshToken) {
      const hashedToken = await bcrypt.hash(refreshToken, 10);
      await this.userRepository.update(userId, { refreshToken: hashedToken });
    } else {
      await this.userRepository.update(userId, { refreshToken: undefined as any });
    }
  }

  async findByRefreshToken(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'role', 'firstName', 'lastName', 'refreshToken'],
    });
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  async createPasswordResetToken(email: string): Promise<string | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.userRepository.update(user.id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: expires,
    });

    return resetToken;
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return this.userRepository.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: MoreThan(new Date()),
      },
    });
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await this.userRepository.update(userId, {
      password: hashedPassword,
      passwordResetToken: undefined as any,
      passwordResetExpires: undefined as any,
    });
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    return !!user;
  }
}
