// rd51625 grN1 script.js

document.addEventListener('DOMContentLoaded', () => {
    let currentSlide = 0;
    let productsData = [];
    const totalSlides = 3;

    const currentPage = window.location.pathname.split("/").pop();
    const sliderSection = document.querySelector('.slider');
    const productsSection = document.querySelector('.products');

	if (currentPage === 'https://darrad11.github.io/puzzlequeststore/') {
        // Ustawiamy sekcje na widoczne
        if (sliderSection) sliderSection.style.display = 'block';
        if (productsSection) productsSection.style.display = 'block';

        const prevButton = document.querySelector('.prev');
        const nextButton = document.querySelector('.next');
        const dots = document.querySelectorAll('.dot');
        
        // Funkcja do wyświetlania slajdów
        function showSlide(index) {
            if (index >= totalSlides) currentSlide = 0;
            else if (index < 0) currentSlide = totalSlides - 1;
            else currentSlide = index;

            const slidesContainer = document.querySelector('.slides');
            slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;

            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentSlide].classList.add('active');
        }

        function nextSlide() { showSlide(currentSlide + 1); }
        function prevSlide() { showSlide(currentSlide - 1); }

        if (nextButton) nextButton.addEventListener('click', nextSlide);
        if (prevButton) prevButton.addEventListener('click', prevSlide);

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.getAttribute('data-slide'));
                showSlide(slideIndex);
            });
        });

        if (sliderSection) {
            let slideInterval = setInterval(nextSlide, 5000);
            sliderSection.addEventListener('mouseenter', () => clearInterval(slideInterval));
            sliderSection.addEventListener('mouseleave', () => slideInterval = setInterval(nextSlide, 5000));
        }

        showSlide(currentSlide);
    }
	
    // hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('nav ul');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('toggle');
        });
    }

    // scroll to contact section
    function scrollToSection(event, sectionId) {
        event.preventDefault();
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop - 50,
                behavior: 'smooth'
            });
        }
    }

    // scroll to contact section
    const contactLink = document.getElementById('contact-link');
    if (contactLink) {
        contactLink.addEventListener('click', event => scrollToSection(event, 'contact'));
    }

	function applyFilter(category) {
		console.log(`Applying filter: ${category}`);

		filterButtons.forEach(button => {
			const btnCategory = button.getAttribute('data-category');
			button.classList.toggle('active', btnCategory === category);
		});

		let filteredProducts = productsData.filter(product => {
			if (category === 'all') return true;
			if (category === 'bestseller') return product.bestseller;
			return product.category === category || product.type === category;
		});
	
		renderProducts(filteredProducts);
	}
	
	document.addEventListener('click', (event) => {
        console.log('Selected:', event.target);
		if (event.target.classList.contains('filter-btn')) {
			const category = event.target.getAttribute('data-category');
			console.log(`Category: ${category}`);
			applyFilter(category);
		}
    });

    // product filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productGrid = document.getElementById('product-grid');
	
	// handle clicks on filter buttons
    filterButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			const category = btn.getAttribute('data-category');
			applyFilter(category);
		});
	});
	
	document.querySelector('nav').addEventListener('click', event => {
		if (event.target.matches('bestsellers-link')) {
			applyFilter('bestseller');
		} else if (event.target.matches('products-link')) {
			applyFilter('all');
		}
	});

    // render products function
    function renderProducts(products) {
        if (!productGrid) return;
        
        productGrid.innerHTML = '';
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.classList.add('product');
            productElement.setAttribute('data-category', product.category);
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>Price: $ ${product.price}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            `;
            productGrid.appendChild(productElement);
        });

        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => button.addEventListener('click', addToCart));
    }
	
    // product data
	fetch('./products.json')
		.then(response => response.json())
		.then(data => {
			productsData = data.products;
			renderProducts(productsData);
			console.log('Products loaded:', productsData);
		})
		.catch(error => console.error('Error loading products:', error));

	// add product to cart function
    const cart = [];
    function addToCart(event) {
		const productId = parseInt(event.target.getAttribute('data-id'));
		const product = productsData.find(p => p.id === productId);
		if (product) {
			const cart = JSON.parse(localStorage.getItem('cart')) || [];

			const existingProduct = cart.find(item => item.id === productId);

			if (existingProduct) {
				existingProduct.quantity += 1;
			} else {
				product.quantity = 1;
				cart.push(product);
			}

			localStorage.setItem('cart', JSON.stringify(cart));

			alert(`${product.name} has been added to the cart!`);
			console.log(cart);
		}
	}	

    // order-history.json loading on profile.html
    const orderItemsContainer = document.getElementById('order-items');
    if (orderItemsContainer) {
        fetch('./order-history.json')
            .then(response => response.json())
            .then(data => renderOrderHistory(data.orders))
            .catch(error => console.error('Error loading order history:', error));
    }

    // filters in hamburger menu
    const bestsellersLink = document.getElementById('.bestsellers-link');
    const productsLink = document.getElementById('.products-link');

    if (bestsellersLink) {
		bestsellersLink.addEventListener('click', event => {
			event.preventDefault();
			applyFilter('bestseller');
			document.querySelector('.landing').style.display = 'none';
			document.querySelector('.products').style.display = 'block';
		});
	}


    if (productsLink) {
        productsLink.addEventListener('click', event => {
            event.preventDefault();
            applyFilter('all');
            //document.querySelector('.landing').style.display = 'none';
            document.querySelector('.products').style.display = 'block';
        });
    }

	// check if on cart.html to render the cart
    if (currentPage === 'cart.html') {
        renderCartItems();

        const clearCartButton = document.getElementById('clear-cart-button');
        const checkoutButton = document.getElementById('checkout-button');

        if (clearCartButton) {
            clearCartButton.addEventListener('click', clearCart);
        }

        if (checkoutButton) {
            checkoutButton.addEventListener('click', proceedToCheckout);
        }
    }

    // render cart items on cart.html
    function renderCartItems() {
		const cartItemsContainer = document.getElementById('cart-items');
		const cart = JSON.parse(localStorage.getItem('cart')) || [];

		if (!cartItemsContainer) return;

		cartItemsContainer.innerHTML = '';

		if (cart.length === 0) {
			cartItemsContainer.innerHTML = '<p>Your cart is empty!</p>';
		} else {
			cart.forEach((product, index) => {
				const productElement = document.createElement('div');
				productElement.classList.add('cart-item');
				productElement.innerHTML = `
					<img src="${product.image}" alt="${product.name}" class="thumbnail">
					<h3>${product.name}</h3>
					<p>Price: $ ${product.price}</p>
                
					<!-- Quantity input -->
					<label for="quantity-${index}">Quantity:</label>
					<input type="number" id="quantity-${index}" value="${product.quantity || 1}" min="1" data-index="${index}" class="quantity-input">
                
					<!-- Remove button -->
					<button class="remove-from-cart" data-index="${index}">Remove from Cart</button>
				`;
				cartItemsContainer.appendChild(productElement);
			});
	
			const quantityInputs = document.querySelectorAll('.quantity-input');
			const removeButtons = document.querySelectorAll('.remove-from-cart');
        
			quantityInputs.forEach(input => input.addEventListener('input', updateQuantity));
			removeButtons.forEach(button => button.addEventListener('click', removeFromCart));
		}

		// update the total price
		calculateTotal();
	}

    // remove item from cart
    function removeFromCart(event) {
        const index = event.target.getAttribute('data-index');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
    }

    // update quantity of a product in the cart
    function updateQuantity(event) {
        const index = event.target.getAttribute('data-index');
        const quantity = parseInt(event.target.value);
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (quantity > 0) {
            cart[index].quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartItems();
        }
    }

    // calculate and update the total price
    function calculateTotal() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let total = 0;

        cart.forEach(product => {
            total += (product.price * (product.quantity || 1));
        });

        const totalPriceElement = document.getElementById('total-price');
        if (totalPriceElement) {
            totalPriceElement.textContent = total.toFixed(2);
        }
    }

    // clear the cart
    function clearCart() {
        localStorage.removeItem('cart');
        renderCartItems();
    }

    // proceed to checkout
    function proceedToCheckout() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert("Your cart is empty! Add items to the cart before proceeding.");
        } else {
            alert("Proceeding to checkout..."); 
			// to profile.html
			window.location.href = "./profile.html";
        }
    }
});

// Render cart items on cart.html
// function renderCartItems() 

// Remove item from cart
//function removeFromCart(event)

// Update quantity of a product in the cart
//function updateQuantity(event)
// new order in profile.html
function renderNewOrder() {
    const newOrderItemsContainer = document.getElementById('new-order-items');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (!newOrderItemsContainer) return;
    newOrderItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        newOrderItemsContainer.innerHTML = '<p>Your cart is empty!</p>';
    } else {
		const orderId = `Order-${Date.now()}`;
        const date = new Date().toLocaleDateString();
        let total = 0;

        const orderItems = cart.map(item => {
            total += item.price * item.quantity;
            return `<li>${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</li>`;
        }).join('');
        const orderElement = document.createElement('div');
        orderElement.classList.add('order');
        orderElement.innerHTML = `
            <h4>Order ID: ${orderId}</h4>
            <p>Date: ${date}</p>
            <p>Total: $${total.toFixed(2)}</p>
            <h5>Items:</h5>
            <ul>${orderItems}</ul>
        `;
            newOrderItemsContainer.appendChild(productElement);
    }
}

function renderOrderHistory(orders) {
    const orderItemsContainer = document.getElementById('order-items');
    if (!orderItemsContainer) return;

    orderItemsContainer.innerHTML = '';
    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.classList.add('order');
        orderElement.innerHTML = `
            <h4>Order ID: ${order.orderId}</h4>
            <p>Date: ${order.date}</p>
            <p>Total: ${order.total}</p>
            <h5>Items:</h5>
            <ul>${order.items.map(item => `<li>${item.productName} (x${item.quantity})</li>`).join('')}</ul>
        `;
        orderItemsContainer.appendChild(orderElement);
    });
}
