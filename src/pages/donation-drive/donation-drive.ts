import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import {DonationDriveListPage} from '../donation-drive/donation-drive-list/donation-drive-list';
@Component({
  selector: 'page-donation-drive',
  templateUrl: 'donation-drive.html',
})
export class DonationDrivePage {
  donationDriveListPage = DonationDriveListPage;
  videoUrl;
  safeUrl;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private sanitizer: DomSanitizer) {
  }


  ionViewDidEnter() {
    this.videoUrl = "https://www.youtube.com/watch?v=ig1XOmKO9ZQ";
    this.videoUrl = this.videoUrl.replace("watch?v=", "embed/");
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl);
  }

  RouteTo(page){
    this.navCtrl.push(page);
  }

  RouteFromSearch(page,type: string){
    this.navCtrl.push(page,{
      campaigntype : type
    });
  }

}
