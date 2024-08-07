import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role, RoleWithPermissions } from './entities/role.entity';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Permission } from '../permissions/entities/permission.entity';
import { RequiredPermission } from '../auth/decorators/required-permission.decorator';
import { TYPES } from '../types';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @RequiredPermission(TYPES.PERMISSION.SUPERUSER)
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @RequiredPermission(TYPES.PERMISSION.SUPERUSER)
  @Get()
  async findAll() {
    const roles = await this.rolesService.findAll();
    return roles.map(
      (role) =>
        new Role({
          id: role.id,
          name: role.name,
          description: role.description,
        }),
    );
  }

  @RequiredPermission(TYPES.PERMISSION.SUPERUSER)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const role = await this.rolesService.findOne(id);
    return new RoleWithPermissions({
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
    });
  }

  @RequiredPermission(TYPES.PERMISSION.SUPERUSER)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @RequiredPermission(TYPES.PERMISSION.SUPERUSER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
