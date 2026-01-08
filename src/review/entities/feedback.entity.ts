import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum FeedbackType {
  BUG = 'BUG',
  FEATURE = 'FEATURE',
  COMPLAINT = 'COMPLAINT',
  SUGGESTION = 'SUGGESTION',
  OTHER = 'OTHER',
}

export enum FeedbackStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: FeedbackType,
    default: FeedbackType.OTHER,
  })
  type: FeedbackType;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({
    type: 'enum',
    enum: FeedbackStatus,
    default: FeedbackStatus.PENDING,
  })
  status: FeedbackStatus;

  @Column({ name: 'admin_response', type: 'text', nullable: true })
  adminResponse: string;

  @Column({ name: 'responded_by', nullable: true })
  respondedBy: string;

  @Column({ name: 'responded_at', nullable: true })
  respondedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
