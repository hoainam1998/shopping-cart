
const shopBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartOverlay = document.querySelector('.cart-overlay');
const Cart = document.querySelector('.cart');
const cartContent = document.querySelector('.cart-content');
const cartItem = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const productCenter = document.querySelector('.products-center');

//cart
let cart = [];
//buttons
let buttons = [];

// getting product
class Products {
    async getProduct() {
        try {
            let result = await fetch('products.json');
            result = await result.json();
            let product = result.items.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const images = item.fields.image.fields.file.url;
                return { title, price, id, images };
            });
            return product;
        } catch (error) {
            console.log(error);
        }
    }
}
// display products 
class UI {
    displayProduct(product) {
        let result = '';
        product.map(item => {
            result += `
            <article class="product">
            <div class="img-container">
                <img src="${item.images}" alt="product 1" class="product-img">
                <button class="bag-btn" data-id="${item.id}">
                    <i class="fas fa-shopping-cart"></i>
                    add to cart
                </button>
            </div>
            <div>
                <h3>${item.title}</h3>
                <h4>$ ${item.price}</h4>
            </div>
        </article>`;
        });
        productCenter.innerHTML = result;
    }

    getBagButton() {
        const bagBtn = [...document.querySelectorAll('.bag-btn')];
        buttons = bagBtn;
        bagBtn.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }

            button.addEventListener('click', evt => {
                button.innerText = "In Cart";
                button.disabled = true;
                //get product from products

                let cartItem = { ...Storage.getProduct(id), amount: 1 };
                cart = [...cart, cartItem];
                //save cart in local storage
                Storage.saveCart(cart);
                // set cart value
                this.setCartValue(cart);
                // display cart item
                this.addCartItem(cartItem);
                // show cart
                this.showCart();
            });
        });
    }

    setCartValue(cart) {
        let itemTotal = 0;
        let tempsTotal = 0;
        cart.map(item => {
            tempsTotal += item.price * item.amount;
            itemTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempsTotal.toFixed(2));
        cartItem.innerText = itemTotal;
    }

    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML =
            `<img src=${item.images} alt="item 1">
        <div>
            <h4>${item.title}</h4>
            <h5>$ ${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`
        cartContent.appendChild(div);
    }

    showCart() {
        cartOverlay.classList.add('transparentBcg');
        Cart.classList.add('showCart');
    }

    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        Cart.classList.remove('showCart');
    }

    cartLogic() {
        // clear cart
        clearCartBtn.addEventListener('click', () => this.clearCart());
        // cart functionality
        cartContent.addEventListener('click', evt => {
            let elementTarget = evt.target;
            if (elementTarget.classList.contains('remove-item')) {
                let id = elementTarget.dataset.id;
                this.removeItem(id);
                cartContent.removeChild(elementTarget.parentElement.parentElement);
            } else if (elementTarget.classList.contains('fa-chevron-up')) {
                let id = elementTarget.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount += 1;
                Storage.saveCart(cart);
                this.setCartValue(cart);
                elementTarget.nextElementSibling.innerText = tempItem.amount;
            } else if (elementTarget.classList.contains('fa-chevron-down')) {
                let id = elementTarget.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount -= 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValue(cart);
                    elementTarget.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild
                        (elementTarget.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }

    clearCart() {
        let cartItem = cart.map(item => item.id);
        cartItem.forEach(id => this.removeItem(id));
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValue(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>
                        add to cart`;
    }

    getSingleButton(id) {
        return buttons.find(btn => btn.dataset.id === id);
    }

    setUpApp() {
        cart = Storage.getCart();
        this.setCartValue(cart);
        this.populateCart(cart);
        shopBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
}
// local storage
class Storage {
    static saveProduct(product) {
        localStorage.setItem('products', JSON.stringify(product));
    }

    static getProduct(id) {
        let product = JSON.parse(localStorage.getItem('products'));
        return product.find(product => product.id === id);
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem('cart') ?
            JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const products = new Products();
    const ui = new UI();

    ui.setUpApp();

    products.getProduct().then(product => {
        ui.displayProduct(product);
        Storage.saveProduct(product);
    }).then(() => {
        ui.getBagButton();
        ui.cartLogic();
    })
});
