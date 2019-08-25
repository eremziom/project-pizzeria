/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
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

      app.cart.add(thisProduct);

    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);

      thisWidget.value = settings.amountWidget.defaultValue;

      thisWidget.setValue(thisWidget.value);
      thisWidget.initActions();

      //console.log('AmountWidget: ', thisWidget);
      //console.log('constructor arguments: ', element);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      //Add validation
      if(newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce(){
      const thisWidget = this;

      const event = new Event('clickEvent');
      thisWidget.element.dispatchEvent(event);

      const event2 = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event2);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      //console.log(thisCart.deliveryFee);

      thisCart.products = [];

      thisCart.getElements(element);

      thisCart.initActions();

      //console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = element.querySelector(select.cart.productList);
      thisCart.dom.form = element.querySelector(select.cart.form);
      thisCart.dom.phone = element.querySelector(select.cart.phone);
      thisCart.dom.address = element.querySelector(select.cart.address);

      thisCart.renderTotalKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

      for(let key of thisCart.renderTotalKeys){
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }

    }

    initActions(){
      const thisCart = this;

      const cartButton = thisCart.dom.toggleTrigger;

      cartButton.addEventListener('click', function(event){

        event.preventDefault();

        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);

        console.log('koszyk kliknięty');
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function(){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(){
        event.preventDefault();
        console.log('klik?');
        thisCart.sendOrder();
      });
    }

    sendOrder(){

      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.order;
        
      const payload = {
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        phone: thisCart.dom.phone.value,
        address: thisCart.dom.address.value,
        products: [

        ],
      };

      for(let product of thisCart.products){
        product = product.getData();
        payload.products.push(product);
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
        .then(function(response){
          return response.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse: ', parsedResponse);
        });
    }

    add(menuProduct){
      const thisCart = this;

      //console.log('dodawanie produktu', menuProduct);
      //console.log('element to: ', menuProduct.element);

      //generate HTML based on template
      const generateHTML = templates.cartProduct(menuProduct);
      //console.log(generateHTML);

      //create DOM element using utils.createElementFromHTML
      menuProduct.element = utils.createDOMFromHTML(generateHTML);
      //console.log('aaa', menuProduct.element);

      const generatedDOM = menuProduct.element;
      //console.log('aaa', generatedDOM);

      //find cart container
      const cartContainer = thisCart.dom.productList;

      //add element DOM to cart
      cartContainer.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      //console.log('thisCart.Products ', thisCart.products);

      thisCart.update();
    }

    update(){
      const thisCart = this;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for(let product of thisCart.products){
        //console.log(product);
        //console.log(product.price);
        thisCart.subtotalPrice = thisCart.subtotalPrice + product.price;
        thisCart.totalNumber = thisCart.totalNumber + product.amount;
      }

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      console.log('number: ',thisCart.totalNumber);
      console.log('subprice : ',thisCart.subtotalPrice);
      console.log('totprice : ',thisCart.totalPrice);

      for(let key of thisCart.renderTotalKeys){
        for(let elem of thisCart.dom[key]){
          elem.innerHTML = thisCart[key];
        }
      }
    }

    remove(cartProduct){
      const thisCart = this;
      const index = thisCart.products.indexOf(cartProduct);
      console.log(thisCart.products);
      console.log(index);
      thisCart.products.splice(index, 1);
      console.log(thisCart.products);
      cartProduct.dom.wrapper.remove();
      thisCart.update();
    }
  }

  class CartProduct{
    constructor(menuProduct, element){

      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;

      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initAction();

      //console.log('bbbbb',menuProduct);
      //console.log("aaaaaaaaaaaaaaa", thisCartProduct);
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        //console.log('kklliikk');
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        //console.log('ilosc to: ', thisCartProduct.amount);
        thisCartProduct.price = thisCartProduct.amount*thisCartProduct.priceSingle;
        //console.log('Cena to: ', thisCartProduct.price);
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
      console.log('wywoałano remove');
    }

    initAction(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }

    getData(){
      const thisCartProduct = this;

      
      const prod = {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        params: thisCartProduct.params,

      };
      return prod;
      console.log(prod);


      console.log('działa?');
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);
      //console.log(thisApp.data.products);

      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
        //console.log('data produktu ' + productData + ' = ', thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.product;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse: ', parsedResponse);

          //save parsedResponse as thisApp.data.products
          thisApp.data.products = parsedResponse;
          //execute initMenu method
          thisApp.initMenu();
        });

      console.log('thisApp.data: ', JSON.stringify(thisApp.data));
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();
}
