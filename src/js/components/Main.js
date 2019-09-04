import {select, templates, classNames, settings} from '../settings.js';
import {utils} from '../utils.js';

class Main{
  constructor(element){
    const thisMain = this;
    thisMain.renderPage(element);
    thisMain.getElements();
    thisMain.pagePick();

    thisMain.slider();

  }

  renderPage(element){
    const thisMain = this
    const generatedHtml = templates.mainPage();
    thisMain.dom = {};
    thisMain.dom.wrapper = element;

    thisMain.elem = utils.createDOMFromHTML(generatedHtml);

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
    const thisMain = this;

    const dotSlide = document.getElementsByClassName('dot');
    for(let dot of dotSlide){
      dot.addEventListener('click', function(){
        console.log('klik w kropke');
      });
    }

    thisMain.pageSwicth = document.querySelectorAll(select.mainPage.pageChange);



    thisMain.allPages = document.querySelector(select.containerOf.pages).children;
    thisMain.allLinks = document.querySelectorAll(select.nav.links);

    // Tworzymy i uzupełniamy obiekt selektorow poszczególnych stron
    thisMain.pageTable = {};
    for(let page of thisMain.allPages){
      const pageId = page.id;
      thisMain.pageTable[pageId] = document.getElementById(pageId);
    }

    // Tworzymy i uzupełniamy obiekt selektorow poszczególnych linków
    thisMain.linkTable = {};
    for(let link of thisMain.allLinks){
      const linkAtribute = link.getAttribute('href').replace('#', '');
      thisMain.linkTable[linkAtribute] = link;
    }
  }

  pagePick(){
    const thisMain = this;

    for(let page of thisMain.pageSwicth){
      page.addEventListener('click', function(){
        event.preventDefault();
          if(this.classList.contains(settings.db.order)){
            thisMain.classShift(settings.db.order);
          } else {
            thisMain.classShift(settings.db.booking);
          }
          thisMain.classShift(settings.db.main);
      });
    }
  }

  classShift(className){
    const thisMain = this;
    const setClass = settings.db[className];
    thisMain.pageTable[setClass].classList.toggle(classNames.pages.active);
    thisMain.linkTable[setClass].classList.toggle(classNames.nav.active);
  }
}

export default Main;
