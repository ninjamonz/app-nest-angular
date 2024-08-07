import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserWithRoles, UserWithRolesAndPermissions } from './entities/user.entity';
import { AuthGuard } from '../auth/guards/auth.guard';
import { TYPES } from '../types';
import { Role, RoleWithPermissions } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { RequiredPermission } from '../auth/decorators/required-permission.decorator';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RequiredPermission(TYPES.PERMISSION.SUPERUSER)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @RequiredPermission(TYPES.PERMISSION.SUPERUSER)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(
      (user) =>
        new UserWithRoles({
          id: user.id,
          name: user.name,
          roles: user.roles.map(
            (role) =>
              new Role({
                id: role.id,
                name: role.name,
                description: role.description,
              }),
          ),
        }),
    );
  }

  @RequiredPermission(TYPES.PERMISSION.SUPERUSER)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return new UserWithRolesAndPermissions({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map(
        (role) =>
          new RoleWithPermissions({
            id: role.id,
            name: role.name,
            description: role.description,
            permissions: role.permissions.map(
              (permission) =>
                new Permission({
                  id: permission.id,
                  name: permission.name,
                  description: permission.description,
                }),
            ),
          }),
      ),
    });
  }

  @RequiredPermission(TYPES.PERMISSION.SUPERUSER)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @RequiredPermission(TYPES.PERMISSION.SUPERUSER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    if (id === process.env.SUPERUSER_ID) {
      throw new ForbiddenException(`${TYPES.PERMISSION.SUPERUSER} can't be deleted.`);
    }
    return this.usersService.remove(id);
  }
}
