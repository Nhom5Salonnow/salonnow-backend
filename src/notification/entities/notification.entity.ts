import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  message: string; // Nội dung: "Có slot trống lúc 10h!"

  @Column({ default: false })
  isRead: boolean; // Đã đọc hay chưa

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User; // Thông báo của ai

  @CreateDateColumn()
  createdAt: Date;
}
