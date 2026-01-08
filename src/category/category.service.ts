import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(query: any) {
    const where: any = {};
    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    const categories = await this.categoryRepository.find({
      where,
      order: { displayOrder: 'ASC', name: 'ASC' },
    });

    return {
      success: true,
      data: categories.map((c) => this.formatCategoryResponse(c)),
    };
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      success: true,
      data: this.formatCategoryResponse(category),
    };
  }

  async create(dto: CreateCategoryDto) {
    // Check if slug already exists
    const existing = await this.categoryRepository.findOne({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Category slug already exists');
    }

    const category = this.categoryRepository.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description || undefined,
      icon: dto.icon || undefined,
      image: dto.image || undefined,
      displayOrder: dto.displayOrder || 0,
      isActive: dto.isActive ?? true,
    } as any);

    const saved = await this.categoryRepository.save(category) as unknown as Category;

    return {
      success: true,
      data: this.formatCategoryResponse(saved),
    };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check slug uniqueness if being updated
    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException('Category slug already exists');
      }
    }

    Object.assign(category, dto);
    await this.categoryRepository.save(category);

    return {
      success: true,
      data: this.formatCategoryResponse(category),
    };
  }

  async delete(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryRepository.remove(category);

    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }

  private formatCategoryResponse(category: Category) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      image: category.image,
      displayOrder: category.displayOrder,
      serviceCount: category.serviceCount,
      isActive: category.isActive,
      createdAt: category.createdAt,
    };
  }
}
