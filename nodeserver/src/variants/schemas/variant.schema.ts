import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Status } from '../../common/constants/status.enum';

export type VariantDocument = HydratedDocument<Variant>;

@Schema({ timestamps: true, collection: 'variants' })
export class Variant {
  @Prop({ required: true, trim: true })
  name: string;

  // Short code e.g. CTN — unique, uppercase, immutable after creation.
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, enum: Object.values(Status), default: Status.ACTIVE })
  status: Status;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);