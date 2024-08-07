import { Permission } from '../../permissions/entities/permission.entity';

export class Role {
  id!: string;
  name!: string;
  description!: string;

  constructor(entity: Role) {
    Object.assign(this, entity);
  }
}

export class RoleWithPermissions extends Role {
  permissions!: Permission[];

  constructor(entity: RoleWithPermissions) {
    super(entity);
  }
}
