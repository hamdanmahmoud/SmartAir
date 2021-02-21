export class API {
  apiURL: string = "http://167.71.34.169/api"; // not used by itself

  // authentication
  authenticationURL: string = this.apiURL + "/authentication"; // not used by itself
  signInURL: string = this.authenticationURL + "/signin";
  validationURL: string = this.authenticationURL + "/validation";

  //devices
  devicesURL: string = this.apiURL + "/devices";

  // access
  accessURL: string = this.apiURL + "/access"; // not used by itself
  loginURL: string = this.accessURL + "/login";
  componentsURL: string = this.accessURL + "/components";
  rolesURL: string = this.apiURL + "/roles";
  usersURL: string = this.apiURL + "/users";
  profileURL: string = this.usersURL + "/profile";
  addComponentsURL: string = this.componentsURL + "/add";
  addRolesURL: string = this.rolesURL + "/add";
  addUsersURL: string = this.usersURL + "/add";
  updateComponentsURL: string = this.componentsURL + "/update"; // needs id concat
  updateRolesURL: string = this.rolesURL + "/update"; // needs id concat
  updateUsersURL: string = this.usersURL + "/update"; // needs id concat
  deleteComponentsURL: string = this.componentsURL + "/delete"; // needs id concat
  deleteRolesURL: string = this.rolesURL + "/delete"; // needs id concat
  deleteUsersURL: string = this.usersURL + "/delete"; // needs id concat
  changeActiveStatusURL: string = this.updateUsersURL + "/status"; // needs id concat

   // password
   passwordURL: string = this.accessURL + "/password"; // not used by itself
   changePasswordURL: string = this.passwordURL + "/change";
   recoveryPasswordURL: string = this.passwordURL + "/recovery";
   resetPasswordURL: string = this.passwordURL + "/reset";
}
