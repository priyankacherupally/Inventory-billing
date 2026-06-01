import {
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePurchaseDto {
  @IsMongoId()
  supplierId: string;

  @IsMongoId()
  designId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  // Optional override of the supplier's master price. If different, it updates
  // the master price going forward and writes a price-audit entry.
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerPiece?: number;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsString()
  invoiceRef?: string;
}