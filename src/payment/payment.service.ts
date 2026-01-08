import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { PaymentMethodEntity, PaymentMethodType, CardBrand } from './entities/payment-method.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentMethodEntity)
    private paymentMethodRepository: Repository<PaymentMethodEntity>,
  ) {}

  async createPayment(userId: string, createPaymentDto: CreatePaymentDto) {
    // Generate mock transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payment = this.paymentRepository.create({
      user: { id: userId },
      booking: { id: createPaymentDto.bookingId },
      amount: createPaymentDto.amount,
      method: createPaymentDto.method,
      paymentMethodId: createPaymentDto.paymentMethodId || undefined,
      transactionId,
      status: PaymentStatus.COMPLETED, // Mock: auto complete
    } as any);

    const saved = await this.paymentRepository.save(payment) as unknown as Payment;

    return {
      success: true,
      data: {
        id: saved.id,
        bookingId: createPaymentDto.bookingId,
        userId,
        amount: Number(saved.amount),
        method: saved.method.toLowerCase(),
        status: saved.status.toLowerCase(),
        transactionId: saved.transactionId,
        createdAt: saved.createdAt,
      },
    };
  }

  async findMyPayments(userId: string, query: QueryPaymentDto) {
    const where: any = { user: { id: userId } };

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    if (query.startDate && query.endDate) {
      const start = new Date(query.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = Between(start, end);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;

    const [payments, total] = await this.paymentRepository.findAndCount({
      where,
      relations: ['booking', 'booking.salon', 'booking.service'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: {
        items: payments.map((p) => this.formatPaymentResponse(p)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(id: string, userId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['user', 'booking', 'booking.salon', 'booking.service'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.user.id !== userId) {
      throw new ForbiddenException('You are not allowed to view this payment');
    }

    return {
      success: true,
      data: this.formatPaymentResponse(payment),
    };
  }

  async refund(id: string, ownerId: string, refundDto: RefundPaymentDto) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['user', 'booking', 'booking.salon', 'booking.salon.owner'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify salon owner
    if (payment.booking?.salon?.owner?.id !== ownerId) {
      throw new ForbiddenException('You are not the owner of this salon');
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Payment already refunded');
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.refundReason = refundDto.reason;
    payment.refundedAt = new Date();

    await this.paymentRepository.save(payment);

    return {
      success: true,
      message: 'Refund processed successfully',
      data: {
        id: payment.id,
        status: 'refunded',
        refundedAt: payment.refundedAt,
        refundReason: payment.refundReason,
      },
    };
  }

  // Payment Methods
  async findPaymentMethods(userId: string) {
    const methods = await this.paymentMethodRepository.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });

    return {
      success: true,
      data: methods.map((m) => ({
        id: m.id,
        type: m.type.toLowerCase(),
        last4: m.last4,
        cardHolderName: m.cardHolderName,
        expiryMonth: m.expiryMonth,
        expiryYear: m.expiryYear,
        brand: m.brand,
        isDefault: m.isDefault,
        createdAt: m.createdAt,
      })),
    };
  }

  async createPaymentMethod(userId: string, dto: CreatePaymentMethodDto) {
    // Detect card brand from card number
    const brand = this.detectCardBrand(dto.cardNumber);
    const last4 = dto.cardNumber.slice(-4);

    // If isDefault, unset other defaults
    if (dto.isDefault) {
      await this.paymentMethodRepository.update(
        { user: { id: userId } },
        { isDefault: false },
      );
    }

    const method = this.paymentMethodRepository.create({
      user: { id: userId },
      type: dto.type,
      last4,
      cardHolderName: dto.cardHolderName.toUpperCase(),
      expiryMonth: dto.expiryMonth,
      expiryYear: dto.expiryYear,
      brand,
      isDefault: dto.isDefault || false,
    } as any);

    const saved = await this.paymentMethodRepository.save(method) as unknown as PaymentMethodEntity;

    return {
      success: true,
      data: {
        id: saved.id,
        type: saved.type.toLowerCase(),
        last4: saved.last4,
        cardHolderName: saved.cardHolderName,
        expiryMonth: saved.expiryMonth,
        expiryYear: saved.expiryYear,
        brand: saved.brand,
        isDefault: saved.isDefault,
        createdAt: saved.createdAt,
      },
    };
  }

  async deletePaymentMethod(id: string, userId: string) {
    const method = await this.paymentMethodRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    await this.paymentMethodRepository.remove(method);

    return {
      success: true,
      message: 'Payment method deleted successfully',
    };
  }

  async setDefaultPaymentMethod(id: string, userId: string) {
    const method = await this.paymentMethodRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    // Unset all defaults
    await this.paymentMethodRepository.update(
      { user: { id: userId } },
      { isDefault: false },
    );

    // Set this one as default
    method.isDefault = true;
    await this.paymentMethodRepository.save(method);

    return {
      success: true,
      message: 'Payment method set as default',
    };
  }

  private detectCardBrand(cardNumber: string): CardBrand | null {
    const num = cardNumber.replace(/\s/g, '');
    if (num.startsWith('4')) return CardBrand.VISA;
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return CardBrand.MASTERCARD;
    if (/^35/.test(num)) return CardBrand.JCB;
    if (/^3[47]/.test(num)) return CardBrand.AMEX;
    return null;
  }

  private formatPaymentResponse(payment: Payment) {
    return {
      id: payment.id,
      bookingId: payment.booking?.id,
      booking: payment.booking
        ? {
            id: payment.booking.id,
            service: payment.booking.service
              ? { name: payment.booking.service.name }
              : null,
            salon: payment.booking.salon
              ? { name: payment.booking.salon.name }
              : null,
            startTime: payment.booking.startTime,
          }
        : null,
      amount: payment.amount,
      method: payment.method.toLowerCase(),
      status: payment.status.toLowerCase(),
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
    };
  }
}
