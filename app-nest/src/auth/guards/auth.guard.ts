import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../drizzle.schema';
import { eq, sql } from 'drizzle-orm';
import { TYPES } from '../../types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(TYPES.DRIZZLE_TAG) private drizzle: NodePgDatabase<typeof schema>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    // VERIFY FIREBASE AUTH
    const decodedIdToken = await this.firebaseAuthVerifyIdToken(token);

    // SET USER ID INTO REQUEST
    this.addRequest(request, { [TYPES.USER_ID]: decodedIdToken.uid });

    // VERIFY USER PERMISSIONS
    const requiredPermission = this.reflector.get<string>(
      'requiredPermission',
      context.getHandler(),
    );
    if (!requiredPermission) {
      return true;
    }
    if (decodedIdToken.uid === process.env.SUPERUSER_ID) {
      return true;
    }
    const userPermissions = await this.getUserPermissions(decodedIdToken.uid);
    const isAllowed = userPermissions.includes(requiredPermission);
    return isAllowed;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async firebaseAuthVerifyIdToken(idToken: string) {
    try {
      return await getAuth().verifyIdToken(idToken, true);
    } catch (error) {
      let message = '';
      if (error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
        message = 'Your session has expired. Please sign in again.';
      } else if (error.code === 'auth/user-disabled' || error.code === 'auth/user-not-found') {
        message = 'Your account has been deleted. Please contact administrator.';
      }
      throw new UnauthorizedException(message);
    }
  }

  async getUserPermissions(userId: string) {
    const result = await this.drizzle
      .select({
        permissionName: sql<string>`distinct(${schema.permissions.name})`,
      })
      .from(schema.users)
      .innerJoin(schema.roleUser, eq(schema.users.id, schema.roleUser.userId))
      .innerJoin(schema.roles, eq(schema.roleUser.roleId, schema.roles.id))
      .innerJoin(schema.permissionRole, eq(schema.roles.id, schema.permissionRole.roleId))
      .innerJoin(schema.permissions, eq(schema.permissionRole.permissionId, schema.permissions.id))
      .where(eq(schema.users.id, userId));

    return result.map((permission) => permission.permissionName);
  }

  addRequest(request: Request, params: { [key: string]: string }) {
    for (const index of Object.keys(params)) {
      request[index] = params[index];
    }
  }
}
