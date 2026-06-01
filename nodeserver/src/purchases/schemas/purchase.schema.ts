import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type PurchaseDocument = HydratedDocument<Purchase>;

/** Immutable record of one stock-IN event. */
@Schema({ timestamps: true, collection: 'purchases' })
export class Purchase {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
    index: true,
  })
  supplierId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Design',
    required: true,
    index: true,
  })
  designId: Types.ObjectId;

  @Prop({ required: true })
  designCode: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  pricePerPiece: number;

  @Prop({ required: true, min: 0 })
  totalValue: number;

  @Prop({ required: true, index: true })
  purchaseDate: Date;

  @Prop()
  invoiceRef?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);