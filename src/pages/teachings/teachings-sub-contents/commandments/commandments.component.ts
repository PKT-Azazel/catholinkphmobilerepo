import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-commandments',
  templateUrl: './commandments.component.html'
  // styleUrls: ['/src/pages/teachings/teachings.scss']

})
export class CommandmentsComponent implements OnInit {

  selectElementVal : string;
  constructor() { }

  ngOnInit() {
    this.selectElementVal = (<HTMLInputElement>document.getElementById("commandments-select")).value = "0";
  }

  UpdateSelect(){
    this.selectElementVal = (<HTMLInputElement>document.getElementById("commandments-select")).value;
  }

}
