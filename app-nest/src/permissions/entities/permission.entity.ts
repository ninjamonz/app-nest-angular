export class Permission {
  id!: string;
  name!: string;
  description!: string;

  constructor(entity: Permission) {
    Object.assign(this, entity);
  }
}
