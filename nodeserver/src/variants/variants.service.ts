import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Variant, VariantDocument } from './schemas/variant.schema';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { Status } from '../common/constants/status.enum';

@Injectable()
export class VariantsService {
  constructor(
    @InjectModel(Variant.name)
    private readonly variantModel: Model<VariantDocument>,
  ) {}

  async create(dto: CreateVariantDto): Promise<Variant> {
    const code = dto.code.toUpperCase().trim();
    const exists = await this.variantModel.exists({ code });
    if (exists) throw new ConflictException(`Variant code ${code} already exists`);
    return this.variantModel.create({ name: dto.name, code, status: Status.ACTIVE });
  }

  async findAll(status?: Status): Promise<Variant[]> {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    return this.variantModel.find(filter).sort({ code: 1 }).lean();
  }

  async update(id: string, dto: UpdateVariantDto): Promise<Variant> {
    const variant = await this.variantModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!variant) throw new NotFoundException('Variant not found');
    return variant;
  }
}