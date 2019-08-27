import {templates} from '../settings.js';
import {utils} from '../utils.js';

class Booking{
  constructor(element) {
    const thisBooking = this;
    console.log('booking el', element);
    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element){
    const thisBooking = this;
    console.log('działa render', element);

    const generatedHtml = templates.bookingWidget()
    //console.log(generatedHtml);

    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;

    thisBooking.elem = utils.createDOMFromHTML(generatedHtml);

    thisBooking.dom.wrapper.appendChild(thisBooking.elem);

  }

  initWidgets(){
    const thisBooking = this;

  }


}

export default Booking;
