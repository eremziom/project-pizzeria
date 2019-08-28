import {templates, select} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';

class Booking{
  constructor(element) {
    const thisBooking = this;
    //console.log('booking el', element);
    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element){
    const thisBooking = this;
    //console.log('działa render', element);

    const generatedHtml = templates.bookingWidget();
    //console.log(generatedHtml);

    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;

    thisBooking.elem = utils.createDOMFromHTML(generatedHtml);

    thisBooking.dom.wrapper.appendChild(thisBooking.elem);

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    console.log('aaa', thisBooking.dom.datePicker);

    //console.log('ppl', thisBooking.dom.peopleAmount, 'hrs', thisBooking.dom.hoursAmount);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker();
  }
}

export default Booking;
