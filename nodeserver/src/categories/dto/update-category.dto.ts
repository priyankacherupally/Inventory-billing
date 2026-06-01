import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Status } from '../../common/constants/status.enum';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}