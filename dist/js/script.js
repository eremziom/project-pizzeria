/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();

      thisProduct.getElements();

      thisProduct.initAccordion();

      thisProduct.initOrderForm();

      thisProduct.processOrder();

      console.log('new Product: ', thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;

      //generate HTML based on template
      const generateHTML = templates.menuProduct(thisProduct.data);
      //console.log(generateHTML);

      //create DOM element using utils.createElementFromHTML
      thisProduct.element = utils.createDOMFromHTML(generateHTML);

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
      console.log('SSSSSSS', thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    }

    initAccordion(){
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      const productButton = thisProduct.accordionTrigger;

      /* START: click event listener to trigger */
      productButton.addEventListener('click', function(event){
        console.log('klikniety');

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
      console.log('initOrderForm');

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
      });

    }

    processOrder(){
      const thisProduct = this;
      console.log('processOrder');

      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
      console.log('PPP', thisProduct.params);

      let price = thisProduct.data.price;
      console.log('cena to: ', price);

      for(let paramId in thisProduct.data.params){
        console.log('paramId = ', paramId);
        const param = thisProduct.data.params[paramId];
        console.log('param = ', param);

        for(let optionId in param.options){
          console.log('optionId to: ', optionId);
          const option = param.options[optionId];
          console.log('opcja: ', option);

          // If option is selected AND option is not default
          if(formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1 && !option.default){
            console.log('Dodano opcję niestandardową ', optionId);

            //add price of option to variable price
            const optionPriceAdd = option.price;
            console.log('cena dodatku to: ', optionPriceAdd);
            price = price + optionPriceAdd;
            console.log('cena produktu z dodatkiem to: ', price);
          }

          // If option is not selected AND option is default
          if(!(formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1) && option.default){
            console.log('Odjęto opcję standardową ', optionId);

            //deduct price of option from variable price
            const optionPriceDeduct = option.price;
            price = price - optionPriceDeduct;
            console.log('cena produktu bez dodatku standardowego to: ', price);
          }
        }
      }

      // Set the content of thisProduct.priceElem to be the value of variable price
      thisProduct.priceElem.innerHTML = price;
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);
      console.log(thisApp.data.products);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
        //console.log('data produktu ' + productData + ' = ', thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
      console.log(thisApp);
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}