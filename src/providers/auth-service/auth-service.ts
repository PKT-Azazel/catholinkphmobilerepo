import { Injectable,EventEmitter } from '@angular/core';
import { BackEndConfig } from '../../backend.config';
import { Http, Headers,RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map'
@Injectable()
export class AuthServiceProvider {

  apiEndpoint : string = BackEndConfig.API_ENDPOINT;
  headers;
  requestOptions;
  AuthStateChanged = new EventEmitter();
  authState;
  authToken;
  User = null;
  constructor(public http: Http) {

    this.headers = new Headers();
    this.authToken = localStorage.getItem("id_token");
    this.headers.append('Authorization', this.authToken);
    this.headers.append('Content-Type', 'application/json');
    this.requestOptions = new RequestOptions({ headers: this.headers , withCredentials: true }); 
  }

  GetCurrentUser(){
    if(this.User) {
      return this.User;
    } else {
      if(this.authToken) {
        this.UpdateAuthState().subscribe();
      }
    }
  }

  StoreUserData(token,user) {
    this.authToken = token;
    localStorage.setItem("id_token", token);
    localStorage.setItem("user",JSON.stringify(user));
  }

  LogOut(){
    this.authToken = null;
    this.User = null;
    localStorage.clear();
    this.AuthStateChanged.emit(false);
  }

  GetAuthToken() {
    return this.authToken;
  }

  UpdateAuthState() {      
    return this.httpGetUserInfo().map(res =>{
      if(res.user) {
        this.User = res.user;
        this.AuthStateChanged.emit(true);
        return true;
      } else {
        this.authToken = null;
        localStorage.clear();
        this.User = null;
        this.AuthStateChanged.emit(false);
        return false;
      }
    })
  }

  CheckIfUserAdminOrUploader() {
    let user = this.GetCurrentUser();
    if(user) {
      if((user.role === "admin") || (user.role === "uploader")) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  CheckIfUserAdmin() {
    let user = this.GetCurrentUser();
    if(user) {
      if(user.role === "admin") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  httpLogIn(user) {
    this.headers.set('Authorization', this.authToken);
    return this.http.post(this.apiEndpoint + "users/login",user, this.requestOptions)
      .map(res =>  res.json());
  }

  httpLogOut() {
    this.headers.set('Authorization', this.authToken);
    return this.http.get(this.apiEndpoint + "users/logout", this.requestOptions);
  }

  httpGetUserInfo() {
    this.headers.set('Authorization', this.authToken);
    return this.http.get(this.apiEndpoint + "users/getuser", this.requestOptions)
      .map(res =>  res.json());
  }

  httpRegisterUser(user) {
    this.headers.set('Authorization', this.authToken);
    return this.http.post(this.apiEndpoint + "users/register",user, this.requestOptions)
      .map(res =>  res.json());
  }

  httpUpdateUserProfile(user,id) {
    this.headers.set('Authorization', this.authToken);
    return this.http.put(this.apiEndpoint + "users/update-user?id=" + id,user, this.requestOptions)
    .map(res =>  res.json());
  }

  httpGetUserByEmail(email) {
    this.headers.set('Authorization', this.authToken);
    return this.http.get(this.apiEndpoint + "users/get-user-by-email?email=" + email, this.requestOptions)
    .map(res =>  res.json());
  }
  
  httpUpdateUserRole(user,id) {
    this.headers.set('Authorization', this.authToken);
    return this.http.put(this.apiEndpoint + "users/update-user-role?id=" + id,user, this.requestOptions)
    .map(res =>  res.json());
  }


}
