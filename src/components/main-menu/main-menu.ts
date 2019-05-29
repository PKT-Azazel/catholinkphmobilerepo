import { Component } from '@angular/core';
import { MenuController } from 'ionic-angular';

@Component({
  selector: 'main-menu',
  templateUrl: 'main-menu.html'
})
export class MainMenuComponent {
  constructor(public menuCtrl: MenuController) {

  }

  ToggleMenu(){
    this.menuCtrl.toggle();
  }
}
