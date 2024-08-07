import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NodePgDatabase, NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import * as schema from '../../drizzle.schema';
import { ExtractTablesWithRelations, asc, eq, inArray } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { TYPES } from '../types';
import { FirebaseAuthError, getAuth } from 'firebase-admin/auth';
import { trim } from '../_common/helpers/trim';

@Injectable()
export class UsersService {
  constructor(@Inject(TYPES.DRIZZLE_TAG) private drizzle: NodePgDatabase<typeof schema>) {}

  async create(createUserDto: CreateUserDto) {
    await this.drizzle.transaction(async (tx) => {
      try {
        // INSERTING USERS
        await tx.insert(schema.users).values({
          id: createUserDto.id,
          name: trim(createUserDto.name),
        });

        // INSERTING JOIN TABLE
        if (createUserDto.rolesName.length) {
          await this.insertRoleUser(tx, createUserDto);
        }

        // FIREBASE
        await getAuth().createUser({
          uid: createUserDto.id,
          email: createUserDto.email,
        });
      } catch (error) {
        this.errorHandle(error);
      }
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.drizzle.transaction(async (tx) => {
      try {
        // VALIDATING USERS
        const user = await this.findOne(id);
        // UPDATING USERS
        await tx
          .update(schema.users)
          .set({
            name: trim(updateUserDto.name),
          })
          .where(eq(schema.users.id, id));

        // RESETTING JOIN TABLE
        await tx.delete(schema.roleUser).where(eq(schema.roleUser.userId, id));

        // INSERTING JOIN TABLE
        if (updateUserDto.rolesName.length) {
          await this.insertRoleUser(tx, updateUserDto, id);
        }

        // FIREBASE
        if (updateUserDto.email !== user.email) {
          await this.firebaseUpdateEmailAddress(id, updateUserDto.email);
        }
      } catch (error) {
        this.errorHandle(error);
      }
    });
  }

  async remove(id: string) {
    await this.drizzle.transaction(async (tx) => {
      try {
        // VALIDATING USERS
        await this.findOne(id);
        // RESETTING JOIN TABLE
        await tx.delete(schema.roleUser).where(eq(schema.roleUser.userId, id));
        // DELETING USERS
        await tx.delete(schema.users).where(eq(schema.users.id, id));

        // FIREBASE
        await getAuth().deleteUser(id);
      } catch (error) {
        this.errorHandle(error);
      }
    });
  }

  private async insertRoleUser(
    tx: PgTransaction<
      NodePgQueryResultHKT,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >,
    dto: CreateUserDto | UpdateUserDto,
    id?: string,
  ) {
    // VALIDATING JOIN TABLE
    const existsRoles = await tx
      .select()
      .from(schema.roles)
      .where(inArray(schema.roles.name, dto.rolesName));
    if (existsRoles.length < dto.rolesName.length) {
      for (const roleName of dto.rolesName) {
        const found = existsRoles.find((role) => role.name === roleName);
        if (!found) {
          throw new NotFoundException(roleName);
        }
      }
    }
    // INSERTING JOIN TABLE
    const roleUser = existsRoles.map((role) => ({
      userId: id ? id : (dto as CreateUserDto).id,
      roleId: role.id,
    }));
    await tx.insert(schema.roleUser).values(roleUser);
  }

  private async firebaseUpdateEmailAddress(id: string, emailAddress: string) {
    await getAuth().updateUser(id, {
      providersToUnlink: ['google.com'],
    });
    await getAuth().updateUser(id, {
      email: emailAddress,
    });
  }

  private errorHandle(error: any) {
    if (error instanceof FirebaseAuthError) {
      throw new InternalServerErrorException(error.message);
    }
    throw error;
  }

  // --------------------------- QUERY --------------------------- //

  async findOne(id: string) {
    const result = await this.drizzle.query.users.findFirst({
      where: eq(schema.users.id, id),
      with: {
        roleUsers: {
          with: {
            role: {
              with: {
                permissionRoles: {
                  with: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!result) {
      throw new NotFoundException();
    }

    return {
      ...result,
      email: (await this.getFirebaseUser(result.id)).email,
      roles: result.roleUsers.map(({ role }) => ({
        ...role,
        permissions: role.permissionRoles.map(({ permission }) => permission),
      })),
    };
  }

  async findAll() {
    const result = await this.drizzle.query.users.findMany({
      orderBy: asc(schema.users.name),
      with: {
        roleUsers: {
          with: {
            role: true,
          },
        },
      },
    });
    return result.map((user) => ({
      ...user,
      roles: user.roleUsers.map(({ role }) => role),
    }));
  }

  private getFirebaseUser(userId: string) {
    try {
      return getAuth().getUser(userId);
    } catch (error) {
      this.errorHandle(error);
    }
  }
}
