import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-saints',
  templateUrl: './saints.component.html'
  // styleUrls: ['/src/pages/teachings/teachings.scss']
})
export class SaintsComponent implements OnInit {

  selectElementVal : string;
  constructor() { }

  ngOnInit() {
    this.selectElementVal = (<HTMLInputElement>document.getElementById("saints-select")).value = "0";
  }

  UpdateSelect(){
    this.selectElementVal = (<HTMLInputElement>document.getElementById("saints-select")).value;
  }

}
