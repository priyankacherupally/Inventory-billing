import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { Bill, BillDocument } from './schemas/bill.schema';
import { Design, DesignDocument } from '../designs/schemas/design.schema';
import {
  StockBatch,
  StockBatchDocument,
} from '../purchases/schemas/stock-batch.schema';
import { CountersService } from '../counters/counters.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { QueryBillDto } from './dto/query-bill.dto';
import { UserRole } from '../common/constants/roles.enum';

@Injectable()
export class BillingService {
  constructor(
    @InjectModel(Bill.name) private readonly billModel: Model<BillDocument>,
    @InjectModel(Design.name)
    private readonly designModel: Model<DesignDocument>,
    @InjectModel(StockBatch.name)
    private readonly stockBatchModel: Model<StockBatchDocument>,
    private readonly counters: CountersService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateBillDto, userId: string): Promise<Bill> {
    // Aggregate requested quantity per design (a design may appear twice).
    const requested = new Map<string, number>();
    for (const item of dto.items) {
      requested.set(
        item.designId,
        (requested.get(item.designId) || 0) + item.quantity,
      );
    }

    const designs = await this.designModel
      .find({ _id: { $in: [...requested.keys()] } })
      .lean();
    const designMap = new Map(designs.map((d) => [d._id.toString(), d]));

    // Hard-block: reject the whole bill if any design lacks stock.
    const shortfalls: Array<{
      designId: string;
      designCode?: string;
      requested: number;
      available: number;
    }> = [];
    for (const [designId, qty] of requested) {
      const design = designMap.get(designId);
      if (!design) {
        shortfalls.push({ designId, requested: qty, available: 0 });
        continue;
      }
      if (design.totalStock < qty) {
        shortfalls.push({
          designId,
          designCode: design.code,
          requested: qty,
          available: design.totalStock,
        });
      }
    }
    if (shortfalls.length) {
      throw new UnprocessableEntityException({
        message: 'Insufficient stock for one or more items',
        shortfalls,
      });
    }

    // Build items with denormalised code/name + computed totals.
    const items = dto.items.map((item) => {
      const design = designMap.get(item.designId)!;
      const discount = item.discount || 0;
      const itemTotal = Math.max(0, item.quantity * item.sellingPrice - discount);
      return {
        designId: item.designId,
        designCode: design.code,
        designName: design.name,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
        discount,
        itemTotal,
      };
    });

    const subTotal = items.reduce((sum, i) => sum + i.itemTotal, 0);
    const overallDiscount = dto.overallDiscount || 0;
    const finalAmount = Math.max(0, subTotal - overallDiscount);

    const year = new Date().getFullYear();
    const seq = await this.counters.next(`bill:${year}`);
    const billNumber = `BILL-${year}-${String(seq).padStart(5, '0')}`;

    const bill = await this.billModel.create({
      billNumber,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      items,
      subTotal,
      overallDiscount,
      finalAmount,
      createdBy: userId,
    });

    // Decrement stock FIFO (ordered writes; no txn on standalone Mongo).
    for (const [designId, qty] of requested) {
      await this.consumeStockFifo(designId, qty);
      await this.designModel.updateOne(
        { _id: designId },
        { $inc: { totalStock: -qty } },
      );
    }

    return this.findOne(bill._id.toString());
  }

  /** Consume `qty` from the oldest stock batches first (FIFO by purchaseDate). */
  private async consumeStockFifo(designId: string, qty: number): Promise<void> {
    let remaining = qty;
    const batches = await this.stockBatchModel
      .find({ designId, quantity: { $gt: 0 } })
      .sort({ purchaseDate: 1, createdAt: 1 });
    for (const batch of batches) {
      if (remaining <= 0) break;
      const take = Math.min(batch.quantity, remaining);
      batch.quantity -= take;
      remaining -= take;
      await batch.save();
    }
  }

  async findAll(query: QueryBillDto, user: { sub: string; role: string }) {
    const filter: Record<string, unknown> = {};
    // Billing executives only see their own bills; admins see all.
    if (user.role === UserRole.BILLING_EXECUTIVE) filter.createdBy = user.sub;
    if (query.startDate || query.endDate) {
      const range: Record<string, Date> = {};
      if (query.startDate) range.$gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        range.$lte = end;
      }
      filter.createdAt = range;
    }
    return this.billModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name username')
      .lean();
  }

  async findOne(id: string): Promise<Bill> {
    const bill = await this.billModel
      .findById(id)
      .populate('createdBy', 'name username')
      .lean();
    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }

  /** Bill + shop header (from env) for the print templates. */
  async getPrintData(id: string) {
    const bill = await this.findOne(id);
    return {
      shop: {
        name: this.config.get<string>('SHOP_NAME', 'My Saree House'),
        address: this.config.get<string>('SHOP_ADDRESS', ''),
        phone: this.config.get<string>('SHOP_PHONE', ''),
      },
      bill,
    };
  }
}