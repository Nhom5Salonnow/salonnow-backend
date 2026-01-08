import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo thanh toán mới' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: any) {
    return this.paymentService.createPayment(req.user.id, createPaymentDto);
  }

  @Get('my-payments')
  @ApiOperation({ summary: 'Lấy lịch sử thanh toán của tôi' })
  findMyPayments(@Query() query: QueryPaymentDto, @Req() req: any) {
    return this.paymentService.findMyPayments(req.user.id, query);
  }

  @Get('methods')
  @ApiOperation({ summary: 'Lấy danh sách phương thức thanh toán' })
  findPaymentMethods(@Req() req: any) {
    return this.paymentService.findPaymentMethods(req.user.id);
  }

  @Post('methods')
  @ApiOperation({ summary: 'Thêm phương thức thanh toán' })
  @ApiResponse({ status: 201, description: 'Payment method added' })
  createPaymentMethod(
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
    @Req() req: any,
  ) {
    return this.paymentService.createPaymentMethod(
      req.user.id,
      createPaymentMethodDto,
    );
  }

  @Delete('methods/:id')
  @ApiOperation({ summary: 'Xóa phương thức thanh toán' })
  @ApiParam({ name: 'id', description: 'ID của payment method' })
  deletePaymentMethod(@Param('id') id: string, @Req() req: any) {
    return this.paymentService.deletePaymentMethod(id, req.user.id);
  }

  @Patch('methods/:id/default')
  @ApiOperation({ summary: 'Đặt làm phương thức thanh toán mặc định' })
  @ApiParam({ name: 'id', description: 'ID của payment method' })
  setDefaultPaymentMethod(@Param('id') id: string, @Req() req: any) {
    return this.paymentService.setDefaultPaymentMethod(id, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết thanh toán' })
  @ApiParam({ name: 'id', description: 'ID của payment' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.paymentService.findOne(id, req.user.id);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Hoàn tiền (Salon Owner)' })
  @ApiParam({ name: 'id', description: 'ID của payment' })
  refund(
    @Param('id') id: string,
    @Body() refundDto: RefundPaymentDto,
    @Req() req: any,
  ) {
    return this.paymentService.refund(id, req.user.id, refundDto);
  }
}
