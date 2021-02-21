import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { RoleModel } from '../models/RoleModel';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private ds: DatabaseService) {
  }

  getRoles(): Promise<RoleModel[]> {
    return new Promise((resolve, reject) => {
      this.ds.getRoles().then(
        roles => {
          let roleObjects:RoleModel[] = roles.map(function (role) {
            return new RoleModel().parse(role);
          });
          resolve(roleObjects);
        }
      );
    })
  }

  addRole(role: RoleModel): Promise<RoleModel> {
    return new Promise((resolve, reject) => {
      this.ds.addRole(role).then(
        role => {
          let roleObject:RoleModel = new RoleModel().parse(role);
          resolve(roleObject);
        }
      );
    })
  }

  updateRole(name: string, update: Object): Promise<RoleModel> {
    return new Promise((resolve, reject) => {
      this.ds.updateRole(name, update).then(
        role => {
          let roleObject:RoleModel = new RoleModel().parse(role);
          resolve(roleObject);
        }
      );
    })
  }

  deleteRole(name: string): Promise<RoleModel> {
    return new Promise((resolve, reject) => {
      this.ds.deleteRole(name).then(
        role => {
          let roleObject:RoleModel = new RoleModel().parse(role);
          resolve(roleObject);
        }
      );
    })
  }
}
