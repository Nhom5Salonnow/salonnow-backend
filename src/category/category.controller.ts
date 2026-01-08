import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách categories' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(@Query() query: any) {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết category' })
  @ApiParam({ name: 'id', description: 'ID của category' })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo category mới (Admin)' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật category (Admin)' })
  @ApiParam({ name: 'id', description: 'ID của category' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa category (Admin)' })
  @ApiParam({ name: 'id', description: 'ID của category' })
  delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
