import Booking from './Booking.js';
import {templates, select, settings, classNames} from '../settings.js';

class ColorSlider {
  constructor(dataTable, date, wrapper){
    const thisColorSlider = this;

    thisColorSlider.dom = {}
    thisColorSlider.dom.wrapper = wrapper;
    thisColorSlider.painter(dataTable, date);
  }

  painter(dataTable, date){
    const thisColorSlider = this;

    thisColorSlider.pole = thisColorSlider.dom.wrapper;
    const stripUl = document.createElement('div');
    thisColorSlider.pole.appendChild(stripUl);
    stripUl.classList.add('full-strip');

    const hoursInDay = dataTable[date];

    const finalTable = {};
    const finalTable1 = {};

    for(let a = 12; a <=24; a = a + 0.5){
      for(let eachHour in hoursInDay){
        if(a == eachHour){
          finalTable[a] = hoursInDay[eachHour].length;
        } else {
          finalTable1[a] = 0;
        }
      }
      Object.assign(finalTable1, finalTable);

      let pasek = document.createElement('div');
      stripUl.appendChild(pasek);
      if(finalTable1[a] >= 3){
        pasek.classList.add('rangeSlider-red');
      } else if(finalTable1[a] == 2){
        pasek.classList.add('rangeSlider-yellow');
      } else {
        pasek.classList.add('rangeSlider-green');
      }
    }
  }
}

export default ColorSlider;
