import Booking from './components/Booking.js';

class Slider {
  constructor(){
    const thisSlider = this;

    thisSlider.updateSlider();

    thisSlider.painter();
  }

  painter(){
    const thisBooking = this;

    thisBooking.pole = thisBooking.dom.slider;
      //console.log('pole to ', thisBooking.pole);
      thisBooking.pole.classList.add('rangeSlider-red');

      const stripUl = document.createElement('div');
      thisBooking.pole.appendChild(stripUl);
      stripUl.classList.add('full-strip');

      const hoursInDay = thisBooking.booked[thisBooking.sliderDate];
      console.log('godziny z dnia ', thisBooking.sliderDate, hoursInDay);
      for(let element in hoursInDay){
        console.log('pojedynczy element to: ', element, ' a jego dlugosc to: ', hoursInDay[element].length);
      }

      for(let a = 12; a <=24; a = a + 0.5){
        for(let eachHour in hoursInDay){
          if(a == eachHour){
            console.log(a, ' znaleziona!');
            console.log('dlugosc eachHour: ', hoursInDay[eachHour].length);
            thisBooking.hoursCompare = hoursInDay[eachHour].length;
          }
        }
        console.log('następna pętla po a');
        console.log('zmienna= ',thisBooking.hoursCompare);
        let pasek = document.createElement('div');
        stripUl.appendChild(pasek);
        //console.log('dodano element');
        if(thisBooking.hoursCompare == 3){
          pasek.classList.add('rangeSlider-red');
        } else if(thisBooking.hoursCompare == 2){
          pasek.classList.add('rangeSlider-yellow');
        } else {
          pasek.classList.add('rangeSlider-green');
        }
      }
  }

  updateSlider() {
    const thisBooking = this;
    thisBooking.dom.slider = thisBooking.dom.wrapper.querySelector('[id^="js-range"]');
    //console.log('thisBooking slider to: ', thisBooking.dom.slider);
    thisBooking.sliderDate = thisBooking.datePicker.value;
    //console.log('thisBooking date= ', thisBooking.sliderDate);
  }
}

export default Slider;
