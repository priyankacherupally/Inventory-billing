import {
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class AddPurchaseVariantDto {
  @IsMongoId()
  designId: string;

  @IsNumber()
  @Min(0)
  specificPrice: number;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;
}