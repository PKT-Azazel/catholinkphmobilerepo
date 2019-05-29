import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-teachings',
  templateUrl: 'teachings.html',
})
export class TeachingsPage {

  selectedNav : string = "doctrines";
  currentNavIndex = 0;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    
  }

  ionViewDidLoad() {
    
  }

  UpdateNavSliderRight(){
    let itemsLength = document.getElementsByClassName("item-teachings").length;
    if(this.currentNavIndex < (itemsLength -1)) {
      this.currentNavIndex++;
    }
    this.UpdateNavBySlider();

  }
  UpdateNavSliderLeft(){
    if(this.currentNavIndex > 0) {
      this.currentNavIndex--;
    }
    this.UpdateNavBySlider();
  }

  UpdateNavBySlider(){
    for(let i=0;i<document.getElementsByClassName("item-teachings").length;i++) {
      document.getElementsByClassName("item-teachings")[i].className = "item item-teachings";
    }

    document.getElementsByClassName("item-teachings")[this.currentNavIndex].className = "item item-teachings active";
    let elemInnerHTML = document.getElementsByClassName("item-teachings")[this.currentNavIndex].innerHTML;
    this.UpdateContent(elemInnerHTML.split(" ")[0]);
  }


  UpdateContent(value) {
    this.selectedNav = value;
  }

}
