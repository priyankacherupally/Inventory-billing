import { IsMongoId, IsString, Matches, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsMongoId()
  variantId: string;

  @IsString()
  @MinLength(2)
  name: string;

  // Suffix appended to the parent variant code, e.g. MLM → CTN-MLM.
  @IsString()
  @Matches(/^[A-Za-z0-9]{2,6}$/, {
    message: 'Code suffix must be 2–6 letters or numbers (e.g. MLM)',
  })
  codeSuffix: string;
}