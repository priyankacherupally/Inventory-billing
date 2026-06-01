import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Supplier,
  SupplierDocument,
  PurchaseVariant,
} from './schemas/supplier.schema';
import {
  PriceAuditLog,
  PriceAuditLogDocument,
} from './schemas/price-audit-log.schema';
import { Design, DesignDocument } from '../designs/schemas/design.schema';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { AddPurchaseVariantDto } from './dto/add-purchase-variant.dto';
import { UpdatePurchaseVariantDto } from './dto/update-purchase-variant.dto';
import { Status } from '../common/constants/status.enum';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
    @InjectModel(PriceAuditLog.name)
    private readonly auditModel: Model<PriceAuditLogDocument>,
    @InjectModel(Design.name)
    private readonly designModel: Model<DesignDocument>,
  ) {}

  create(dto: CreateSupplierDto): Promise<Supplier> {
    return this.supplierModel.create({ ...dto, status: Status.ACTIVE });
  }

  findAll(status?: Status): Promise<Supplier[]> {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    return this.supplierModel.find(filter).sort({ name: 1 }).lean();
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierModel.findById(id).lean();
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.supplierModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async addPurchaseVariant(
    id: string,
    dto: AddPurchaseVariantDto,
  ): Promise<Supplier> {
    const supplier = await this.supplierModel.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    const design = await this.designModel.findById(dto.designId).lean();
    if (!design) throw new NotFoundException('Design not found');

    const already = supplier.purchaseVariants.some(
      (pv) => pv.designId.toString() === dto.designId,
    );
    if (already) {
      throw new ConflictException(
        'This supplier already supplies that design',
      );
    }

    supplier.purchaseVariants.push({
      designId: design._id,
      designCode: design.code,
      specificPrice: dto.specificPrice,
      status: Status.ACTIVE,
      effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
    } as Supplier['purchaseVariants'][number]);

    await supplier.save();
    return supplier.toObject();
  }

  async updatePurchaseVariant(
    id: string,
    pvId: string,
    dto: UpdatePurchaseVariantDto,
    changedBy: string,
  ): Promise<Supplier> {
    const supplier = await this.supplierModel.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    const pv = (
      supplier.purchaseVariants as Types.DocumentArray<PurchaseVariant>
    ).id(pvId);
    if (!pv) throw new NotFoundException('Purchase variant not found');

    // Price change → write an audit entry, then apply (ordered writes; no txn
    // on standalone Mongo — see project notes).
    if (
      dto.specificPrice !== undefined &&
      dto.specificPrice !== pv.specificPrice
    ) {
      await this.auditModel.create({
        supplierId: supplier._id,
        designId: pv.designId,
        designCode: pv.designCode,
        oldPrice: pv.specificPrice,
        newPrice: dto.specificPrice,
        changedBy,
        reason: dto.reason,
      });
      pv.specificPrice = dto.specificPrice;
      pv.effectiveFrom = new Date();
    }

    if (dto.status) pv.status = dto.status;

    await supplier.save();
    return supplier.toObject();
  }

  /**
   * Used by the purchase flow. Validates the supplier supplies the design and
   * returns the price to use. If `enteredPrice` differs from the supplier's
   * master price, it updates the master price going forward AND writes an audit
   * entry (per decision: edit-at-purchase updates master + audits).
   */
  async resolvePurchasePrice(
    supplierId: string,
    designId: string,
    enteredPrice: number | undefined,
    changedBy: string,
  ): Promise<{ price: number; designCode: string }> {
    const supplier = await this.supplierModel.findById(supplierId);
    if (!supplier) throw new NotFoundException('Supplier not found');
    if (supplier.status !== Status.ACTIVE) {
      throw new BadRequestException('Supplier is inactive');
    }

    const pv = (
      supplier.purchaseVariants as Types.DocumentArray<PurchaseVariant>
    ).find(
      (p) => p.designId.toString() === designId && p.status === Status.ACTIVE,
    );
    if (!pv) {
      throw new BadRequestException(
        'This supplier does not supply the selected design',
      );
    }

    let price = pv.specificPrice;
    if (
      enteredPrice !== undefined &&
      enteredPrice !== null &&
      enteredPrice !== pv.specificPrice
    ) {
      await this.auditModel.create({
        supplierId: supplier._id,
        designId: pv.designId,
        designCode: pv.designCode,
        oldPrice: pv.specificPrice,
        newPrice: enteredPrice,
        changedBy,
        reason: 'Updated during purchase entry',
      });
      pv.specificPrice = enteredPrice;
      pv.effectiveFrom = new Date();
      await supplier.save();
      price = enteredPrice;
    }

    return { price, designCode: pv.designCode };
  }

  async getAuditLog(id: string): Promise<PriceAuditLog[]> {
    return this.auditModel
      .find({ supplierId: id })
      .sort({ createdAt: -1 })
      .populate('changedBy', 'name username')
      .lean();
  }
}