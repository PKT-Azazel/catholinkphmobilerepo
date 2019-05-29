import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {AuthServiceProvider} from '../../providers/auth-service/auth-service';
import {HomePage} from '../home/home';
import { SignupPage } from '../signup/signup';
import {ResetPasswordPage} from '../reset-password/reset-password';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  homePage = HomePage;
  signupPage = SignupPage;
  resetPasswordPage = ResetPasswordPage;
  
  showError = false;
  showSuccess = false;
  errorMessage;
  successMessage;
  showLoading = false;

  constructor(public navCtrl: NavController,
    public authService : AuthServiceProvider) {
  }

  RouteTo(page){
    this.navCtrl.push(page);
  }

  ToggleRememberMe(chkbox){
    console.log(chkbox.checked);
  }

  LogIn(form){
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    let email = form.value.email;
    let password = form.value.password;

    let user = {
      "email" : email,
      "password" : password
    }

    this.authService.httpLogIn(user).subscribe(res =>{
      if(res.success) {
        this.authService.StoreUserData(res.token,res.user);
        this.authService.UpdateAuthState().subscribe(isUserLoggedIn =>{
            this.successMessage = res.msg;
            this.showSuccess = true;
            this.showLoading = false;
            setTimeout(()=>{
              this.navCtrl.popToRoot();
            },1000);
          }
        )
      } else {
        this.errorMessage = res.msg;
        this.showError = true;
        this.showLoading = false;
      }
    })
  }

}
