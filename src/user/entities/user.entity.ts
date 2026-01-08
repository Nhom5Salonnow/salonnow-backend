import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
// 👇 Kiểm tra lại đường dẫn thư mục của bạn (salon hay salons)
import { Salon } from '../../salon/entities/salon.entity';
import { Booking } from '../../booking/entities/booking.entity';

export enum UserRole {
  CLIENT = 'CLIENT',
  SALON_OWNER = 'SALON_OWNER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({ name: 'fcm_token', nullable: true })
  fcmToken: string;

  @Column({ name: 'refresh_token', type: 'varchar', nullable: true, select: false })
  refreshToken: string;

  @Column({ name: 'password_reset_token', type: 'varchar', nullable: true, select: false })
  passwordResetToken: string;

  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  @OneToMany(() => Salon, (salon) => salon.owner)
  salons: Salon[];


  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings: Booking[];



  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Soft Delete (Xóa mềm)
  @DeleteDateColumn()
  deletedAt: Date;
}
