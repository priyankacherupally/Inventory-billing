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
import { SubcategoriesService } from './subcategories.service';
import { DesignsService } from '../designs/designs.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants/roles.enum';
import { Status } from '../common/constants/status.enum';

@ApiTags('catalogue')
@ApiBearerAuth()
@Controller('subcategories')
export class SubcategoriesController {
  constructor(
    private readonly subcategoriesService: SubcategoriesService,
    private readonly designsService: DesignsService,
  ) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateSubcategoryDto) {
    return this.subcategoriesService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubcategoryDto) {
    return this.subcategoriesService.update(id, dto);
  }

  // Cascading dropdown — designs under a sub-category.
  @Get(':id/designs')
  designs(@Param('id') id: string, @Query('status') status?: Status) {
    return this.designsService.findBySubcategory(id, status);
  }
}