import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Status } from '../../common/constants/status.enum';

export class UpdatePurchaseVariantDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  specificPrice?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  // Optional free-text reason captured in the price audit log.
  @IsOptional()
  @IsString()
  reason?: string;
}