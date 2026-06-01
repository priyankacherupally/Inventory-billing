import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type BillDocument = HydratedDocument<Bill>;

@Schema({ _id: false })
export class BillItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Design', required: true })
  designId: Types.ObjectId;

  @Prop({ required: true })
  designCode: string;

  @Prop({ required: true })
  designName: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  sellingPrice: number;

  // Per-item discount in ₹ (UI may capture % then convert).
  @Prop({ required: true, default: 0, min: 0 })
  discount: number;

  // (quantity × sellingPrice) − discount
  @Prop({ required: true, min: 0 })
  itemTotal: number;
}
export const BillItemSchema = SchemaFactory.createForClass(BillItem);

@Schema({ timestamps: true, collection: 'bills' })
export class Bill {
  @Prop({ required: true, unique: true })
  billNumber: string;

  @Prop({ trim: true })
  customerName?: string;

  @Prop({ trim: true })
  customerPhone?: string;

  @Prop({ type: [BillItemSchema], required: true })
  items: BillItem[];

  @Prop({ required: true, min: 0 })
  subTotal: number;

  @Prop({ required: true, default: 0, min: 0 })
  overallDiscount: number;

  @Prop({ required: true, min: 0 })
  finalAmount: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  createdBy: Types.ObjectId;
}

export const BillSchema = SchemaFactory.createForClass(Bill);
BillSchema.index({ createdAt: -1 });