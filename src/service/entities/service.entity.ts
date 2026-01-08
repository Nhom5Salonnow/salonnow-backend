import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Salon } from '../../salon/entities/salon.entity';
import { Category } from '../../category/entities/category.entity';

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

  // Liên kết với Salon
  @ManyToOne(() => Salon, (salon) => salon.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salon_id' })
  salon: Salon;

  @Column()
  salon_id: string;

  // Liên kết với Category
  @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  // Ảnh dịch vụ
  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  // Rating và reviews
  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  // Trạng thái
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
