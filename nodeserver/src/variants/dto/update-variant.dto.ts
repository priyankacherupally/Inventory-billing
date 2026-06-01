import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Status } from '../../common/constants/status.enum';

// Code is immutable — only name and status can change.
export class UpdateVariantDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}