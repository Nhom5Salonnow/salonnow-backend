import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum PaymentMethodType {
  CARD = 'CARD',
  WALLET = 'WALLET',
}

export enum CardBrand {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  JCB = 'JCB',
  AMEX = 'AMEX',
}

@Entity('payment_methods')
export class PaymentMethodEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
    default: PaymentMethodType.CARD,
  })
  type: PaymentMethodType;

  @Column({ name: 'last_four', length: 4 })
  last4: string;

  @Column({ name: 'card_holder_name' })
  cardHolderName: string;

  @Column({ name: 'expiry_month' })
  expiryMonth: number;

  @Column({ name: 'expiry_year' })
  expiryYear: number;

  @Column({
    type: 'enum',
    enum: CardBrand,
    nullable: true,
  })
  brand: CardBrand;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
