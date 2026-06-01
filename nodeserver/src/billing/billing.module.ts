import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { Bill, BillSchema } from './schemas/bill.schema';
import { Design, DesignSchema } from '../designs/schemas/design.schema';
import { PurchasesModule } from '../purchases/purchases.module';
import { CountersModule } from '../counters/counters.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bill.name, schema: BillSchema },
      { name: Design.name, schema: DesignSchema },
    ]),
    PurchasesModule, // provides StockBatch model
    CountersModule,
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}