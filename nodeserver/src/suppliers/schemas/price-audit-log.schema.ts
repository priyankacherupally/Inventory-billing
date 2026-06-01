import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type PriceAuditLogDocument = HydratedDocument<PriceAuditLog>;

/**
 * Append-only record of supplier-specific price changes. No update/delete is
 * exposed anywhere — writes happen only inside SuppliersService on price edits.
 */
@Schema({ timestamps: true, collection: 'price_audit_logs' })
export class PriceAuditLog {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
    index: true,
  })
  supplierId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Design', required: true })
  designId: Types.ObjectId;

  @Prop({ required: true })
  designCode: string;

  @Prop({ required: true })
  oldPrice: number;

  @Prop({ required: true })
  newPrice: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  changedBy: Types.ObjectId;

  @Prop()
  reason?: string;
}

export const PriceAuditLogSchema = SchemaFactory.createForClass(PriceAuditLog);