import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-prayers',
  templateUrl: './prayers.component.html'
  // styleUrls: ['/src/pages/teachings/teachings.scss']
})
export class PrayersComponent implements OnInit {

  selectElementVal : string;
  constructor() { }

  ngOnInit() {
    this.selectElementVal = (<HTMLInputElement>document.getElementById("prayers-select")).value = "0";
  }

  UpdateSelect(){
    this.selectElementVal = (<HTMLInputElement>document.getElementById("prayers-select")).value;
  }

}
