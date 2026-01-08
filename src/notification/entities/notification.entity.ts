import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum NotificationType {
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  WAITLIST_AVAILABLE = 'WAITLIST_AVAILABLE',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  REVIEW_REPLY = 'REVIEW_REPLY',
  SYSTEM = 'SYSTEM',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @Column({ nullable: true })
  title: string;

  @Column()
  message: string;

  @Column({ type: 'json', nullable: true })
  data: {
    bookingId?: string;
    salonId?: string;
    reviewId?: string;
  };

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
