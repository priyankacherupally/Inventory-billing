import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { Supplier, SupplierSchema } from './schemas/supplier.schema';
import {
  PriceAuditLog,
  PriceAuditLogSchema,
} from './schemas/price-audit-log.schema';
import { Design, DesignSchema } from '../designs/schemas/design.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
      { name: PriceAuditLog.name, schema: PriceAuditLogSchema },
      { name: Design.name, schema: DesignSchema },
    ]),
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}