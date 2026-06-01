import { IsDateString, IsOptional } from 'class-validator';

export class QueryBillDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}