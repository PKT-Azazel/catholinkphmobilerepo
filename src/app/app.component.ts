import { Component,ViewChild } from '@angular/core';
import { Platform,NavController,MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Http, Headers,RequestOptions } from '@angular/http';
import { BackEndConfig } from '../backend.config';

import {AuthServiceProvider} from '../providers/auth-service/auth-service';
import {HomePage} from '../pages/home/home';
import {InformationFinderPage} from '../pages/information-finder/information-finder';
import {LoginPage} from '../pages/login/login';
import {SignupPage} from '../pages/signup/signup';
import {TermsOfServicePage} from '../pages/terms-of-service/terms-of-service';
import {ResetPasswordPage} from '../pages/reset-password/reset-password';
import {TeachingsPage} from '../pages/teachings/teachings';
import {PopeFrancisPage} from '../pages/pope-francis/pope-francis';
import {InspirationalPage} from '../pages/inspirational/inspirational';
import {DonationDrivePage} from '../pages/donation-drive/donation-drive';
import {BfastPage} from '../pages/bfast/bfast';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('rootNavController') navCtrl: NavController;
  
  rootPage:any = HomePage;

  homePage = HomePage;
  informationFinderPage = InformationFinderPage;
  loginPage = LoginPage;
  signupPage = SignupPage;
  termsOfService = TermsOfServicePage;
  resetPasswordPage = ResetPasswordPage;
  teachingsPage = TeachingsPage;
  popeFrancisPage = PopeFrancisPage;
  inspirationalPage = InspirationalPage;
  donationDrivePage = DonationDrivePage;
  bfastPage = BfastPage;
  userIsLoggedIn = false;

  headers;
  requestOptions;
  apiEndpoint : string = BackEndConfig.API_ENDPOINT;
  user;

  isUserAdmin = false;

  showManageUsersForm = false;
  isSearchingUser = false;
  isSearchingAssignedTo = false;
  assignedToSearchResults = [];
  userToManage;
  searchTriggered = false;
  showLoading = false;
  showError = false;
  showSuccess = false;
  errorMessage = "";
  successMessage = "";

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
    public http: Http,
    public menuCtrl: MenuController,
    public authService : AuthServiceProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      this.headers = new Headers();
      this.headers.append('Content-Type', 'application/json');
      this.requestOptions = new RequestOptions({ headers: this.headers , withCredentials: true });

      this.UpdateUserState();
      this.authService.AuthStateChanged.subscribe(state =>{
        this.UpdateUserState();
      })

    });
  }

  RouteToHome(){
    this.menuCtrl.close();
    this.navCtrl.setRoot(this.homePage);
  }

  RouteTo(page){
    this.menuCtrl.close();
    this.navCtrl.push(page);  
  }

  LogOut(){
    this.authService.LogOut();
    this.user = this.authService.GetCurrentUser();
    setTimeout(()=>{
      this.navCtrl.popToRoot();
    },1000);
    // this.authService.httpLogOut().subscribe((res)=>{
    //   this.authService.UpdateAuthState().subscribe(isUserLoggedIn=>{
    //     this.UpdateUserState();
    //     setTimeout(()=>{
    //       this.navCtrl.popToRoot();
    //     },1000);
    //   })
    // });
  }

  UpdateUserState(){
    this.user = this.authService.GetCurrentUser();
    if(this.user) {
      this.userIsLoggedIn = true;
      this.isUserAdmin = this.authService.CheckIfUserAdmin();
    } else {
      this.userIsLoggedIn = false;
    }
  }

  SearchUser(email){
    this.assignedToSearchResults = [];
    this.searchTriggered = false;
    this.isSearchingUser = true;
    this.authService.httpGetUserByEmail(email.value).subscribe(res=>{
      this.isSearchingUser = false;
      this.userToManage = res.user;
      this.searchTriggered = true;
    })
  }

  SearchAssignedTo(assignedFor,assignedSearchQuery){
    this.assignedToSearchResults = [];
    this.isSearchingAssignedTo = true;
    if(assignedFor==="diocese") {
      this.http.get(this.apiEndpoint + "diocese/dioceses?searchParams=" + assignedSearchQuery, this.requestOptions)
      .map(res =>  res.json()).subscribe(res => {
        this.isSearchingAssignedTo = false;
       
        for(let i =0;i<res.data.length;i++) {
          this.assignedToSearchResults.push({
            id : res.data[i]._id,
            name : res.data[i].dioceseName
          });
        }
      });
    } else if (assignedFor==="church") {
      this.http.get(this.apiEndpoint + "church/churches?searchParams=" + assignedSearchQuery, this.requestOptions)
      .map(res =>  res.json()).subscribe(res => {
        this.isSearchingAssignedTo = false;
        for(let i =0;i<res.data.length;i++) {
          this.assignedToSearchResults.push({
            id : res.data[i]._id,
            name : res.data[i].parishName
          });
        }
      });
    } else if (assignedFor==="organization") {
      this.http.get(this.apiEndpoint + "organization/organizations?searchParams=" + assignedSearchQuery, this.requestOptions)
      .map(res =>  res.json()).subscribe(res => {
        this.isSearchingAssignedTo = false;
        for(let i =0;i<res.data.length;i++) {
          this.assignedToSearchResults.push({
            id : res.data[i]._id,
            name : res.data[i].organizationName
          });
        }
      });
    }
      
  }

  EditUserRole(form) {
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    this.userToManage.role = form.value.role;
    this.userToManage.assignedFor = form.value.assignedFor;

    this.authService.httpUpdateUserRole(this.userToManage,this.userToManage._id).subscribe(res =>{
      this.showLoading = false;
      if(res.success) {
        this.showSuccess = true;
        this.successMessage = "Record has been updated successfully."

        setTimeout(()=>{
          this.showSuccess = false;
          this.showManageUsersForm = false;
        },1500);
      } else {
        this.errorMessage = res.err;
        this.showError = true;
      }
    })

  }


}

