import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();

    thisProduct.getElements();

    thisProduct.initAccordion();

    thisProduct.initOrderForm();

    thisProduct.initAmountWidget();

    thisProduct.processOrder();

    //console.log('new Product: ', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;

    //generate HTML based on template
    const generateHTML = templates.menuProduct(thisProduct.data);
    //console.log(thisProduct.data);

    //create DOM element using utils.createElementFromHTML
    thisProduct.element = utils.createDOMFromHTML(generateHTML);
    //console.log('AAAA', thisProduct.element);

    //find menu container
    const menuContainer = document.querySelector(select.containerOf.menu);

    //add element DOM to menu
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    const productButton = thisProduct.accordionTrigger;

    /* START: click event listener to trigger */
    productButton.addEventListener('click', function(event){
      //console.log('klikniety');

      /* prevent default action for event */
      event.preventDefault();

      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');

      /* find all active products */
      const activeProducts = document.querySelectorAll('.product.active');

      /* START LOOP: for each active product */
      for(let activeProduct of activeProducts){

        /* START: if the active product isn't the element of thisProduct */
        if(activeProduct != thisProduct.element){
          /* remove class active for the active product */
          activeProduct.classList.remove('active');
        /* END: if the active product isn't the element of thisProduct */
        }
        /* END LOOP: for each active product */
      }
      /* END: click event listener to trigger */
    });
  }

  initOrderForm(){
    const thisProduct = this;
    //console.log('initOrderForm');

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });

  }

  processOrder(){
    const thisProduct = this;
    //console.log('processOrder');

    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);
    //console.log('PPP', thisProduct.params);

    thisProduct.params = {};
    //console.log(thisProduct.params);

    let price = thisProduct.data.price;
    //console.log('cena to: ', price);

    for(let paramId in thisProduct.data.params){
      //console.log('paramId = ', paramId);
      const param = thisProduct.data.params[paramId];
      //console.log('param = ', param);

      for(let optionId in param.options){
        //console.log('optionId to: ', optionId);
        const option = param.options[optionId];
        //console.log('opcja: ', option);

        // If option is selected AND option is not default
        if(formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1 && !option.default){
          //console.log('Dodano opcję niestandardową ', optionId);

          //add price of option to variable price
          const optionPriceAdd = option.price;
          //console.log('cena dodatku to: ', optionPriceAdd);
          price = price + optionPriceAdd;
          //console.log('cena produktu z dodatkiem to: ', price);
        }

        // If option is not selected AND option is default
        if(!(formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1) && option.default){
          //console.log('Odjęto opcję standardową ', optionId);

          //deduct price of option from variable price
          const optionPriceDeduct = option.price;
          price = price - optionPriceDeduct;
          //console.log('cena produktu bez dodatku standardowego to: ', price);
        }

        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

        if(optionSelected) {

          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;

          //console.log('zaznaczona: ');
          let imageId = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

          for(let img of imageId) {
            img.classList.add(classNames.menuProduct.imageVisible);
          }

        } else {
          //console.log('NIE zaznaczona: ');
          let imageId = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

          for(let img of imageId) {
            img.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    // Multiply price by amount
    //price *= thisProduct.amountWidget.value;
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    // Set the content of thisProduct.priceElem to be the value of variable price
    //thisProduct.priceElem.innerHTML = price;
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('clickEvent', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    //app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);

  }
}

export default Product;
