import { Module } from '@nestjs/common';
import { DrizzlePGModule } from '@knaadh/nestjs-drizzle-pg';
import * as schema from '../../drizzle.schema';
import { TYPES } from '../types';

@Module({
  imports: [
    DrizzlePGModule.registerAsync({
      tag: TYPES.DRIZZLE_TAG,
      useFactory() {
        return {
          pg: {
            connection: 'pool',
            config: {
              connectionString: process.env.DATABASE_URL,
            },
          },
          config: {
            schema: { ...schema },
            logger: true,
          },
        };
      },
    }),
  ],
})
export class DrizzleModule {}

/**
 * ref
 * https://mithle.sh/how-to-use-drizzle-orm-with-nestjs/
 * https://github.com/knaadh/nestjs-drizzle/blob/main/packages/node-postgres/README.md
 */
