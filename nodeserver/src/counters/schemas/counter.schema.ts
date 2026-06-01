import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CounterDocument = HydratedDocument<Counter>;

/**
 * Generic atomic sequence store. One doc per logical sequence keyed by `_id`
 * (e.g. "design:<subcategoryId>" or "bill:2026"). Incremented via $inc so
 * concurrent callers never collide on the same number.
 */
@Schema({ collection: 'counters' })
export class Counter {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, default: 0 })
  seq: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);