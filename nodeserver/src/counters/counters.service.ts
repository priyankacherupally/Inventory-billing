import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Counter, CounterDocument } from './schemas/counter.schema';

@Injectable()
export class CountersService {
  constructor(
    @InjectModel(Counter.name)
    private readonly counterModel: Model<CounterDocument>,
  ) {}

  /** Atomically increment and return the next value for the given key. */
  async next(key: string): Promise<number> {
    const doc = await this.counterModel.findByIdAndUpdate(
      key,
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    return doc.seq;
  }
}