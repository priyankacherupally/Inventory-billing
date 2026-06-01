import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Subcategory,
  SubcategoryDocument,
} from './schemas/subcategory.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { Status } from '../common/constants/status.enum';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectModel(Subcategory.name)
    private readonly subcategoryModel: Model<SubcategoryDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateSubcategoryDto): Promise<Subcategory> {
    const category = await this.categoryModel.findById(dto.categoryId);
    if (!category) throw new NotFoundException('Category not found');

    const code = `${category.code}-${dto.codeSuffix.toUpperCase().trim()}`;
    try {
      return await this.subcategoryModel.create({
        categoryId: category._id,
        variantId: category.variantId,
        name: dto.name,
        code,
        status: Status.ACTIVE,
      });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        throw new ConflictException(`Sub-category code ${code} already exists`);
      }
      throw err;
    }
  }

  async findByCategory(
    categoryId: string,
    status?: Status,
  ): Promise<Subcategory[]> {
    const filter: Record<string, unknown> = { categoryId };
    if (status) filter.status = status;
    return this.subcategoryModel.find(filter).sort({ code: 1 }).lean();
  }

  async update(id: string, dto: UpdateSubcategoryDto): Promise<Subcategory> {
    const sub = await this.subcategoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!sub) throw new NotFoundException('Sub-category not found');
    return sub;
  }
}