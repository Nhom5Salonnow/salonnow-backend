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
import { Booking } from '../../booking/entities/booking.entity';
import { Salon } from '../../salon/entities/salon.entity';
import { Service } from '../../service/entities/service.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => Salon, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salon_id' })
  salon: Salon;

  @ManyToOne(() => Service, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ name: 'stylist_id', nullable: true })
  stylistId: string;

  @Column({ name: 'overall_rating', type: 'int' })
  overallRating: number; // 1-5

  @Column({ name: 'service_rating', type: 'int', nullable: true })
  serviceRating: number; // 1-5

  @Column({ name: 'stylist_rating', type: 'int', nullable: true })
  stylistRating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ name: 'owner_response', type: 'text', nullable: true })
  ownerResponse: string;

  @Column({ name: 'owner_responded_at', nullable: true })
  ownerRespondedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
