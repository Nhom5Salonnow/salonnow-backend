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
// import { Service } from '../../service/entities/service.entity';

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

  @ManyToOne(() => User, (user) => user.salons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' }) // 👈 Map cột này vào owner_id trong DB
  owner: User;

  @OneToMany(() => Booking, (booking) => booking.salon)
  bookings: Booking[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
