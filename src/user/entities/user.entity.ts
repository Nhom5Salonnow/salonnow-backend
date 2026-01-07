import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';

export enum UserRole {
  CLIENT = 'CLIENT',
  SALON_OWNER = 'SALON_OWNER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;
  @Column({ name: 'fcm_token', nullable: true })
  fcmToken: string;

  /*
  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Salon, (salon) => salon.owner)
  ownedSalons: Salon[];

  @OneToMany(() => Waitlist, (waitlist) => waitlist.user)
  waitlistItems: Waitlist[];
  */

  // --- TIMESTAMPS ---

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Soft Delete
  @DeleteDateColumn()
  deletedAt: Date;
}
