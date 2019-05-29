import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {AuthServiceProvider} from '../../providers/auth-service/auth-service';
import {InformationFinderPage} from '../information-finder/information-finder';
import {LoginPage} from '../login/login';
import {SignupPage} from '../signup/signup';
import {TeachingsPage} from '../teachings/teachings';
import {PopeFrancisPage} from '../pope-francis/pope-francis';
import {InspirationalPage} from '../inspirational/inspirational';
import {DonationDrivePage} from '../donation-drive/donation-drive';
import {BfastPage} from '../bfast/bfast';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  loginPage = LoginPage;
  signupPage = SignupPage;
  informationFinderPage = InformationFinderPage;
  teachingsPage = TeachingsPage;
  popeFrancisPage = PopeFrancisPage;
  inspirationalPage = InspirationalPage;
  donationDrivePage = DonationDrivePage;
  bfastPage = BfastPage;
  userIsLoggedIn = false;
  user;

  constructor(public navCtrl: NavController,
    public authService : AuthServiceProvider) {
    
  }

  ionViewDidEnter() {
    this.UpdateUserState();
    this.authService.AuthStateChanged.subscribe(state =>{
      this.UpdateUserState();
    })
  }

  LogOut(){
    // this.authService.httpLogOut().subscribe((res)=>{
    //   this.authService.UpdateAuthState().subscribe(isUserLoggedIn=>{
    //     this.UpdateUserState();
    //     setTimeout(()=>{
    //       console.log("Logged out successfully");
    //     },1000);
    //   })
    // });
    this.authService.LogOut();
    this.user = this.authService.GetCurrentUser();
  }
  

  RouteTo(page){
    this.navCtrl.push(page);
  }

  UpdateUserState(){
    this.user = this.authService.GetCurrentUser();
    if(this.user) {
      this.userIsLoggedIn = true;
    } else {
      this.userIsLoggedIn = false;
    }
  }

}
