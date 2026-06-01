import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Status } from '../../common/constants/status.enum';

export type DesignDocument = HydratedDocument<Design>;

@Schema({ timestamps: true, collection: 'designs' })
export class Design {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Subcategory',
    required: true,
    index: true,
  })
  subcategoryId: Types.ObjectId;

  // Denormalised for fast filtering / cascading queries.
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Variant', required: true })
  variantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  // Auto-generated unique SKU, e.g. CTN-MLM-PRT-001. Immutable.
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, enum: Object.values(Status), default: Status.ACTIVE })
  status: Status;

  // Cached sum of stock across all suppliers/batches. Reconciled from ledger.
  @Prop({ required: true, default: 0, min: 0 })
  totalStock: number;
}

export const DesignSchema = SchemaFactory.createForClass(Design);
DesignSchema.index({ variantId: 1, categoryId: 1, subcategoryId: 1 });