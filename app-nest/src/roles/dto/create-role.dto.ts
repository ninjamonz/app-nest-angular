import { ArrayUnique, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateRoleDto {
  @IsUUID(4)
  id!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsString({ each: true })
  @ArrayUnique()
  permissionsName!: string[];
}
