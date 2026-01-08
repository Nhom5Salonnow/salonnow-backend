import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Booking } from '../../booking/entities/booking.entity';
import { Service } from '../../service/entities/service.entity';

@Entity('salons')
export class Salon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  // Logo & Gallery
  @Column({ nullable: true })
  logo: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  // Working hours
  @Column({ name: 'open_time', nullable: true })
  openTime: string;

  @Column({ name: 'close_time', nullable: true })
  closeTime: string;

  @Column({ name: 'working_days', type: 'simple-array', nullable: true })
  workingDays: number[];

  // GPS Location
  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  // Rating & Stats
  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  @Column({ name: 'service_count', default: 0 })
  serviceCount: number;

  @Column({ name: 'stylist_count', default: 0 })
  stylistCount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.salons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Service, (service) => service.salon)
  services: Service[];

  @OneToMany(() => Booking, (booking) => booking.salon)
  bookings: Booking[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
