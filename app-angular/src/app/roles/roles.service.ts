import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CreateRoleDto } from '../../../../app-nest/src/roles/dto/create-role.dto';
import { UpdateRoleDto } from '../../../../app-nest/src/roles/dto/update-role.dto';
import { Role, RoleWithPermissions } from '../../../../app-nest/src/roles/entities/role.entity';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  #http = inject(HttpClient);

  constructor() { }

  create(createRoleDto: CreateRoleDto) {
    return this.#http.post<void>(
      `${environment.apiUrl}/roles`,
      createRoleDto
    );
  }

  update(id: string, updateRoleDto: UpdateRoleDto) {
    return this.#http.put<void>(
      `${environment.apiUrl}/roles/${id}`,
      updateRoleDto
    );
  }

  remove(id: string) {
    return this.#http.delete<void>(
      `${environment.apiUrl}/roles/${id}`
    );
  }

  findOne(id: string) {
    return this.#http.get<RoleWithPermissions>(
      `${environment.apiUrl}/roles/${id}`
    );
  }

  findAll() {
    return this.#http.get<Role[]>(
      `${environment.apiUrl}/roles`
    );
  }
}
