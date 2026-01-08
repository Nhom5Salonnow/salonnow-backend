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
import { Salon } from '../../salon/entities/salon.entity';
import { Service } from '../../service/entities/service.entity';

export enum BookingStatus {
  PENDING = 'PENDING', // Chờ xác nhận
  CONFIRMED = 'CONFIRMED', // Chủ tiệm đã nhận
  IN_PROGRESS = 'IN_PROGRESS', // Đang làm
  COMPLETED = 'COMPLETED', // Đã làm xong
  CANCELLED = 'CANCELLED', // Đã hủy
  NO_SHOW = 'NO_SHOW', // Khách không đến
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

  // 4. Stylist (optional)
  @Column({ name: 'stylist_id', nullable: true })
  stylistId: string;

  // 5. Thời gian hẹn
  @Column()
  startTime: Date;

  // 6. Trạng thái
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  // 7. Ghi chú từ khách
  @Column({ nullable: true })
  notes: string;

  // 8. Lý do hủy
  @Column({ name: 'cancel_reason', nullable: true })
  cancelReason: string;

  // 9. Tổng giá
  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 0, nullable: true })
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
