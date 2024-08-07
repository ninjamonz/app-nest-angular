import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { UserWithRolesAndPermissions } from '../users/entities/user.entity';
import { RoleWithPermissions } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Request } from 'express';
import { TYPES } from '../types';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('info')
  async info(@Req() req: Request) {
    const user = await this.usersService.findOne(req[TYPES.USER_ID]);
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
}
