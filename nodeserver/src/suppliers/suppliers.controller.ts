import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { AddPurchaseVariantDto } from './dto/add-purchase-variant.dto';
import { UpdatePurchaseVariantDto } from './dto/update-purchase-variant.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/constants/roles.enum';
import { Status } from '../common/constants/status.enum';

@ApiTags('suppliers')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAll(@Query('status') status?: Status) {
    return this.suppliersService.findAll(status);
  }

  @Post()
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Post(':id/purchase-variants')
  addPurchaseVariant(
    @Param('id') id: string,
    @Body() dto: AddPurchaseVariantDto,
  ) {
    return this.suppliersService.addPurchaseVariant(id, dto);
  }

  @Patch(':id/purchase-variants/:pvId')
  updatePurchaseVariant(
    @Param('id') id: string,
    @Param('pvId') pvId: string,
    @Body() dto: UpdatePurchaseVariantDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.suppliersService.updatePurchaseVariant(id, pvId, dto, userId);
  }

  @Get(':id/audit-log')
  auditLog(@Param('id') id: string) {
    return this.suppliersService.getAuditLog(id);
  }
}