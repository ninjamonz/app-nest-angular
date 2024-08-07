import { Pipe, PipeTransform, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Pipe({
  name: 'permission',
  standalone: true
})
export class PermissionPipe implements PipeTransform {
  authService = inject(AuthService);

  transform(permissionName: string): unknown {
    return this.authService.hasPermission(permissionName);
  }

}
