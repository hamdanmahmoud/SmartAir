import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { UserModel } from '../models/UserModel';
import { UserProfile } from '../models/UserProfile';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private databaseService: DatabaseService) {
  }

  changeActiveStatus(username: string): Promise<UserModel> {
    return new Promise((resolve, reject) => {
      this.databaseService.changeActiveStatus(username).then(
        user => {
          let userObject: UserModel = new UserModel().parse(user);
          resolve(userObject);
        }
      )
    });
  }

  getUserProfile(username: string): Promise<UserModel> {
    return new Promise((resolve, reject) => {
      this.databaseService.getUserProfile(username).then(
        profile => {
          let userProfile: UserProfile = new UserProfile().parse(profile);
          console.log(userProfile)
          resolve(userProfile);
        }
      )
    });
  }

  recoveryPassword(identification: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.databaseService.recoveryPassword(identification).then(
        confirmation => {
          resolve(); 
        }
      )
    });
  }

  changePassword(username: string, oldPass: any, newPass: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.databaseService.changePassword(username, oldPass, newPass).then(
        confirmation => {
          resolve(); 
        }
      )
    });
  }

  resetPassword(username: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.databaseService.resetPassword(username).then(
        confirmation => {
          resolve(); 
        }
      )
    });
  }

  getUsers(): Promise<UserModel[]> {
    return new Promise((resolve, reject) => {
      this.databaseService.getUsers().then(
        users => {
          let userObjects: UserModel[] = users.map(function (user) {
            return new UserModel().parse(user);
          });
          resolve(userObjects);
        }
      );
    })
  }

  addUser(user: UserModel): Promise<UserModel> {
    return new Promise((resolve, reject) => {
      this.databaseService.addUser(user).then(
        user => {
          let userObject: UserModel = new UserModel().parse(user);
          resolve(userObject);
        }
      );
    })
  }

  updateUser(username: string, update: Object): Promise<UserModel> {
    return new Promise((resolve, reject) => {
      this.databaseService.updateUser(username, update).then(
        user => {
          let userObject: UserModel = new UserModel().parse(user);
          resolve(userObject);
        }
      );
    })
  }

  deleteUser(username: string): Promise<UserModel> {
    return new Promise((resolve, reject) => {
      this.databaseService.deleteUser(username).then(
        user => {
          let userObject: UserModel = new UserModel().parse(user);
          resolve(userObject);
        }
      );
    })
  }

}
