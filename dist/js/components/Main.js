import {select, templates} from '../settings.js';
import {utils} from '../utils.js';

class Main{
  constructor(element){
    const thisMain = this;
    thisMain.renderPage(element);
    thisMain.getElements();

    thisMain.slider();

  }

  renderPage(element){
    const thisMain = this
    const generatedHtml = templates.mainPage();
    thisMain.dom = {};
    thisMain.dom.wrapper = element;

    thisMain.elem = utils.createDOMFromHTML(generatedHtml);
    console.log(thisMain.elem);

    thisMain.dom.wrapper.appendChild(thisMain.elem);

  }

  slider(){
    let slideIndex = 0;
    showSlides();

    function showSlides() {
      let i;
      let slides = document.getElementsByClassName("mySlides");
      for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
      }
      slideIndex++;
      if (slideIndex > slides.length) {slideIndex = 1}
      slides[slideIndex-1].style.display = "block";
      setTimeout(showSlides, 3000); // Change image every 2 seconds
    }

  }

  dotShift() {
    let dots = document.getElementsByClassName("dot");
    for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
    }

    dots[slideIndex-1].className += " active";
  }

  getElements(){
    const dotSlide = document.getElementsByClassName('dot');
    for(let dot of dotSlide){
      console.log('wykona sie?');
      dot.addEventListener('click', function(){
        console.log('klik');

      });
    }
  }
}

export default Main;
