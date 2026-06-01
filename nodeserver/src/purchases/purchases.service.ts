import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { StockBatch, StockBatchDocument } from './schemas/stock-batch.schema';
import { Design, DesignDocument } from '../designs/schemas/design.schema';
import { SuppliersService } from '../suppliers/suppliers.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { QueryPurchaseDto } from './dto/query-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Purchase.name)
    private readonly purchaseModel: Model<PurchaseDocument>,
    @InjectModel(StockBatch.name)
    private readonly stockBatchModel: Model<StockBatchDocument>,
    @InjectModel(Design.name)
    private readonly designModel: Model<DesignDocument>,
    private readonly suppliersService: SuppliersService,
  ) {}

  /**
   * Records a stock-IN. Ordered writes (no transaction on standalone Mongo):
   * resolve price (audits master if edited) → purchase doc → stock batch →
   * increment design.totalStock.
   */
  async create(dto: CreatePurchaseDto, userId: string): Promise<Purchase> {
    const { price, designCode } = await this.suppliersService.resolvePurchasePrice(
      dto.supplierId,
      dto.designId,
      dto.pricePerPiece,
      userId,
    );

    const purchaseDate = dto.purchaseDate ? new Date(dto.purchaseDate) : new Date();
    const totalValue = dto.quantity * price;

    const purchase = await this.purchaseModel.create({
      supplierId: dto.supplierId,
      designId: dto.designId,
      designCode,
      quantity: dto.quantity,
      pricePerPiece: price,
      totalValue,
      purchaseDate,
      invoiceRef: dto.invoiceRef,
      createdBy: userId,
    });

    await this.stockBatchModel.create({
      designId: dto.designId,
      supplierId: dto.supplierId,
      purchaseId: purchase._id,
      quantity: dto.quantity,
      initialQuantity: dto.quantity,
      pricePerPiece: price,
      purchaseDate,
    });

    await this.designModel.updateOne(
      { _id: dto.designId },
      { $inc: { totalStock: dto.quantity } },
    );

    return this.findOne(purchase._id.toString());
  }

  async findAll(query: QueryPurchaseDto): Promise<Purchase[]> {
    const filter: Record<string, unknown> = {};
    if (query.supplierId) filter.supplierId = query.supplierId;
    if (query.designId) filter.designId = query.designId;
    if (query.startDate || query.endDate) {
      const range: Record<string, Date> = {};
      if (query.startDate) range.$gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        range.$lte = end;
      }
      filter.purchaseDate = range;
    }
    return this.purchaseModel
      .find(filter)
      .sort({ purchaseDate: -1, createdAt: -1 })
      .populate('supplierId', 'name')
      .populate('createdBy', 'name username')
      .lean();
  }

  async findOne(id: string): Promise<Purchase> {
    const purchase = await this.purchaseModel
      .findById(id)
      .populate('supplierId', 'name')
      .populate('createdBy', 'name username')
      .lean();
    if (!purchase) throw new NotFoundException('Purchase not found');
    return purchase;
  }
}