import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { QueryBillDto } from './dto/query-bill.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/decorators/current-user.decorator';

// No @Roles — accessible to both Admin and Billing Executive.
@ApiTags('billing')
@ApiBearerAuth()
@Controller('bills')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  create(@Body() dto: CreateBillDto, @CurrentUser('sub') userId: string) {
    return this.billingService.create(dto, userId);
  }

  @Get()
  findAll(@Query() query: QueryBillDto, @CurrentUser() user: JwtUser) {
    return this.billingService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Get(':id/print')
  print(@Param('id') id: string) {
    return this.billingService.getPrintData(id);
  }
}