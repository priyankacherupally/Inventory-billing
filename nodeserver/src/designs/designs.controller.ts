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
import { DesignsService } from './designs.service';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants/roles.enum';
import { Status } from '../common/constants/status.enum';

@ApiTags('catalogue')
@ApiBearerAuth()
@Controller('designs')
export class DesignsController {
  constructor(private readonly designsService: DesignsService) {}

  // Flat list (all roles) — used by the billing design picker.
  @Get()
  findAll(@Query('status') status?: Status) {
    return this.designsService.findAll(status);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateDesignDto) {
    return this.designsService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDesignDto) {
    return this.designsService.update(id, dto);
  }

  @Get(':id/stock')
  stock(@Param('id') id: string) {
    return this.designsService.getStock(id);
  }
}