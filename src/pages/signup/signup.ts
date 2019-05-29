import { Component } from '@angular/core';
import {  NavController, NavParams } from 'ionic-angular';
import {AuthServiceProvider} from '../../providers/auth-service/auth-service';
import {LoginPage} from '../login/login';
import {TermsOfServicePage} from '../terms-of-service/terms-of-service';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  showError = false;
  showSuccess = false;
  errorMessage;
  successMessage;
  showLoading = false;
  errors = [];
  loginPage = LoginPage;
  termsOfServicePage = TermsOfServicePage;


  constructor(public navCtrl: NavController, public navParams: NavParams,
    public authService : AuthServiceProvider) {
  }

  RouteTo(page){
    this.navCtrl.push(page);
  }

  ToggleTOS(chkbox){
    console.log(chkbox.checked);
  }

  SubmitRegistration(form){
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errors = [];

    let fname = form.value.fname;
    let lname = form.value.lname;
    let email = form.value.email;
    let password = form.value.password;

    let user = {
      "fname" : fname,
      "lname" : lname,
      "email" : email,
      "password" : password
    }

    this.authService.httpRegisterUser(user).subscribe(res =>{
      if(!res.success) {
        
        if(res.err) {
          this.errors = res.err;
        } else {
          if(res.msg.code == 11000) {
            this.errors.push({
              msg : "Email already registered."
            })
          } else {
            this.errors.push({
              msg : "Registration failed."
            })
          }
          
        }
        this.showLoading = false;
        this.showError = true;
      } else {
        this.showLoading = false;
        this.showSuccess = true;
        setTimeout(()=>{
          this.RouteTo(this.loginPage);
        },1000);
      }
      
    });

  }


}
