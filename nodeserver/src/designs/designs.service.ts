import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Design, DesignDocument } from './schemas/design.schema';
import {
  Subcategory,
  SubcategoryDocument,
} from '../subcategories/schemas/subcategory.schema';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';
import { CountersService } from '../counters/counters.service';
import { Status } from '../common/constants/status.enum';

@Injectable()
export class DesignsService {
  constructor(
    @InjectModel(Design.name) private readonly designModel: Model<DesignDocument>,
    @InjectModel(Subcategory.name)
    private readonly subcategoryModel: Model<SubcategoryDocument>,
    private readonly counters: CountersService,
  ) {}

  async create(dto: CreateDesignDto): Promise<Design> {
    const subcategory = await this.subcategoryModel.findById(dto.subcategoryId);
    if (!subcategory) throw new NotFoundException('Sub-category not found');

    // Sequence is scoped per sub-category; padded to 3 digits.
    const seq = await this.counters.next(`design:${subcategory._id.toString()}`);
    const code = `${subcategory.code}-${String(seq).padStart(3, '0')}`;

    try {
      return await this.designModel.create({
        subcategoryId: subcategory._id,
        categoryId: subcategory.categoryId,
        variantId: subcategory.variantId,
        name: dto.name,
        code,
        status: Status.ACTIVE,
        totalStock: 0,
      });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        throw new ConflictException(`Design code ${code} already exists`);
      }
      throw err;
    }
  }

  /** Flat list of all designs (optionally active-only) — used by billing. */
  async findAll(status?: Status): Promise<Design[]> {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    return this.designModel.find(filter).sort({ code: 1 }).lean();
  }

  async findBySubcategory(
    subcategoryId: string,
    status?: Status,
  ): Promise<Design[]> {
    const filter: Record<string, unknown> = { subcategoryId };
    if (status) filter.status = status;
    return this.designModel.find(filter).sort({ code: 1 }).lean();
  }

  async findOne(id: string): Promise<Design> {
    const design = await this.designModel.findById(id).lean();
    if (!design) throw new NotFoundException('Design not found');
    return design;
  }

  async getStock(id: string) {
    const design = await this.designModel
      .findById(id)
      .select('code name totalStock')
      .lean();
    if (!design) throw new NotFoundException('Design not found');
    return {
      designId: id,
      code: design.code,
      name: design.name,
      totalStock: design.totalStock,
    };
  }

  async update(id: string, dto: UpdateDesignDto): Promise<Design> {
    const design = await this.designModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!design) throw new NotFoundException('Design not found');
    return design;
  }
}