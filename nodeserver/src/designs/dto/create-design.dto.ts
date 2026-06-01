import { IsMongoId, IsString, MinLength } from 'class-validator';

export class CreateDesignDto {
  @IsMongoId()
  subcategoryId: string;

  // Human label e.g. "Rose Print". The code (e.g. CTN-MLM-PRT-001) is auto-generated.
  @IsString()
  @MinLength(2)
  name: string;
}