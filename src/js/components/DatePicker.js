import BaseWidget from './BaseWidget.js';
import { settings, select } from '../settings.js';
import { utils } from '../utils.js';

class DatePicker extends BaseWidget{
  constructor(wrapper){
    super (wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;

    //console.log('zzz', wrapper);

    thisWidget.dom.wrapper = wrapper;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);
    //console.log('min', thisWidget.minDate, ' max', thisWidget.maxDate);

    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      locale: {
        firstDayOfWeek: 1,
      },
      disable: [
        function(date) {
          return (date.getDay() === 1);
        }
      ],
      onChange: function(dateStr){
        thisWidget.value = utils.dateToStr(new Date(utils.addDays(dateStr, 1)));
      }
    });
  }

  parseValue(value){
    return value;
  }

  isValid(){
    return true;
  }

  renderValue(){

  }
}

export default DatePicker;
