import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { Purchase, PurchaseSchema } from './schemas/purchase.schema';
import { StockBatch, StockBatchSchema } from './schemas/stock-batch.schema';
import { Design, DesignSchema } from '../designs/schemas/design.schema';
import { SuppliersModule } from '../suppliers/suppliers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
      { name: StockBatch.name, schema: StockBatchSchema },
      { name: Design.name, schema: DesignSchema },
    ]),
    SuppliersModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService, MongooseModule],
})
export class PurchasesModule {}