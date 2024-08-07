import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserWithRolesAndPermissions } from '../../../../app-nest/src/users/entities/user.entity';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  #http = inject(HttpClient);

  #userInfo: UserWithRolesAndPermissions = {
    id: '',
    name: '',
    email: '',
    roles: []
  };

  public get userInfo(): UserWithRolesAndPermissions {
    return this.#userInfo;
  }
  public set userInfo(value: UserWithRolesAndPermissions) {
    this.#userInfo = value;
  }

  public get signInAs(): string {
    return localStorage.getItem('signInAs') || '';
  }
  public set signInAs(value: string) {
    localStorage.setItem('signInAs', value);
  }

  hasRole(roleName: string): boolean {
    if (this.userInfo.id === environment.superUserId) {
      return true;
    }

    return !!this.userInfo.roles.find(role => role.name === roleName);
  }

  hasPermission(permissionName: string): boolean {
    if (this.userInfo.id === environment.superUserId) {
      return true;
    }

    const selectedRole = this.userInfo.roles.find(role => role.name === this.signInAs);
    if (!selectedRole) {
      return false;
    }
    return !!selectedRole.permissions.find(permission => permission.name === permissionName);
  }

  reset(): void {
    this.userInfo = {
      id: '',
      name: '',
      email: '',
      roles: []
    };
    this.signInAs = '';
  }

  constructor() { }

  info() {
    return this.#http.get<UserWithRolesAndPermissions>(
      `${environment.apiUrl}/auth/info`
    );
  }
}
