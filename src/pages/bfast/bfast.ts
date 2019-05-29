import { Component } from '@angular/core';
import { NavController, NavParams,LoadingController } from 'ionic-angular';
import { Http, Headers,RequestOptions } from '@angular/http';
import { BackEndConfig } from '../../backend.config';
import { DomSanitizer } from '@angular/platform-browser';
import {AuthServiceProvider} from '../../providers/auth-service/auth-service';
import {BfastChatPage} from '../bfast-chat/bfast-chat';
import {LoginPage} from '../login/login';
@Component({
  selector: 'page-bfast',
  templateUrl: 'bfast.html',
})
export class BfastPage {

  bfastChatPage = BfastChatPage;
  loginPage = LoginPage;
  apiEndpoint : string = BackEndConfig.API_ENDPOINT;
  headers;
  requestOptions;

  videoUrl;
  description;
  safeUrl;
  showLoading = false;
  showError = false;
  showSuccess = false;
  errorMessage = "";
  successMessage = "";
  showEditModal =false;

  isUserAdmin = false;
  public loader;

  user;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: Http,public loadingCtrl: LoadingController,
    private authSvc : AuthServiceProvider,
    private sanitizer: DomSanitizer) {
    this.headers = new Headers();
    this.headers.append('Authorization', this.authSvc.GetAuthToken());
    this.headers.append('Content-Type', 'application/json');
    this.requestOptions = new RequestOptions({ headers: this.headers , withCredentials: true });  

    this.isUserAdmin = this.authSvc.CheckIfUserAdmin();
    this.user = this.authSvc.GetCurrentUser();
  }

  ionViewDidEnter() {
      this.http.get(this.apiEndpoint + "bfast-home/bfast-home", this.requestOptions)
      .map(res =>  res.json()).subscribe(bfast => {
        if(bfast) {
          this.videoUrl = bfast.videoUrl;
          this.description = bfast.description;
          this.videoUrl = this.videoUrl.replace("watch?v=", "embed/");
          this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl);
        } 
    });
  }

  RouteTo(page){
    if(this.user) {
      this.navCtrl.push(page);
    } else {
      this.navCtrl.push(this.loginPage);
    }
    
  }
  
  OnEditModalShow() {
    this.showEditModal=true;
  }

  EditBfast(form) {
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    let bfastHome = {
      videoUrl : form.value.videoUrl,
      description : form.value.description
    }

    this.http.put(this.apiEndpoint + "bfast-home/update-bfast-home",bfastHome, this.requestOptions).map(res =>  res.json()).subscribe(res => {
      this.showLoading = false;
        if(res.success) {
          this.showSuccess = true;
          this.successMessage = "Record has been updated successfully."
  
          this.videoUrl = bfastHome.videoUrl;
          this.description = bfastHome.description;

          this.videoUrl = this.videoUrl.replace("watch?v=", "embed/");
          this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl);

          (document.getElementById("videoIframe") as HTMLIFrameElement).src = this.safeUrl;

          setTimeout(()=>{
            this.showSuccess = false;
            this.showEditModal = false;
          },1500);
        } else {
          this.errorMessage = res.err;
          this.showError = true;
        }
      });
    }

}