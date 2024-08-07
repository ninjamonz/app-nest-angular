import { Transform } from 'class-transformer';
import { IsOptional, IsPositive, IsString, Max } from 'class-validator';

export class CursorPaginationDto {
  @Max(100)
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  after?: string;

  @IsString()
  @IsOptional()
  before?: string;
}
