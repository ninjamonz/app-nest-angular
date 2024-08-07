import {
  pgTable,
  unique,
  pgEnum,
  text,
  numeric,
  timestamp,
  foreignKey,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const aalLevel = pgEnum('aal_level', ['aal1', 'aal2', 'aal3']);
export const codeChallengeMethod = pgEnum('code_challenge_method', ['s256', 'plain']);
export const factorStatus = pgEnum('factor_status', ['unverified', 'verified']);
export const factorType = pgEnum('factor_type', ['totp', 'webauthn']);
export const oneTimeTokenType = pgEnum('one_time_token_type', [
  'confirmation_token',
  'reauthentication_token',
  'recovery_token',
  'email_change_token_new',
  'email_change_token_current',
  'phone_change_token',
]);
export const keyStatus = pgEnum('key_status', ['default', 'valid', 'invalid', 'expired']);
export const keyType = pgEnum('key_type', [
  'aead-ietf',
  'aead-det',
  'hmacsha512',
  'hmacsha256',
  'auth',
  'shorthash',
  'generichash',
  'kdf',
  'secretbox',
  'secretstream',
  'stream_xchacha20',
]);
export const action = pgEnum('action', ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ERROR']);
export const equalityOp = pgEnum('equality_op', ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in']);

export const roles = pgTable(
  'roles',
  {
    id: text('id').primaryKey().notNull(),
    name: text('name').notNull(),
    description: text('description'),
  },
  (table) => {
    return {
      rolesNameUnique: unique('roles_name_unique').on(table.name),
    };
  },
);

export const users = pgTable('users', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
});

export const permissions = pgTable(
  'permissions',
  {
    id: text('id').primaryKey().notNull(),
    name: text('name').notNull(),
    description: text('description'),
  },
  (table) => {
    return {
      permissionsNameUnique: unique('permissions_name_unique').on(table.name),
    };
  },
);

export const products = pgTable(
  'products',
  {
    id: text('id').primaryKey().notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    salesPrice: numeric('sales_price', { precision: 15, scale: 2 }).notNull(),
    sku: text('sku'),
    barcode: text('barcode'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'string' }),
  },
  (table) => {
    return {
      productsSlugUnique: unique('products_slug_unique').on(table.slug),
      productsSkuUnique: unique('products_sku_unique').on(table.sku),
      productsBarcodeUnique: unique('products_barcode_unique').on(table.barcode),
    };
  },
);

export const roleUser = pgTable(
  'role_user',
  {
    roleId: text('role_id')
      .notNull()
      .references(() => roles.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
  },
  (table) => {
    return {
      roleUserPk: primaryKey({ columns: [table.roleId, table.userId], name: 'role_user_pk' }),
    };
  },
);

export const permissionRole = pgTable(
  'permission_role',
  {
    permissionId: text('permission_id')
      .notNull()
      .references(() => permissions.id),
    roleId: text('role_id')
      .notNull()
      .references(() => roles.id),
  },
  (table) => {
    return {
      permissionRolePk: primaryKey({
        columns: [table.permissionId, table.roleId],
        name: 'permission_role_pk',
      }),
    };
  },
);

export const roleUserRelations = relations(roleUser, ({ one }) => ({
  role: one(roles, {
    fields: [roleUser.roleId],
    references: [roles.id],
  }),
  user: one(users, {
    fields: [roleUser.userId],
    references: [users.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  roleUsers: many(roleUser),
  permissionRoles: many(permissionRole),
}));

export const usersRelations = relations(users, ({ many }) => ({
  roleUsers: many(roleUser),
}));

export const permissionRoleRelations = relations(permissionRole, ({ one }) => ({
  permission: one(permissions, {
    fields: [permissionRole.permissionId],
    references: [permissions.id],
  }),
  role: one(roles, {
    fields: [permissionRole.roleId],
    references: [roles.id],
  }),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  permissionRoles: many(permissionRole),
}));
