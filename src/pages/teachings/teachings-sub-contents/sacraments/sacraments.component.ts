import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sacraments',
  templateUrl: './sacraments.component.html'
  // styleUrls: ['/src/pages/teachings/teachings.scss']
})
export class SacramentsComponent implements OnInit {

  selectElementVal : string;
  constructor() { }

  ngOnInit() {
    this.selectElementVal = (<HTMLInputElement>document.getElementById("sacraments-select")).value = "0";
  }

  UpdateSelect(){
    this.selectElementVal = (<HTMLInputElement>document.getElementById("sacraments-select")).value;
  }

}
