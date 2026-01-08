import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewService } from './review.service';
import { ReviewController, FeedbackController } from './review.controller';
import { Review } from './entities/review.entity';
import { Feedback } from './entities/feedback.entity';
import { Booking } from '../booking/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Feedback, Booking])],
  controllers: [ReviewController, FeedbackController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
