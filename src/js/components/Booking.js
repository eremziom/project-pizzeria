import {templates, select, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],

      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,

      ],
    };

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event   + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event   + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
        .then(function(allResponses){
          const bookingResponse = allResponses[0];
          const eventsCurrentResponse = allResponses[1];
          const eventsRepeatResponse = allResponses[2];
          return Promise.all([
            bookingResponse.json(),
            eventsCurrentResponse.json(),
            eventsRepeatResponse.json(),
          ]);
        })
        .then(function([bookings, eventsCurrent, eventsRepeat]){
          thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
        })
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

      for(let item of eventsCurrent){
        thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
      }

      for(let item of bookings){
        thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
      }

      const minDate = thisBooking.datePicker.minDate;
      const maxDate = thisBooking.datePicker.maxDate;

      for(let item of eventsRepeat){
        if(item.repeat == 'daily'){
          for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
            thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
          }
        }
      }

      thisBooking.updateDOM();
      thisBooking.initActions();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    const book = classNames.booking.tableBooked;
    const reserve = classNames.booking.tableBooked1;

    let allAvailable = false;

    if(typeof thisBooking.booked[thisBooking.date] == 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(book);
        table.classList.remove(reserve);
      } else {
        table.classList.remove(book, reserve);
      }
    }
  }

  bookTable(table){
    const thisBooking = this
    table.classList.toggle(classNames.booking.tableBooked1);
    thisBooking.id = table.getAttribute(settings.booking.tableIdAttribute);
  }

  sendBooking(){
    const thisBooking = this;

    thisBooking.phone = thisBooking.dom.phone.value;
    thisBooking.address = thisBooking.dom.address.value;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      table: parseInt(thisBooking.id),
      date: thisBooking.date,
      hour: thisBooking.hourPicker.value,
      phone: thisBooking.phone,
      address: thisBooking.address,
      ppl: thisBooking.peopleAmount.value,
      duration: thisBooking.hoursAmount.value,
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }

    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponseBooking: ', parsedResponse);
        console.log(parsedResponse.date);
        location.reload();
      });

    console.log('payload= ', payload);
    console.log('obiekt:', thisBooking.booked);
  }

  render(element){
    const thisBooking = this;

    const generatedHtml = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;

    thisBooking.elem = utils.createDOMFromHTML(generatedHtml);

    thisBooking.dom.wrapper.appendChild(thisBooking.elem);

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.phone = element.querySelector(select.cart.phone);
    thisBooking.dom.address = element.querySelector(select.cart.address);

    thisBooking.dom.submit = thisBooking.dom.wrapper.querySelector(select.booking.form);
  }

  initActions(){
    const thisBooking = this;

    thisBooking.dom.submit.addEventListener('submit', function(){
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    for(const table of thisBooking.dom.tables){
      table.addEventListener('click', function(){
        if(!table.classList.contains(classNames.booking.tableBooked)){
          thisBooking.bookTable(table);
        }
      });
    }
  }
}

export default Booking;
