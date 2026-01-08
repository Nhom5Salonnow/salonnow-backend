import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Salon } from '../../salon/entities/salon.entity';
import { Service } from '../../service/entities/service.entity';

export enum BookingStatus {
  PENDING = 'PENDING', // Chờ xác nhận
  CONFIRMED = 'CONFIRMED', // Chủ tiệm đã nhận
  COMPLETED = 'COMPLETED', // Đã làm xong
  CANCELLED = 'CANCELLED', // Đã hủy
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 1. Khách hàng
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  // 2. Salon
  @ManyToOne(() => Salon, (salon) => salon.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salon_id' })
  salon: Salon;

  // 3. Dịch vụ (Tạm thời 1 booking chọn 1 dịch vụ cho đơn giản)
  @ManyToOne(() => Service, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  // 4. Thời gian hẹn
  @Column()
  startTime: Date;

  // 5. Trạng thái
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;
}
