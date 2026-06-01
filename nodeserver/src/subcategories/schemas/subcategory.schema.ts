import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Status } from '../../common/constants/status.enum';

export type SubcategoryDocument = HydratedDocument<Subcategory>;

@Schema({ timestamps: true, collection: 'subcategories' })
export class Subcategory {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  })
  categoryId: Types.ObjectId;

  // Denormalised for fast filtering up the tree.
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Variant', required: true })
  variantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  // Full code, e.g. CTN-MLM-PRT. Unique, immutable.
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, enum: Object.values(Status), default: Status.ACTIVE })
  status: Status;
}

export const SubcategorySchema = SchemaFactory.createForClass(Subcategory);