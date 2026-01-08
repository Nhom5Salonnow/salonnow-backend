import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Salon } from '../../salon/entities/salon.entity';

@Entity('stylists')
export class Stylist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Salon, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salon_id' })
  salon: Salon;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'simple-array', nullable: true })
  specialties: string[];

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => StylistSchedule, (schedule) => schedule.stylist)
  schedules: StylistSchedule[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('stylist_schedules')
export class StylistSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Stylist, (stylist) => stylist.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stylist_id' })
  stylist: Stylist;

  @Column({ name: 'day_of_week', type: 'int' }) // 0 = Sunday, 1 = Monday, etc.
  dayOfWeek: number;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'is_working', default: true })
  isWorking: boolean;
}
