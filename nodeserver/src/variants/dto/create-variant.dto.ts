import { IsString, Matches, MinLength } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @MinLength(2)
  name: string;

  // Short code e.g. CTN — letters/numbers, 2–6 chars. Stored uppercase.
  @IsString()
  @Matches(/^[A-Za-z0-9]{2,6}$/, {
    message: 'Code must be 2–6 letters or numbers (e.g. CTN)',
  })
  code: string;
}