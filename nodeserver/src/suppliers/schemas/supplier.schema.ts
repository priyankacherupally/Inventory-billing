import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Status } from '../../common/constants/status.enum';

export type SupplierDocument = HydratedDocument<Supplier>;

// Embedded sub-document: a design this supplier provides + its purchase price.
@Schema({ _id: true, timestamps: false })
export class PurchaseVariant {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Design', required: true })
  designId: Types.ObjectId;

  // Denormalised for display (e.g. CTN-MLM-PRT-001).
  @Prop({ required: true })
  designCode: string;

  @Prop({ required: true, min: 0 })
  specificPrice: number;

  @Prop({ required: true, enum: Object.values(Status), default: Status.ACTIVE })
  status: Status;

  @Prop({ required: true, default: () => new Date() })
  effectiveFrom: Date;
}
export const PurchaseVariantSchema =
  SchemaFactory.createForClass(PurchaseVariant);

@Schema({ timestamps: true, collection: 'suppliers' })
export class Supplier {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  address: string;

  @Prop({ trim: true })
  contact?: string;

  @Prop({ required: true, enum: Object.values(Status), default: Status.ACTIVE })
  status: Status;

  @Prop({ type: [PurchaseVariantSchema], default: [] })
  purchaseVariants: PurchaseVariant[];
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);