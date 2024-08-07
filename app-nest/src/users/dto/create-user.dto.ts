import { ArrayUnique, IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsUUID(4)
  id!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString({ each: true })
  @ArrayUnique()
  rolesName!: string[];
}
