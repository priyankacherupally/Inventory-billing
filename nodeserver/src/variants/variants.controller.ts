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
import { VariantsService } from './variants.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants/roles.enum';
import { Status } from '../common/constants/status.enum';

@ApiTags('catalogue')
@ApiBearerAuth()
@Controller('variants')
export class VariantsController {
  constructor(
    private readonly variantsService: VariantsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  findAll(@Query('status') status?: Status) {
    return this.variantsService.findAll(status);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateVariantDto) {
    return this.variantsService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVariantDto) {
    return this.variantsService.update(id, dto);
  }

  // Cascading dropdown — categories under a variant.
  @Get(':id/categories')
  categories(@Param('id') id: string, @Query('status') status?: Status) {
    return this.categoriesService.findByVariant(id, status);
  }
}