import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-teachings-faq',
  templateUrl: './teachings-faq.component.html'
  // styleUrls: ['/src/pages/teachings/teachings.scss']
})
export class TeachingsFaqComponent implements OnInit {

  selectElementVal : string;
  constructor() { }

  ngOnInit() {
    this.selectElementVal = (<HTMLInputElement>document.getElementById("faq-select")).value = "0";
  }

  UpdateSelect(){
    this.selectElementVal = (<HTMLInputElement>document.getElementById("faq-select")).value;
  }

}
