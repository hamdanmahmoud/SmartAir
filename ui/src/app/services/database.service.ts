import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { RoleModel } from '../models/RoleModel';
import { API } from '../../API.conf';
import { UserModel } from '../models/UserModel';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  headers: any;
  roles: any;
  needsLogIn: EventEmitter<any> = new EventEmitter<any>();
  constructor(private API: API, private http: HttpClient, private utilsService: UtilsService) {
    this.needsLogIn = new EventEmitter<any>();
  }

  setAuthorizationHeader() {
    this.headers = {
      headers: new HttpHeaders()
        .set('Authorization', this.getToken())
    };
  }

  getToken() {
    let pData = JSON.parse(this.utilsService.decodeObject(localStorage.getItem('pData')));
    if (pData) {
      return pData.token;
    } else {
      return null;
    }
  }

  changePassword(username, oldPassword, newPassword): Promise<any> {
    let reqBody = {
      oldPassword: oldPassword,
      newPassword: newPassword
    };
    return new Promise((resolve, reject) => {
      this.http.post(this.API.changePasswordURL + '/' + username, reqBody)
        .toPromise()
        .then(
          res => {
            resolve();
          }
        );
    });
  }

  recoveryPassword(identification): Promise<any> {
    let reqBody = {
      identification: identification
    };
    return new Promise((resolve, reject) => {
      this.http.post(this.API.recoveryPasswordURL, reqBody)
        .toPromise()
        .then(
          res => {
            resolve();
          }
        );
    })
  }

  resetPassword(username: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.API.resetPasswordURL + '/' + username, this.headers)
        .toPromise()
        .then(
          res => {
            resolve();
          }
        )
        .catch(this._handleError.bind(this));
    });
  }


  signIn(user): Promise<any> {
    let body = {
      auth: {
        username: user.username,
        password: user.password
      }
    }
    return this.http.post(this.API.loginURL, body)
      .toPromise()
      .catch(this._handleError.bind(this));
  }

  getRoles(): Promise<any> {
    this.setAuthorizationHeader();
    return new Promise((resolve, reject) => {
      this.http.get(this.API.rolesURL, this.headers)
        .toPromise()
        .then(
          (response: any) => {
            let roles = response.roles;
            resolve(roles);
          }
        ).catch(this._handleError.bind(this));
    });
  }

  getUsers(): Promise<any> {
    this.setAuthorizationHeader();
    return new Promise((resolve, reject) => {
      this.http.get(this.API.usersURL, this.headers)
        .toPromise()
        .then(
          (response: any) => {
            let users = response.users;
            resolve(users);
          }
        ).catch(this._handleError.bind(this));
    });
  }

  getDevice(username: string): Promise<any> {
    this.setAuthorizationHeader();
    return new Promise((resolve, reject) => {
      this.http.get(this.API.devicesURL + "/" + username, this.headers)
        .toPromise()
        .then(
          response => {
            let device = response;
            resolve(device);
          }
        ).catch(this._handleError.bind(this));
    });
  }

  getAllReadings(username: string): Promise<any> {
    this.setAuthorizationHeader();
    return new Promise((resolve, reject) => {
      this.http.get(this.API.devicesURL + "/" + username + "/readings", this.headers)
        .toPromise()
        .then(
          response => {
            let readings = JSON.parse(JSON.stringify(response)).readings;
            resolve(readings);
          }
        ).catch(this._handleError)
    })
  }

  getCustomReadings(username: string, obj: Object): Promise<any> {
    this.setAuthorizationHeader();
    obj = {
      from: new Date().toISOString(),
      to: new Date().toISOString()
    }
    return new Promise((resolve, reject) => {
      this.http.get(this.API.devicesURL + "/" + username + "/readings?from=" + obj['from'] + "&to=" + obj['to'], this.headers)
        .toPromise()
        .then(
          response => {
            let readings = JSON.parse(JSON.stringify(response)).readings;
            resolve(readings);
          }
        ).catch(this._handleError)
    })
  }

  getLastDayReadings(username: string, obj: Object): Promise<any> {
    this.setAuthorizationHeader();
    let from = new Date();
    let to = new Date();
    from.setDate(to.getDate() - 1)
    obj = {
      'from': from.toISOString(),
      'to': to.toISOString()
    }
    console.log('-------',obj)
    return new Promise((resolve, reject) => {
      this.http.get(this.API.devicesURL + "/" + username + "/readings?from=" + obj['from'] + "&to=" + obj['to'], this.headers)
        .toPromise()
        .then(
          response => {
            let readings = JSON.parse(JSON.stringify(response)).readings;
            resolve(readings);
          }
        ).catch(this._handleError)
    })
  }

  getOneWeekReadings(username: string, obj: Object): Promise<any> {
    this.setAuthorizationHeader();
    let from = new Date();
    let to = new Date();
    from.setDate(to.getDate() - 7)
    obj = {
      'from': from.toISOString(),
      'to': to.toISOString()
    }
    console.log('-------',obj)
    return new Promise((resolve, reject) => {
      this.http.get(this.API.devicesURL + "/" + username + "/readings?from=" + obj['from'] + "&to=" + obj['to'], this.headers)
        .toPromise()
        .then(
          response => {
            let readings = JSON.parse(JSON.stringify(response)).readings;
            resolve(readings);
          }
        ).catch(this._handleError)
    })
  }

  getOneMonthReadings(username: string, obj: Object): Promise<any> {
    this.setAuthorizationHeader();
    let from = new Date();
    let to = new Date();
    from.setDate(to.getDate() - 30)
    obj = {
      'from': from.toISOString(),
      'to': to.toISOString()
    }
    return new Promise((resolve, reject) => {
      this.http.get(this.API.devicesURL + "/" + username + "/readings?from=" + obj['from'] + "&to=" + obj['to'], this.headers)
        .toPromise()
        .then(
          response => {
            let readings = JSON.parse(JSON.stringify(response)).readings;
            resolve(readings);
          }
        ).catch(this._handleError)
    })
  }
  getOneYearReadings(username: string, obj: Object): Promise<any> {
    this.setAuthorizationHeader();
    let from = new Date();
    let to = new Date();
    from.setDate(to.getDate() - 365)
    obj = {
      'from': from.toISOString(),
      'to': to.toISOString()
    }
    console.log("--------year----------",obj)
    return new Promise((resolve, reject) => {
      this.http.get(this.API.devicesURL + "/" + username + "/readings?from=" + obj['from'] + "&to=" + obj['to'], this.headers)
        .toPromise()
        .then(
          response => {
            let readings = JSON.parse(JSON.stringify(response)).readings;
            resolve(readings);
          }
        ).catch(this._handleError)
    })
  }
  addRole(role: RoleModel): Promise<any> {
    this.setAuthorizationHeader();
    return new Promise((resolve, reject) => {
      this.http.post(this.API.rolesURL, role, this.headers)
        .toPromise()
        .then(
          res => {
            console.log("Response on adding role:", res);
            role = JSON.parse(JSON.stringify(res));
            resolve(role);
          }
        ).catch(this._handleError.bind(this));
    });
  }

  addUser(user: UserModel): Promise<any> {
    this.setAuthorizationHeader();
    return new Promise((resolve, reject) => {
      this.http.post(this.API.usersURL, user, this.headers)
        .toPromise()
        .then(
          res => {
            console.log("Response on adding user:", res);
            user = JSON.parse(JSON.stringify(res));
            resolve(user);
          }
        )
        .catch(this._handleError.bind(this));
    });
  }

  updateRole(name: string, update: Object): Promise<any> {
    this.setAuthorizationHeader();
    return new Promise((resolve, reject) => {
      this.http.patch(this.API.rolesURL + '/' + name, update, this.headers)
        .toPromise()
        .then(
          res => {
            let role = JSON.parse(JSON.stringify(res));
            resolve(role);
          }
        )
        .catch(this._handleError.bind(this));
    });
  }

  updateUser(username: string, update: Object): Promise<any> {
    this.setAuthorizationHeader();
    return new Promise((resolve, reject) => {
      this.http.patch(this.API.usersURL + '/' + username, update, this.headers)
        .toPromise()
        .then(
          res => {
            let user = JSON.parse(JSON.stringify(res));
            resolve(user)
          }
        )
        .catch(this._handleError.bind(this));
    });
  }

  deleteRole(name: string): Promise<any> {
    this.setAuthorizationHeader();
    return new Promise((resolve, reject) => {
      this.http.delete(this.API.rolesURL + '/' + name, this.headers)
        .toPromise()
        .then(
          res => {
            console.log("Deleted!");
            let role = (JSON.parse(JSON.stringify(res)));
            resolve(role);
          },
        )
        .catch(this._handleError.bind(this));
    });
  }

  deleteUser(username: string): Promise<any> {
    this.setAuthorizationHeader();
    return new Promise((resolve, reject) => {
      this.http.delete(this.API.usersURL + '/' + username, this.headers)
        .toPromise()
        .then(
          res => {
            let user = JSON.parse(JSON.stringify(res));
            resolve(user);
          }
        )
        .catch(this._handleError.bind(this));
    });
  }

  getUserProfile(username: string): Promise<any> {
    this.setAuthorizationHeader();
    return new Promise((resolve, reject) => {
      this.http.get(this.API.usersURL + '/' + username, this.headers)
        .toPromise()
        .then(
          res => {
            let profile = JSON.parse(JSON.stringify(res));
            resolve(profile);
          }).catch(this._handleError.bind(this));
    });
  }

  changeActiveStatus(username: string): Promise<any> {
    this.setAuthorizationHeader();
    return new Promise((resolve, reject) => {
      this.http.patch(this.API.usersURL + '/' + username, this.headers)
        .toPromise()
        .then(
          res => {
            console.log("Response on changing user status:", res);
            let user = JSON.parse(JSON.stringify(res));
            resolve(user);
          }
        )
        .catch(this._handleError.bind(this));
    });
  }

  private _handleError(err: HttpErrorResponse | any) {
    console.log("Handling error..", err)
    if (err.status == 401) {
      console.log("Response on validating token: status 401")
      console.log("Handling error..")
      this.needsLogIn.emit();
    }
    const errorMsg = err.message || 'Error: Unable to complete request.';
    if (err.message && err.message.indexOf('No JWT present') > -1) {
    }
  }
}
