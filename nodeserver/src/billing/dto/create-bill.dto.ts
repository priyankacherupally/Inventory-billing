import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class BillItemDto {
  @IsMongoId()
  designId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  sellingPrice: number;

  // Per-item discount in ₹ (already converted from % by the client if needed).
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class CreateBillDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BillItemDto)
  items: BillItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  overallDiscount?: number;
}