    

        // ===== SHOPPING CART SYSTEM =====
        class ShoppingCart {
            constructor() {
                this.items = JSON.parse(localStorage.getItem('cart')) || [];
                this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
                this.updateCartDisplay();
                this.updateWishlistCount();
            }

            addItem(productId, name, price, image, quantity = 1) {
                const existingItem = this.items.find(item => item.id === productId);
                
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    this.items.push({
                        id: productId,
                        name: name,
                        price: price,
                        image: image,
                        quantity: quantity
                    });
                }
                
                this.saveCart();
                this.updateCartDisplay();
                this.showNotification(`${name} added to cart`);
            }

            removeItem(productId) {
                this.items = this.items.filter(item => item.id !== productId);
                this.saveCart();
                this.updateCartDisplay();
                this.showNotification('Item removed from cart');
            }

            updateQuantity(productId, newQuantity) {
                const item = this.items.find(item => item.id === productId);
                if (item) {
                    if (newQuantity < 1) {
                        this.removeItem(productId);
                    } else {
                        item.quantity = newQuantity;
                        this.saveCart();
                        this.updateCartDisplay();
                    }
                }
            }

            getTotal() {
                return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
            }

            getItemCount() {
                return this.items.reduce((count, item) => count + item.quantity, 0);
            }

            saveCart() {
                localStorage.setItem('cart', JSON.stringify(this.items));
            }

            updateCartDisplay() {
                const cartCount = document.getElementById('cartCount');
                const cartItems = document.getElementById('cartItems');
                const cartTotal = document.getElementById('cartTotal');
                const cartFooter = document.getElementById('cartFooter');
                
                cartCount.textContent = this.getItemCount();
                
                if (this.items.length === 0) {
                    cartItems.innerHTML = `
                        <div class="cart-empty">
                            <i class="fas fa-shopping-cart"></i>
                            <p>Your cart is empty</p>
                        </div>
                    `;
                    cartFooter.style.display = 'none';
                } else {
                    cartItems.innerHTML = this.items.map(item => `
                        <div class="cart-item" data-product-id="${item.id}">
                            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                            <div class="cart-item-details">
                                <div class="cart-item-name">${item.name}</div>
                                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                                <div class="cart-item-quantity">
                                    <button class="quantity-btn minus" data-product-id="${item.id}">-</button>
                                    <span class="quantity-value">${item.quantity}</span>
                                    <button class="quantity-btn plus" data-product-id="${item.id}">+</button>
                                </div>
                            </div>
                            <button class="cart-item-remove" data-product-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('');
                    
                    cartTotal.textContent = `$${this.getTotal().toFixed(2)}`;
                    cartFooter.style.display = 'block';
                }
            }

            toggleWishlist(productId) {
                const index = this.wishlist.indexOf(productId);
                if (index === -1) {
                    this.wishlist.push(productId);
                    this.showNotification('Added to wishlist');
                } else {
                    this.wishlist.splice(index, 1);
                    this.showNotification('Removed from wishlist');
                }
                localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
                this.updateWishlistCount();
                return index === -1;
            }

            isInWishlist(productId) {
                return this.wishlist.includes(productId);
            }

            updateWishlistCount() {
                const wishlistCount = document.getElementById('wishlistCount');
                if (wishlistCount) {
                    wishlistCount.textContent = this.wishlist.length;
                }
            }

            showNotification(message) {
                const notification = document.createElement('div');
                notification.className = 'notification';
                notification.textContent = message;
                notification.style.cssText = `
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background-color: var(--primary);
                    color: white;
                    padding: 15px 25px;
                    border-radius: var(--radius);
                    box-shadow: var(--shadow);
                    z-index: 2000;
                    animation: slideIn 0.3s ease;
                `;
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }, 3000);
            }

            getCartItems() {
                return this.items;
            }
        }

        // ===== USER ACCOUNT SYSTEM =====
        class UserAccount {
            constructor() {
                this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
                this.users = JSON.parse(localStorage.getItem('users')) || [];
                this.updateAccountDisplay();
            }

            register(name, email, password) {
                if (this.users.find(user => user.email === email)) {
                    return { success: false, message: 'Email already registered' };
                }

                const newUser = {
                    id: Date.now(),
                    name: name,
                    email: email,
                    password: password,
                    joined: new Date().toISOString(),
                    orders: []
                };

                this.users.push(newUser);
                localStorage.setItem('users', JSON.stringify(this.users));
                this.login(email, password);
                
                return { success: true, message: 'Registration successful' };
            }

            login(email, password) {
                const user = this.users.find(user => 
                    user.email === email && user.password === password
                );

                if (user) {
                    this.currentUser = user;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.updateAccountDisplay();
                    return { success: true, message: 'Login successful' };
                } else {
                    return { success: false, message: 'Invalid email or password' };
                }
            }

            logout() {
                this.currentUser = null;
                localStorage.removeItem('currentUser');
                this.updateAccountDisplay();
                return { success: true, message: 'Logged out successfully' };
            }

            updateAccountDisplay() {
                const loginLink = document.getElementById('loginLink');
                const registerLink = document.getElementById('registerLink');
                const ordersLink = document.getElementById('ordersLink');
                const profileLink = document.getElementById('profileLink');
                const logoutLink = document.getElementById('logoutLink');
                const accountButton = document.getElementById('accountButton');
                const actionText = accountButton.querySelector('.action-text');

                if (this.currentUser) {
                    loginLink.style.display = 'none';
                    registerLink.style.display = 'none';
                    ordersLink.style.display = 'block';
                    profileLink.style.display = 'block';
                    logoutLink.style.display = 'block';
                    
                    actionText.textContent = this.currentUser.name.split(' ')[0];
                    accountButton.querySelector('.action-icon').className = 'fas fa-user-check action-icon';
                } else {
                    loginLink.style.display = 'block';
                    registerLink.style.display = 'block';
                    ordersLink.style.display = 'none';
                    profileLink.style.display = 'none';
                    logoutLink.style.display = 'none';
                    
                    actionText.textContent = 'Account';
                    accountButton.querySelector('.action-icon').className = 'fas fa-user-circle action-icon';
                }
            }

            getCurrentUser() {
                return this.currentUser;
            }
        }

        // ===== INITIALIZE SYSTEMS =====
        const cart = new ShoppingCart();
        const userAccount = new UserAccount();

        // ===== COUNTDOWN TIMER =====
        class CountdownTimer {
            constructor() {
                this.endTime = new Date();
                this.endTime.setHours(this.endTime.getHours() + 24);
                this.update();
                this.interval = setInterval(() => this.update(), 1000);
            }

            update() {
                const now = new Date();
                const diff = this.endTime - now;

                if (diff <= 0) {
                    clearInterval(this.interval);
                    this.reset();
                    return;
                }

                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
                document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
                document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
            }

            reset() {
                this.endTime = new Date();
                this.endTime.setHours(this.endTime.getHours() + 24);
                this.update();
                this.interval = setInterval(() => this.update(), 1000);
            }
        }

        // ===== PRODUCT RENDERER =====
        class ProductRenderer {
            constructor() {
                this.currentProducts = [...products];
                this.filteredProducts = [...products];
                this.currentCategory = 'all';
                this.currentSort = 'featured';
                this.minPrice = 0;
                this.maxPrice = 10000;
                this.renderProducts();
                this.setupEventListeners();
            }

            renderProducts() {
                const productGrid = document.getElementById('productGrid');
                productGrid.innerHTML = '';

                this.filteredProducts.forEach((product, index) => {
                    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                    const ratingStars = this.generateStars(product.rating);
                    const isInWishlist = cart.isInWishlist(product.id);
                    
                    const productCard = document.createElement('div');
                    productCard.className = `product-card fade-in delay-${index % 8}`;
                    productCard.setAttribute('data-product-id', product.id);
                    productCard.setAttribute('data-category', product.category);
                    productCard.setAttribute('data-price', product.price);

                    productCard.innerHTML = `
                        <div class="product-card-inner">
                            <div class="product-front">
                                <div class="product-image-container">
                                    <img src="${product.image}" alt="${product.name}" class="product-image" data-product-id="${product.id}">
                                    <span class="product-badge">${discount}% OFF</span>
                                    <button class="product-wishlist ${isInWishlist ? 'active' : ''}" data-product-id="${product.id}">
                                        <i class="fas fa-heart"></i>
                                    </button>
                                </div>
                                <div class="product-info">
                                    <div class="product-category">${this.getCategoryName(product.category)}</div>
                                    <h3 class="product-name" data-product-id="${product.id}">${product.name}</h3>
                                    <div class="product-rating">
                                        <div class="stars" data-rating="${product.rating}">
                                            ${ratingStars}
                                        </div>
                                        <span class="rating-count">(${product.reviews})</span>
                                    </div>
                                    <div class="product-price">
                                        <span class="current-price">$${product.price.toFixed(2)}</span>
                                        <span class="original-price">$${product.originalPrice.toFixed(2)}</span>
                                        <span class="discount">${discount}% OFF</span>
                                    </div>
                                </div>
                                <div class="product-actions">
                                    <button class="btn add-to-cart" data-product-id="${product.id}">Add to Cart</button>
                                </div>
                            </div>
                            <div class="product-back">
                                <p class="product-description">${product.description}</p>
                                <ul class="product-features">
                                    ${product.features.slice(0, 4).map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                                </ul>
                                <button class="btn add-to-cart" data-product-id="${product.id}">Add to Cart</button>
                            </div>
                        </div>
                    `;

                    productGrid.appendChild(productCard);
                });
            }

            generateStars(rating) {
                let stars = '';
                const fullStars = Math.floor(rating);
                const hasHalfStar = rating % 1 >= 0.5;

                for (let i = 1; i <= 5; i++) {
                    if (i <= fullStars) {
                        stars += '<i class="fas fa-star star active" data-value="' + i + '"></i>';
                    } else if (i === fullStars + 1 && hasHalfStar) {
                        stars += '<i class="fas fa-star-half-alt star active" data-value="' + i + '"></i>';
                    } else {
                        stars += '<i class="fas fa-star star" data-value="' + i + '"></i>';
                    }
                }
                return stars;
            }

            getCategoryName(category) {
                const categories = {
                    'electronics': 'Electronics',
                    'fashion': 'Fashion',
                    'home': 'Home & Garden',
                    'phones': 'Phones & Tablets',
                    'computing': 'Computing'
                };
                return categories[category] || category;
            }

            filterProducts() {
                this.filteredProducts = [...this.currentProducts];

                // Filter by category
                if (this.currentCategory !== 'all') {
                    this.filteredProducts = this.filteredProducts.filter(
                        product => product.category === this.currentCategory
                    );
                }

                // Filter by price range
                this.filteredProducts = this.filteredProducts.filter(
                    product => product.price >= this.minPrice && product.price <= this.maxPrice
                );

                // Sort products
                this.sortProducts();

                this.renderProducts();
            }

            sortProducts() {
                switch (this.currentSort) {
                    case 'price-low':
                        this.filteredProducts.sort((a, b) => a.price - b.price);
                        break;
                    case 'price-high':
                        this.filteredProducts.sort((a, b) => b.price - a.price);
                        break;
                    case 'rating':
                        this.filteredProducts.sort((a, b) => b.rating - a.rating);
                        break;
                    case 'newest':
                        this.filteredProducts.sort((a, b) => b.id - a.id);
                        break;
                    default:
                        // Featured - default sorting
                        break;
                }
            }

            setupEventListeners() {
                // Category filter
                document.getElementById('categoryFilter').addEventListener('change', (e) => {
                    this.currentCategory = e.target.value;
                    this.filterProducts();
                });

                // Sort filter
                document.getElementById('sortFilter').addEventListener('change', (e) => {
                    this.currentSort = e.target.value;
                    this.filterProducts();
                });

                // Price filter
                document.getElementById('applyPriceFilter').addEventListener('click', () => {
                    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
                    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || 10000;
                    
                    if (minPrice > maxPrice) {
                        cart.showNotification('Minimum price cannot be greater than maximum price');
                        return;
                    }

                    this.minPrice = minPrice;
                    this.maxPrice = maxPrice;
                    this.filterProducts();
                });

                // Price input validation
                document.getElementById('minPrice').addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    if (value < 0) e.target.value = 0;
                    if (value > 10000) e.target.value = 10000;
                });

                document.getElementById('maxPrice').addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    if (value < 0) e.target.value = 0;
                    if (value > 10000) e.target.value = 10000;
                });
            }
        }

        // ===== PRODUCT DETAIL VIEWER =====
        class ProductDetailViewer {
            showProductDetail(productId) {
                const product = products.find(p => p.id === parseInt(productId));
                if (!product) return;

                const modal = document.getElementById('productDetailModal');
                const content = document.getElementById('productDetailContent');
                const title = document.getElementById('productDetailTitle');
                
                title.textContent = product.name;
                
                const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                const ratingStars = this.generateStars(product.rating);
                
                content.innerHTML = `
                    <div>
                        <img src="${product.image}" alt="${product.name}" class="product-detail-image">
                    </div>
                    <div class="product-detail-info">
                        <h2>${product.name}</h2>
                        <div class="product-rating" style="margin-bottom: 15px;">
                            <div class="stars">
                                ${ratingStars}
                            </div>
                            <span class="rating-count">${product.rating} (${product.reviews} reviews)</span>
                        </div>
                        <div class="product-detail-price">
                            $${product.price.toFixed(2)} 
                            <span style="font-size: 20px; color: var(--gray); text-decoration: line-through; margin-left: 10px;">
                                $${product.originalPrice.toFixed(2)}
                            </span>
                            <span style="background-color: #ff4757; color: white; padding: 4px 8px; border-radius: 4px; font-size: 14px; margin-left: 10px;">
                                Save ${discount}%
                            </span>
                        </div>
                        <p class="product-detail-description">${product.description}</p>
                        
                        <div class="product-detail-specs">
                            <h4>Key Features:</h4>
                            <ul>
                                ${product.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="product-detail-specs">
                            <h4>Product Details:</h4>
                            <ul>
                                <li><i class="fas fa-tag"></i> Brand: ${product.brand}</li>
                                <li><i class="fas fa-box"></i> Category: ${productRenderer.getCategoryName(product.category)}</li>
                                <li><i class="fas fa-cubes"></i> Stock: ${product.stock} units available</li>
                                <li><i class="fas fa-shipping-fast"></i> Free shipping on orders over $100</li>
                                <li><i class="fas fa-undo"></i> 30-day return policy</li>
                            </ul>
                        </div>
                        
                        <div class="quantity-selector">
                            <label for="productQuantity">Quantity:</label>
                            <input type="number" id="productQuantity" class="quantity-input" value="1" min="1" max="${product.stock}">
                        </div>
                        
                        <div style="display: flex; gap: 15px; margin-top: 30px;">
                            <button class="btn add-to-cart" data-product-id="${product.id}" style="flex: 1;">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                            <button class="btn btn-secondary" id="buyNowBtn" data-product-id="${product.id}" style="flex: 1;">
                                <i class="fas fa-bolt"></i> Buy Now
                            </button>
                        </div>
                    </div>
                `;

                modal.style.display = 'flex';
                
                // Add event listeners for buttons in the modal
                setTimeout(() => {
                    const addToCartBtn = content.querySelector('.add-to-cart');
                    const buyNowBtn = document.getElementById('buyNowBtn');
                    const quantityInput = document.getElementById('productQuantity');
                    
                    addToCartBtn.addEventListener('click', () => {
                        const quantity = parseInt(quantityInput.value) || 1;
                        cart.addItem(product.id, product.name, product.price, product.image, quantity);
                        modal.style.display = 'none';
                    });
                    
                    if (buyNowBtn) {
                        buyNowBtn.addEventListener('click', () => {
                            const quantity = parseInt(quantityInput.value) || 1;
                            cart.addItem(product.id, product.name, product.price, product.image, quantity);
                            modal.style.display = 'none';
                            // Open checkout modal
                            setTimeout(() => {
                                checkout.openCheckout();
                            }, 500);
                        });
                    }
                }, 100);
            }

            generateStars(rating) {
                let stars = '';
                const fullStars = Math.floor(rating);
                const hasHalfStar = rating % 1 >= 0.5;

                for (let i = 1; i <= 5; i++) {
                    if (i <= fullStars) {
                        stars += '<i class="fas fa-star" style="color: #ffc107;"></i>';
                    } else if (i === fullStars + 1 && hasHalfStar) {
                        stars += '<i class="fas fa-star-half-alt" style="color: #ffc107;"></i>';
                    } else {
                        stars += '<i class="fas fa-star" style="color: var(--light-gray);"></i>';
                    }
                }
                return stars;
            }
        }

        // ===== CHECKOUT SYSTEM =====
        class CheckoutSystem {
            constructor() {
                this.currentStep = 1;
            }

            openCheckout() {
                if (cart.getCartItems().length === 0) {
                    cart.showNotification('Your cart is empty');
                    return;
                }

                if (!userAccount.getCurrentUser()) {
                    document.getElementById('loginModal').style.display = 'flex';
                    cart.showNotification('Please login to checkout');
                    return;
                }

                this.updateCheckoutSummary();
                document.getElementById('checkoutModal').style.display = 'flex';
            }

            updateCheckoutSummary() {
                const summary = document.getElementById('checkoutSummary');
                const total = document.getElementById('checkoutTotal');
                
                let summaryHTML = '';
                let subtotal = 0;
                
                cart.getCartItems().forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    subtotal += itemTotal;
                    
                    summaryHTML += `
                        <div class="summary-item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>$${itemTotal.toFixed(2)}</span>
                        </div>
                    `;
                });

                const shipping = subtotal > 100 ? 0 : 9.99;
                const tax = subtotal * 0.08;
                const grandTotal = subtotal + shipping + tax;

                summaryHTML += `
                    <div class="summary-item">
                        <span>Subtotal</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span>Shipping</span>
                        <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span>Tax (8%)</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                `;

                summary.innerHTML = summaryHTML;
                total.textContent = `$${grandTotal.toFixed(2)}`;
            }
        }

        // ===== INITIALIZE COMPONENTS =====
        const countdown = new CountdownTimer();
        const productRenderer = new ProductRenderer();
        const productDetailViewer = new ProductDetailViewer();
        const checkout = new CheckoutSystem();

        // ===== EVENT LISTENERS =====
        
        // Account dropdown toggle
        document.getElementById('accountButton').addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('accountDropdown');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            document.getElementById('cartDropdown').style.display = 'none';
        });

        // Cart dropdown toggle
        document.getElementById('cartButton').addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('cartDropdown');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            document.getElementById('accountDropdown').style.display = 'none';
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.account-container')) {
                document.getElementById('accountDropdown').style.display = 'none';
            }
            if (!e.target.closest('.cart-container')) {
                document.getElementById('cartDropdown').style.display = 'none';
            }
        });

        // Modal controls
        document.getElementById('loginLink').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('accountDropdown').style.display = 'none';
            document.getElementById('loginModal').style.display = 'flex';
        });

        document.getElementById('registerLink').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('accountDropdown').style.display = 'none';
            document.getElementById('registerModal').style.display = 'flex';
        });

        document.getElementById('showRegisterModalLink').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('registerModal').style.display = 'flex';
        });

        document.getElementById('showLoginModalLink').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('registerModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'flex';
        });

        // Close modals
        document.getElementById('closeLoginModal').addEventListener('click', () => {
            document.getElementById('loginModal').style.display = 'none';
        });

        document.getElementById('closeRegisterModal').addEventListener('click', () => {
            document.getElementById('registerModal').style.display = 'none';
        });

        document.getElementById('closeProductDetailModal').addEventListener('click', () => {
            document.getElementById('productDetailModal').style.display = 'none';
        });

        document.getElementById('closeCheckoutModal').addEventListener('click', () => {
            document.getElementById('checkoutModal').style.display = 'none';
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Product interactions
        document.addEventListener('click', (e) => {
            // Add to cart
            if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
                e.preventDefault();
                const button = e.target.classList.contains('add-to-cart') ? 
                    e.target : e.target.closest('.add-to-cart');
                const productId = button.getAttribute('data-product-id');
                const product = products.find(p => p.id === parseInt(productId));
                
                if (product) {
                    cart.addItem(product.id, product.name, product.price, product.image, 1);
                }
            }

            // View product details (image or name click)
            if (e.target.classList.contains('product-image') || 
                (e.target.classList.contains('product-name') && !e.target.classList.contains('add-to-cart'))) {
                const productId = e.target.getAttribute('data-product-id');
                if (productId) {
                    productDetailViewer.showProductDetail(productId);
                }
            }

            // Wishlist toggle
            if (e.target.classList.contains('product-wishlist') || e.target.closest('.product-wishlist')) {
                e.preventDefault();
                const button = e.target.classList.contains('product-wishlist') ? 
                    e.target : e.target.closest('.product-wishlist');
                const productId = button.getAttribute('data-product-id');
                
                const added = cart.toggleWishlist(parseInt(productId));
                button.classList.toggle('active', added);
            }

            // Cart quantity controls
            if (e.target.classList.contains('quantity-btn')) {
                const button = e.target;
                const productId = button.getAttribute('data-product-id');
                const cartItem = button.closest('.cart-item');
                const quantityValue = cartItem.querySelector('.quantity-value');
                let quantity = parseInt(quantityValue.textContent);
                
                if (button.classList.contains('plus')) {
                    quantity++;
                } else if (button.classList.contains('minus')) {
                    quantity--;
                }
                
                cart.updateQuantity(parseInt(productId), quantity);
            }

            // Remove from cart
            if (e.target.classList.contains('cart-item-remove') || e.target.closest('.cart-item-remove')) {
                const button = e.target.classList.contains('cart-item-remove') ? 
                    e.target : e.target.closest('.cart-item-remove');
                const productId = button.getAttribute('data-product-id');
                cart.removeItem(parseInt(productId));
            }
        });

        // Checkout button
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            checkout.openCheckout();
        });

        // View cart button
        document.getElementById('viewCartBtn').addEventListener('click', () => {
            document.getElementById('cartDropdown').style.display = 'none';
            cart.showNotification('Cart page would open here');
        });

        // Logout
        document.getElementById('logoutLink').addEventListener('click', (e) => {
            e.preventDefault();
            userAccount.logout();
            document.getElementById('accountDropdown').style.display = 'none';
            cart.showNotification('Logged out successfully');
        });

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const result = userAccount.login(email, password);
            
            if (result.success) {
                document.getElementById('loginSuccess').style.display = 'block';
                setTimeout(() => {
                    document.getElementById('loginModal').style.display = 'none';
                    document.getElementById('loginSuccess').style.display = 'none';
                    cart.showNotification(`Welcome back, ${userAccount.getCurrentUser().name}!`);
                }, 1500);
            } else {
                cart.showNotification(result.message);
            }
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            if (password !== confirmPassword) {
                cart.showNotification('Passwords do not match');
                return;
            }
            
            if (password.length < 6) {
                cart.showNotification('Password must be at least 6 characters');
                return;
            }
            
            const result = userAccount.register(name, email, password);
            
            if (result.success) {
                document.getElementById('registerSuccess').style.display = 'block';
                setTimeout(() => {
                    document.getElementById('registerModal').style.display = 'none';
                    document.getElementById('registerSuccess').style.display = 'none';
                    cart.showNotification(`Welcome to ShopEasy, ${name}!`);
                }, 1500);
            } else {
                cart.showNotification(result.message);
            }
        });

        // Checkout form
        document.getElementById('checkoutForm').addEventListener('submit', (e) => {
            e.preventDefault();
            cart.showNotification('Order placed successfully! Thank you for shopping with us.');
            document.getElementById('checkoutModal').style.display = 'none';
            
            // Clear cart after successful checkout
            cart.items = [];
            cart.saveCart();
            cart.updateCartDisplay();
        });

        // Search functionality
        document.querySelector('.search-input').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const allProducts = document.querySelectorAll('.product-card');
            
            allProducts.forEach(card => {
                const productName = card.querySelector('.product-name').textContent.toLowerCase();
                const productCategory = card.querySelector('.product-category').textContent.toLowerCase();
                
                if (productName.includes(searchTerm) || productCategory.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Navigation active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    
                    const targetId = this.getAttribute('href').substring(1);
                    if (targetId === 'deals') {
                        document.querySelector('.deals-section').scrollIntoView({ behavior: 'smooth' });
                    } else if (targetId === 'products') {
                        document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // Carousel functionality
        const carouselSlides = document.querySelector('.carousel-slides');
        const carouselDots = document.querySelectorAll('.carousel-dot');
        let currentSlide = 0;
        const slideCount = document.querySelectorAll('.carousel-slide').length;

        function showSlide(slideIndex) {
            if (slideIndex >= slideCount) slideIndex = 0;
            if (slideIndex < 0) slideIndex = slideCount - 1;
            
            currentSlide = slideIndex;
            carouselSlides.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            carouselDots.forEach(dot => dot.classList.remove('active'));
            carouselDots[currentSlide].classList.add('active');
        }

        carouselDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
            });
        });

        setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);

        // Add CSS for notifications
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // Initialize animations
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                document.querySelectorAll('.fade-in').forEach(el => {
                    el.style.opacity = '1';
                });
            }, 100);
        });

        // Function to format numbers to Nigerian Naira
function formatNaira(amount) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0
    }).format(amount).replace('NGN', '₦');
}

// Updated ProductRenderer to show Naira and Clickable Images
class ProductRenderer {
    constructor() {
        this.renderProducts(products);
    }

    renderProducts(productsToDisplay) {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        grid.innerHTML = '';

        productsToDisplay.forEach(product => {
            const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-badge">-${discount}%</div>
                <div class="product-img-container" onclick="productDetailViewer.showProductDetail(${product.id})">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <p class="brand">${product.brand}</p>
                    <h3 onclick="productDetailViewer.showProductDetail(${product.id})">${product.name}</h3>
                    <div class="stars">
                        ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                        <span>(${product.reviews})</span>
                    </div>
                    <div class="price-container">
                        <span class="current-price">${formatNaira(product.price)}</span>
                        <span class="old-price">${formatNaira(product.originalPrice)}</span>
                    </div>
                    <button class="add-btn" onclick="cart.addItem(${product.id}, '${product.name}', ${product.price}, '${product.image}')">
                        ADD TO CART
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }
}

// Ensure the Page loads the Renderer
document.addEventListener('DOMContentLoaded', () => {
    window.productRenderer = new ProductRenderer();
});