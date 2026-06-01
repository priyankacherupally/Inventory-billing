import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type StockBatchDocument = HydratedDocument<StockBatch>;

/**
 * Batch-level stock ledger. Each purchase creates one batch carrying its
 * purchaseDate; billing decrements `quantity` oldest-first (FIFO). This is the
 * source of truth for stock; designs.totalStock is a cached sum.
 */
@Schema({ timestamps: true, collection: 'stock_ledger' })
export class StockBatch {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Design',
    required: true,
    index: true,
  })
  designId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Supplier', required: true })
  supplierId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Purchase', required: true })
  purchaseId: Types.ObjectId;

  // Remaining units in this batch (decremented FIFO on billing).
  @Prop({ required: true, min: 0 })
  quantity: number;

  // Original units received (immutable, for reference).
  @Prop({ required: true, min: 0 })
  initialQuantity: number;

  @Prop({ required: true, min: 0 })
  pricePerPiece: number;

  @Prop({ required: true })
  purchaseDate: Date;
}

export const StockBatchSchema = SchemaFactory.createForClass(StockBatch);
// FIFO consumption queries: oldest batch for a design with stock remaining.
StockBatchSchema.index({ designId: 1, purchaseDate: 1 });