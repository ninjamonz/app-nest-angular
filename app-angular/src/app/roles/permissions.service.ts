import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Permission } from '../../../../app-nest/src/permissions/entities/permission.entity';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  #http = inject(HttpClient);

  constructor() { }

  findOne(id: string) {
    return this.#http.get<Permission>(
      `${environment.apiUrl}/permissions/${id}`
    );
  }

  findAll() {
    return this.#http.get<Permission[]>(
      `${environment.apiUrl}/permissions`
    );
  }
}
