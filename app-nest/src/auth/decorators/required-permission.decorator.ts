import { SetMetadata } from '@nestjs/common';

export const RequiredPermission = (requiredPermission: string) =>
  SetMetadata('requiredPermission', requiredPermission);
