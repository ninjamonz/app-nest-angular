import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  async findAll() {
    const permissions = await this.permissionsService.findAll();
    return permissions.map(
      (permission) =>
        new Permission({
          id: permission.id,
          name: permission.name,
          description: permission.description,
        }),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const permission = await this.permissionsService.findOne(id);
    return new Permission({
      id: permission.id,
      name: permission.name,
      description: permission.description,
    });
  }
}
