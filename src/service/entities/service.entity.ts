import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Salon } from '../../salon/entities/salon.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 0 })
  price: number;

  @Column()
  duration: number;

  @Column({ nullable: true })
  description: string;

  // 👇 Liên kết với Salon
  @ManyToOne(() => Salon, (salon) => salon.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salon_id' })
  salon: Salon;

  @Column()
  salon_id: string; // Cột này để hứng ID salon khi query cho dễ
}
