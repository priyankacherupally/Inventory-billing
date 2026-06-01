import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Status } from '../../common/constants/status.enum';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true, collection: 'categories' })
export class Category {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Variant',
    required: true,
    index: true,
  })
  variantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  // Full code prefixed with parent variant code, e.g. CTN-MLM. Unique, immutable.
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, enum: Object.values(Status), default: Status.ACTIVE })
  status: Status;
}

export const CategorySchema = SchemaFactory.createForClass(Category);