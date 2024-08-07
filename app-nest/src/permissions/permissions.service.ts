import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../drizzle.schema';
import { asc, eq } from 'drizzle-orm';
import { TYPES } from '../types';

@Injectable()
export class PermissionsService {
  constructor(@Inject(TYPES.DRIZZLE_TAG) private drizzle: NodePgDatabase<typeof schema>) {}

  async findOne(id: string) {
    const result = await this.drizzle.query.permissions.findFirst({
      where: eq(schema.permissions.id, id),
    });
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  async findAll() {
    const result = await this.drizzle.query.permissions.findMany({
      orderBy: asc(schema.permissions.name),
    });
    return result;
  }
}
