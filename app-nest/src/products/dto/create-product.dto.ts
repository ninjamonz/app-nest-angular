import { IsNotEmpty, IsNumberString, IsString, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsUUID(4)
  id!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNumberString()
  salesPrice!: string;

  @IsString()
  sku!: string;

  @IsString()
  barcode!: string;
}
