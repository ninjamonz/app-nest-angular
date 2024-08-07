import { Role, RoleWithPermissions } from '../../roles/entities/role.entity';

export class User {
  id!: string;
  name!: string;

  constructor(entity: User) {
    Object.assign(this, entity);
  }
}

export class UserWithRoles extends User {
  roles!: Role[];

  constructor(entity: UserWithRoles) {
    super(entity);
  }
}

export class UserWithRolesAndPermissions extends User {
  roles!: RoleWithPermissions[];
  email!: string;

  constructor(entity: UserWithRolesAndPermissions) {
    super(entity);
  }
}
