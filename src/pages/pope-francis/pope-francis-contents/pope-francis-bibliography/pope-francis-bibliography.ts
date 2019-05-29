import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pope-francis-bibliography',
  templateUrl: './pope-francis-bibliography.html'
  // styleUrls: ['/src/pages/pope-francis/pope-francis.scss']
})
export class PopeFrancisBibliographyComponent implements OnInit {

  carousel;
  slider;
  sliderItems;
  currentSlide;
  
  constructor() { 


  }



  ngOnInit() {
    this.currentSlide = 0;
    this.carousel = document.getElementById("carousel");
    this.slider = document.getElementById("slider");
    this.sliderItems = document.getElementsByClassName("slider-item");
    this.AdjustCarouselSizes();
    window.onresize = (event) => {
      this.AdjustCarouselSizes();
    };
    setInterval(()=>{
      this.MoveSlide('next');
    },5000);
    
  }

  AdjustCarouselSizes() {
    this.slider.style.width =  (this.sliderItems.length * 100) + "%";
    for(let i = 0; i < this.sliderItems.length ; i++) {
      this.sliderItems[i].style.width = this.carousel.offsetWidth + "px";
    }
  }

  MoveSlide(moveTo){
    if (moveTo === "next") {
      this.currentSlide++;
    } else {
      this.currentSlide--;
    }
    if((this.currentSlide >= this.sliderItems.length) || (this.currentSlide <= 0)) {
      this.currentSlide = 0;
    }
    this.slider.style.left= "-" + (this.carousel.offsetWidth * this.currentSlide) + "px";
  }


}