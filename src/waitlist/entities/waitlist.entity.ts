import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Salon } from '../../salon/entities/salon.entity';
import { Service } from '../../service/entities/service.entity';

export enum WaitlistStatus {
  WAITING = 'WAITING', // Đang chờ
  OFFERED = 'OFFERED', // Đã tìm thấy slot, đang chờ khách xác nhận
  CONVERTED = 'CONVERTED', // Đã chuyển thành Booking thành công (Auto hoặc Manual)
  EXPIRED = 'EXPIRED', // Khách không phản hồi
  CANCELLED = 'CANCELLED', // Khách hủy
}

@Entity('waitlists')
export class Waitlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Salon)
  @JoinColumn({ name: 'salon_id' })
  salon: Salon;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  // 👇 THÔNG TIN THÔNG MINH
  @Column({ type: 'date' })
  preferredDate: string; // Ngày muốn làm (VD: 2026-01-20)

  @Column({ type: 'time' })
  startWindow: string; // Rảnh từ mấy giờ? (VD: 14:00)

  @Column({ type: 'time' })
  endWindow: string; // Rảnh đến mấy giờ? (VD: 18:00)

  @Column({ default: false })
  isAutoBook: boolean; // True: Tự động đặt luôn không cần hỏi. False: Chỉ báo thôi.

  @Column({
    type: 'enum',
    enum: WaitlistStatus,
    default: WaitlistStatus.WAITING,
  })
  status: WaitlistStatus;

  @CreateDateColumn()
  createdAt: Date;
}
