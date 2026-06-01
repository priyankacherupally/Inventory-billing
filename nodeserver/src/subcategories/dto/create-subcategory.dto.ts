import { IsMongoId, IsString, Matches, MinLength } from 'class-validator';

export class CreateSubcategoryDto {
  @IsMongoId()
  categoryId: string;

  @IsString()
  @MinLength(2)
  name: string;

  // Suffix appended to the parent category code, e.g. PRT → CTN-MLM-PRT.
  @IsString()
  @Matches(/^[A-Za-z0-9]{2,6}$/, {
    message: 'Code suffix must be 2–6 letters or numbers (e.g. PRT)',
  })
  codeSuffix: string;
}