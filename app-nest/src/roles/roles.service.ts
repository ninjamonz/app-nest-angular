import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { NodePgDatabase, NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import * as schema from '../../drizzle.schema';
import { ExtractTablesWithRelations, asc, eq, inArray } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { TYPES } from '../types';
import { trim } from '../_common/helpers/trim';

@Injectable()
export class RolesService {
  constructor(@Inject(TYPES.DRIZZLE_TAG) private drizzle: NodePgDatabase<typeof schema>) {}

  async create(createRoleDto: CreateRoleDto) {
    await this.drizzle.transaction(async (tx) => {
      try {
        // INSERTING ROLES
        await tx.insert(schema.roles).values({
          id: createRoleDto.id,
          name: trim(createRoleDto.name).toUpperCase(),
          description: createRoleDto.description,
        });

        // INSERTING JOIN TABLE
        if (createRoleDto.permissionsName.length) {
          await this.insertPermissionRole(tx, createRoleDto);
        }
      } catch (error) {
        this.errorHandle(error);
      }
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    await this.drizzle.transaction(async (tx) => {
      try {
        // VALIDATING ROLES
        await this.findOne(id);
        // UPDATING ROLES
        await tx
          .update(schema.roles)
          .set({
            name: trim(updateRoleDto.name).toUpperCase(),
            description: updateRoleDto.description,
          })
          .where(eq(schema.roles.id, id));

        // RESETTING JOIN TABLE
        await tx.delete(schema.permissionRole).where(eq(schema.permissionRole.roleId, id));

        // INSERTING JOIN TABLE
        if (updateRoleDto.permissionsName.length) {
          await this.insertPermissionRole(tx, updateRoleDto, id);
        }
      } catch (error) {
        this.errorHandle(error);
      }
    });
  }

  async remove(id: string) {
    await this.drizzle.transaction(async (tx) => {
      // VALIDATING ROLES
      await this.findOne(id);
      // RESETTING JOIN TABLE
      await tx.delete(schema.permissionRole).where(eq(schema.permissionRole.roleId, id));
      await tx.delete(schema.roleUser).where(eq(schema.roleUser.roleId, id));
      // DELETING ROLES
      await tx.delete(schema.roles).where(eq(schema.roles.id, id));
    });
  }

  private async insertPermissionRole(
    tx: PgTransaction<
      NodePgQueryResultHKT,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >,
    dto: CreateRoleDto | UpdateRoleDto,
    id?: string,
  ) {
    // VALIDATING JOIN TABLE
    const existsPermissions = await tx
      .select()
      .from(schema.permissions)
      .where(inArray(schema.permissions.name, dto.permissionsName));
    if (existsPermissions.length < dto.permissionsName.length) {
      for (const permissionName of dto.permissionsName) {
        const found = existsPermissions.find((permission) => permission.name === permissionName);
        if (!found) {
          throw new NotFoundException(permissionName);
        }
      }
    }
    // INSERTING JOIN TABLE
    const permissionRole = existsPermissions.map((permission) => ({
      roleId: id ? id : (dto as CreateRoleDto).id,
      permissionId: permission.id,
    }));
    await tx.insert(schema.permissionRole).values(permissionRole);
  }

  private errorHandle(error: any) {
    if (error.code === '23505') {
      switch (error.constraint) {
        case 'roles_name_unique':
          throw new ConflictException('Duplicated name.', 'name_unique');
      }
      throw new ConflictException();
    }
    throw error;
  }

  // --------------------------- QUERY --------------------------- //

  async findOne(id: string) {
    const result = await this.drizzle.query.roles.findFirst({
      where: eq(schema.roles.id, id),
      with: {
        permissionRoles: {
          with: {
            permission: true,
          },
        },
      },
    });
    if (!result) {
      throw new NotFoundException();
    }

    return {
      ...result,
      permissions: result.permissionRoles.map(({ permission }) => permission),
    };
  }

  async findAll() {
    const result = await this.drizzle.query.roles.findMany({
      orderBy: asc(schema.roles.name),
    });
    return result;
  }
}
