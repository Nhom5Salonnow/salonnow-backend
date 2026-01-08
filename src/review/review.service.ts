import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Feedback, FeedbackStatus } from './entities/feedback.entity';
import { Booking, BookingStatus } from '../booking/entities/booking.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { RespondReviewDto } from './dto/respond-review.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { RespondFeedbackDto } from './dto/respond-feedback.dto';
import { QueryReviewDto } from './dto/query-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  // Reviews
  async createReview(userId: string, dto: CreateReviewDto) {
    // Get booking
    const booking = await this.bookingRepository.findOne({
      where: { id: dto.bookingId },
      relations: ['customer', 'salon', 'service'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.customer.id !== userId) {
      throw new ForbiddenException('You are not the owner of this booking');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Can only review completed bookings');
    }

    // Check if review already exists
    const existingReview = await this.reviewRepository.findOne({
      where: { booking: { id: dto.bookingId } },
    });

    if (existingReview) {
      throw new BadRequestException('Review already exists for this booking');
    }

    const review = this.reviewRepository.create({
      user: { id: userId },
      booking: { id: dto.bookingId },
      salon: { id: booking.salon.id },
      service: booking.service ? { id: booking.service.id } : undefined,
      stylistId: booking.stylistId || undefined,
      overallRating: dto.overallRating,
      serviceRating: dto.serviceRating || undefined,
      stylistRating: dto.stylistRating || undefined,
      comment: dto.comment || undefined,
      images: dto.images || [],
    } as any);

    const saved = await this.reviewRepository.save(review) as unknown as Review;
    return {
      success: true,
      data: await this.formatReviewResponse(saved.id),
    };
  }

  async findMyReviews(userId: string, query: QueryReviewDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['user', 'salon', 'service'],
      order: { [query.sortBy || 'createdAt']: query.sortOrder?.toUpperCase() || 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: {
        items: reviews.map((r) => this.formatReviewData(r)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findBySalon(salonId: string, query: QueryReviewDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const where: any = { salon: { id: salonId } };
    if (query.rating) {
      where.overallRating = query.rating;
    }

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where,
      relations: ['user', 'salon', 'service'],
      order: { [query.sortBy || 'createdAt']: query.sortOrder?.toUpperCase() || 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate summary
    const allReviews = await this.reviewRepository.find({
      where: { salon: { id: salonId } },
      select: ['overallRating'],
    });

    const summary = this.calculateRatingSummary(allReviews);

    return {
      success: true,
      data: {
        summary,
        items: reviews.map((r) => this.formatReviewData(r)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findByService(serviceId: string, query: QueryReviewDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const where: any = { service: { id: serviceId } };
    if (query.rating) {
      where.overallRating = query.rating;
    }

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where,
      relations: ['user', 'salon', 'service'],
      order: { [query.sortBy || 'createdAt']: query.sortOrder?.toUpperCase() || 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: {
        items: reviews.map((r) => this.formatReviewData(r)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findByStylist(stylistId: string, query: QueryReviewDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const where: any = { stylistId };
    if (query.rating) {
      where.stylistRating = query.rating;
    }

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where,
      relations: ['user', 'salon', 'service'],
      order: { [query.sortBy || 'createdAt']: query.sortOrder?.toUpperCase() || 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: {
        items: reviews.map((r) => this.formatReviewData(r)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async updateReview(id: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.user.id !== userId) {
      throw new ForbiddenException('You are not the owner of this review');
    }

    Object.assign(review, dto);
    await this.reviewRepository.save(review);

    return {
      success: true,
      data: await this.formatReviewResponse(id),
    };
  }

  async deleteReview(id: string, userId: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.user.id !== userId) {
      throw new ForbiddenException('You are not the owner of this review');
    }

    await this.reviewRepository.remove(review);

    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }

  async respondToReview(id: string, ownerId: string, dto: RespondReviewDto) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['salon', 'salon.owner'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.salon.owner.id !== ownerId) {
      throw new ForbiddenException('You are not the owner of this salon');
    }

    review.ownerResponse = dto.response;
    review.ownerRespondedAt = new Date();
    await this.reviewRepository.save(review);

    return {
      success: true,
      data: await this.formatReviewResponse(id),
    };
  }

  // Feedback
  async createFeedback(userId: string, dto: CreateFeedbackDto) {
    const feedback = this.feedbackRepository.create({
      user: { id: userId },
      type: dto.type,
      subject: dto.subject,
      message: dto.message,
      attachments: dto.attachments || [],
    });

    const saved = await this.feedbackRepository.save(feedback);

    return {
      success: true,
      data: {
        id: saved.id,
        userId,
        type: saved.type.toLowerCase(),
        subject: saved.subject,
        message: saved.message,
        attachments: saved.attachments,
        status: saved.status.toLowerCase(),
        createdAt: saved.createdAt,
      },
    };
  }

  async findAllFeedback(query: any) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const where: any = {};
    if (query.status) {
      where.status = query.status.toUpperCase();
    }
    if (query.type) {
      where.type = query.type.toUpperCase();
    }

    const [feedbacks, total] = await this.feedbackRepository.findAndCount({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: {
        items: feedbacks.map((f) => ({
          id: f.id,
          user: f.user
            ? {
                id: f.user.id,
                firstName: f.user.firstName,
                lastName: f.user.lastName,
                email: f.user.email,
              }
            : null,
          type: f.type.toLowerCase(),
          subject: f.subject,
          message: f.message,
          attachments: f.attachments,
          status: f.status.toLowerCase(),
          adminResponse: f.adminResponse,
          respondedBy: f.respondedBy,
          respondedAt: f.respondedAt,
          createdAt: f.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOneFeedback(id: string) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return {
      success: true,
      data: {
        id: feedback.id,
        user: feedback.user
          ? {
              id: feedback.user.id,
              firstName: feedback.user.firstName,
              lastName: feedback.user.lastName,
              email: feedback.user.email,
            }
          : null,
        type: feedback.type.toLowerCase(),
        subject: feedback.subject,
        message: feedback.message,
        attachments: feedback.attachments,
        status: feedback.status.toLowerCase(),
        adminResponse: feedback.adminResponse,
        respondedBy: feedback.respondedBy,
        respondedAt: feedback.respondedAt,
        createdAt: feedback.createdAt,
      },
    };
  }

  async respondToFeedback(id: string, adminId: string, dto: RespondFeedbackDto) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    feedback.adminResponse = dto.response;
    feedback.status = dto.status;
    feedback.respondedBy = adminId;
    feedback.respondedAt = new Date();

    await this.feedbackRepository.save(feedback);

    return {
      success: true,
      message: 'Feedback responded successfully',
    };
  }

  private async formatReviewResponse(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'salon', 'service'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.formatReviewData(review);
  }

  private formatReviewData(review: Review) {
    return {
      id: review.id,
      bookingId: review.booking?.id,
      userId: review.user?.id,
      user: review.user
        ? {
            id: review.user.id,
            firstName: review.user.firstName,
            lastName: review.user.lastName,
            avatar: review.user.avatarUrl || null,
          }
        : null,
      salonId: review.salon?.id,
      serviceId: review.service?.id,
      stylistId: review.stylistId,
      overallRating: review.overallRating,
      serviceRating: review.serviceRating,
      stylistRating: review.stylistRating,
      comment: review.comment,
      images: review.images,
      ownerResponse: review.ownerResponse,
      ownerRespondedAt: review.ownerRespondedAt,
      createdAt: review.createdAt,
    };
  }

  private calculateRatingSummary(reviews: Review[]) {
    const total = reviews.length;
    if (total === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
      };
    }

    const sum = reviews.reduce((acc, r) => acc + r.overallRating, 0);
    const distribution = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    reviews.forEach((r) => {
      distribution[String(r.overallRating)]++;
    });

    return {
      averageRating: Math.round((sum / total) * 10) / 10,
      totalReviews: total,
      ratingDistribution: distribution,
    };
  }
}
