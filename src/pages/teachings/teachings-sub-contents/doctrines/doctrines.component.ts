import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-doctrines',
  templateUrl: './doctrines.component.html'
  // styleUrls: ['/src/pages/teachings/teachings.scss']
})
export class DoctrinesComponent implements OnInit {

  selectElementVal : string;
  constructor() { }

  ngOnInit() {
    this.selectElementVal = (<HTMLInputElement>document.getElementById("doctrines-select")).value = "0";
  }

  UpdateSelect(){
    this.selectElementVal = (<HTMLInputElement>document.getElementById("doctrines-select")).value;
  }

}
