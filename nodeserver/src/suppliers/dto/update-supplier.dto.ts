import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Status } from '../../common/constants/status.enum';

export class UpdateSupplierDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  address?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}