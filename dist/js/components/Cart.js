import {settings, select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';

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

export default Cart;
