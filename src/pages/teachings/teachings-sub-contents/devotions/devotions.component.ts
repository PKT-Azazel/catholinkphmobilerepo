import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-devotions',
  templateUrl: './devotions.component.html'
  // styleUrls: ['/src/pages/teachings/teachings.scss']
})
export class DevotionsComponent implements OnInit {

  selectElementVal : string;
  constructor() { }

  ngOnInit() {
    this.selectElementVal = (<HTMLInputElement>document.getElementById("devotions-select")).value = "0";
  }

  UpdateSelect(){
    this.selectElementVal = (<HTMLInputElement>document.getElementById("devotions-select")).value;
  }
}
