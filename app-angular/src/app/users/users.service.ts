import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CreateUserDto } from '../../../../app-nest/src/users/dto/create-user.dto';
import { UpdateUserDto } from '../../../../app-nest/src/users/dto/update-user.dto';
import { UserWithRoles, UserWithRolesAndPermissions } from '../../../../app-nest/src/users/entities/user.entity';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  #http = inject(HttpClient);

  constructor() { }

  create(createUserDto: CreateUserDto) {
    return this.#http.post<void>(
      `${environment.apiUrl}/users`,
      createUserDto
    );
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.#http.put<void>(
      `${environment.apiUrl}/users/${id}`,
      updateUserDto
    );
  }

  remove(id: string) {
    return this.#http.delete<void>(
      `${environment.apiUrl}/users/${id}`
    );
  }

  findOne(id: string) {
    return this.#http.get<UserWithRolesAndPermissions>(
      `${environment.apiUrl}/users/${id}`
    );
  }

  findAll() {
    return this.#http.get<UserWithRoles[]>(
      `${environment.apiUrl}/users`
    );
  }
}
