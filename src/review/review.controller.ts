import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { RespondReviewDto } from './dto/respond-review.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { RespondFeedbackDto } from './dto/respond-feedback.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo review mới' })
  create(@Body() dto: CreateReviewDto, @Req() req: any) {
    return this.reviewService.createReview(req.user.id, dto);
  }

  @Get('my-reviews')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy reviews của tôi' })
  findMyReviews(@Query() query: QueryReviewDto, @Req() req: any) {
    return this.reviewService.findMyReviews(req.user.id, query);
  }

  @Get('salon/:salonId')
  @ApiOperation({ summary: 'Lấy reviews của salon' })
  @ApiParam({ name: 'salonId', description: 'ID của salon' })
  findBySalon(@Param('salonId') salonId: string, @Query() query: QueryReviewDto) {
    return this.reviewService.findBySalon(salonId, query);
  }

  @Get('service/:serviceId')
  @ApiOperation({ summary: 'Lấy reviews của service' })
  @ApiParam({ name: 'serviceId', description: 'ID của service' })
  findByService(
    @Param('serviceId') serviceId: string,
    @Query() query: QueryReviewDto,
  ) {
    return this.reviewService.findByService(serviceId, query);
  }

  @Get('stylist/:stylistId')
  @ApiOperation({ summary: 'Lấy reviews của stylist' })
  @ApiParam({ name: 'stylistId', description: 'ID của stylist' })
  findByStylist(
    @Param('stylistId') stylistId: string,
    @Query() query: QueryReviewDto,
  ) {
    return this.reviewService.findByStylist(stylistId, query);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật review' })
  @ApiParam({ name: 'id', description: 'ID của review' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @Req() req: any,
  ) {
    return this.reviewService.updateReview(id, req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa review' })
  @ApiParam({ name: 'id', description: 'ID của review' })
  delete(@Param('id') id: string, @Req() req: any) {
    return this.reviewService.deleteReview(id, req.user.id);
  }

  @Post(':id/respond')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Phản hồi review (Salon Owner)' })
  @ApiParam({ name: 'id', description: 'ID của review' })
  respond(
    @Param('id') id: string,
    @Body() dto: RespondReviewDto,
    @Req() req: any,
  ) {
    return this.reviewService.respondToReview(id, req.user.id, dto);
  }
}

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gửi feedback' })
  create(@Body() dto: CreateFeedbackDto, @Req() req: any) {
    return this.reviewService.createFeedback(req.user.id, dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách feedback (Admin)' })
  findAll(@Query() query: any) {
    return this.reviewService.findAllFeedback(query);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chi tiết feedback (Admin)' })
  @ApiParam({ name: 'id', description: 'ID của feedback' })
  findOne(@Param('id') id: string) {
    return this.reviewService.findOneFeedback(id);
  }

  @Post(':id/respond')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Phản hồi feedback (Admin)' })
  @ApiParam({ name: 'id', description: 'ID của feedback' })
  respond(
    @Param('id') id: string,
    @Body() dto: RespondFeedbackDto,
    @Req() req: any,
  ) {
    return this.reviewService.respondToFeedback(id, req.user.id, dto);
  }
}
