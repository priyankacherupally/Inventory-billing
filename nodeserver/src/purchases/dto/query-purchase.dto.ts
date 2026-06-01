import { IsDateString, IsMongoId, IsOptional } from 'class-validator';

export class QueryPurchaseDto {
  @IsOptional()
  @IsMongoId()
  supplierId?: string;

  @IsOptional()
  @IsMongoId()
  designId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}