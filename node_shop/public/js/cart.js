let cart = {};

let btnAddToCart = document.querySelectorAll('#btn');
btnAddToCart.forEach((element) => {
    element.addEventListener('click', addToCart);
})

if(localStorage.getItem('cart')) {
    cart = JSON.parse(localStorage.getItem('cart'));
    ajaxGetInfo();

}

function addToCart(event) {
    let goodsId = this.dataset.id;
    if(cart[goodsId]) {
        cart[goodsId]++;
    } else {
        cart[goodsId] = 1;
    }
    ajaxGetInfo();
}

function ajaxGetInfo() {
    updateLocalStorageCart();
    fetch('/get-info-product', {
        method: 'POST',
        body: JSON.stringify({keys: Object.keys(cart)}),
        headers: {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
        }
    }).then(function(response) {
        return response.text();
    }).then(function(body) {
        showCart(JSON.parse(body))
    }) 
}

function showCart(data) {
    let out = "<table class='table table-striped'><tbody>";
    let total = 0;

    for(key in cart) {
        out += `<tr><td colspan="4">${data[key]['name']}</td></tr>`
        out += `<tr><td><span class="minus" data-id="${key}">-</span></td>`
        out += `<td><span class="quantity">${cart[key]}<span></td>`
        out += `<td><span class="plus" data-id="${key}">+</span></td>`
        out += `<td><span class="cost">${data[key]['cost'] * cart[key]}</span></td></tr>`
        total += cart[key] * data[key]['cost'];
    }
    out += `<tr><td colspan="1">Итого:</td><td colspan="3">${total}</td></tr>`
    out += "</tbody></table>"
    document.querySelector('.goods-list').innerHTML = out;

    document.querySelectorAll('.minus').forEach(function(element) {
        element.addEventListener('click', decrementGoods);
    });

    document.querySelectorAll('.plus').forEach(function(element) {
        element.addEventListener('click', incrementGoods)
    });
}

function incrementGoods() {
    goodsId = this.dataset.id;
    cart[goodsId]++;
    ajaxGetInfo();
}

function decrementGoods() {
    goodsId = this.dataset.id;
    if(cart[goodsId] - 1 > 0) {
        cart[goodsId]--;
    
    } else {
        delete(cart[goodsId]);
    }

    ajaxGetInfo();
}

function updateLocalStorageCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}