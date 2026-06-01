import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Variant, VariantDocument } from '../variants/schemas/variant.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Status } from '../common/constants/status.enum';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Variant.name)
    private readonly variantModel: Model<VariantDocument>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const variant = await this.variantModel.findById(dto.variantId);
    if (!variant) throw new NotFoundException('Variant not found');

    const code = `${variant.code}-${dto.codeSuffix.toUpperCase().trim()}`;
    try {
      return await this.categoryModel.create({
        variantId: variant._id,
        name: dto.name,
        code,
        status: Status.ACTIVE,
      });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        throw new ConflictException(`Category code ${code} already exists`);
      }
      throw err;
    }
  }

  async findByVariant(variantId: string, status?: Status): Promise<Category[]> {
    const filter: Record<string, unknown> = { variantId };
    if (status) filter.status = status;
    return this.categoryModel.find(filter).sort({ code: 1 }).lean();
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }
}