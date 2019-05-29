import { Component } from '@angular/core';
import {NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-pope-francis',
  templateUrl: 'pope-francis.html',
})
export class PopeFrancisPage {

  selectedNav : string = "itinerary";
  currentNavIndex = 0;
  
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    
  
  }

  

  UpdateNav(event,val){
    for(let i=0;i<document.getElementsByClassName("item-pf").length;i++) {
      document.getElementsByClassName("item-pf")[i].className = "item item-pf";
    }
    event.target.className = "item item-pf active";
    this.UpdateContent(val);
  }

  UpdateContent(value) {
    this.selectedNav = value;
  }
}
