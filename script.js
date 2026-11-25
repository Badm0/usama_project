/* =========================================
   UG Women's Fashion Store — Interactive JS
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const formatIQD = (amount) => `${amount.toLocaleString('en-US')} IQD`;

    /* --- Sticky Header Shadow --- */
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 12);
    });

    /* --- Mobile Menu Toggle --- */
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');

    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('open');
    });

    nav.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => nav.classList.remove('open'));
    });

    /* --- Toast Notification --- */
    const toast = document.getElementById('toast');
    let toastTimer;

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
    }

    /* --- Collection Filter --- */
    const filterButtons = document.querySelectorAll('.collection-card');
    const productCards = document.querySelectorAll('.product-card');

    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            let visibleCount = 0;

            productCards.forEach((card) => {
                const categories = card.dataset.category.split(' ');
                const match = filter === 'all' || categories.includes(filter);
                card.classList.toggle('hidden', !match);
                if (match) visibleCount++;
            });

            if (visibleCount > 0) {
                document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* --- Size Pill Selection --- */
    document.querySelectorAll('.product-sizes').forEach((group) => {
        const pills = group.querySelectorAll('.size-pill');
        pills.forEach((pill) => {
            pill.addEventListener('click', () => {
                pills.forEach((p) => p.classList.remove('active'));
                pill.classList.add('active');
            });
        });
    });

    /* --- Shopping Bag (Cart) State --- */
    let cart = JSON.parse(localStorage.getItem('ug_fashion_cart') || '[]');

    const cartBtn = document.getElementById('cartBtn');
    const cartDrawer = document.getElementById('cartDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const closeCart = document.getElementById('closeCart');
    const cartItemsEl = document.getElementById('cartItems');
    const cartCountEl = document.getElementById('cartCount');
    const cartTotalEl = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    function saveCart() {
        localStorage.setItem('ug_fashion_cart', JSON.stringify(cart));
        renderCart();
    }

    function openCart() {
        cartDrawer.classList.add('open');
        drawerBackdrop.classList.add('open');
        cartDrawer.setAttribute('aria-hidden', 'false');
    }

    function closeCartDrawer() {
        cartDrawer.classList.remove('open');
        drawerBackdrop.classList.remove('open');
        cartDrawer.setAttribute('aria-hidden', 'true');
    }

    cartBtn.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartDrawer);
    drawerBackdrop.addEventListener('click', closeCartDrawer);

    function addToCart(item) {
        const existing = cart.find((c) => c.id === item.id && c.size === item.size);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...item, qty: 1 });
        }
        saveCart();
        showToast(`Added "${item.name}" (${item.size}) to your bag`);
    }

    function renderCart() {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

        cartCountEl.textContent = totalItems;
        cartTotalEl.textContent = formatIQD(totalPrice);

        if (cart.length === 0) {
            cartItemsEl.innerHTML = `
                <div class="empty-cart">
                    <p>Your shopping bag is currently empty.</p>
                    <p style="margin-top:8px;font-size:0.85rem;">Explore our collection and add your favorite pieces!</p>
                </div>
            `;
            return;
        }

        cartItemsEl.innerHTML = cart
            .map(
                (item, index) => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div>
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-meta">Size: ${item.size} &middot; ${formatIQD(item.price)}</div>
                        <div class="cart-item-controls">
                            <div class="qty-box">
                                <button data-action="dec" data-index="${index}">−</button>
                                <span>${item.qty}</span>
                                <button data-action="inc" data-index="${index}">+</button>
                            </div>
                            <button class="remove-item" data-action="remove" data-index="${index}">Remove</button>
                        </div>
                    </div>
                </div>
            `
            )
            .join('');
    }

    cartItemsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const index = Number(btn.dataset.index);
        const action = btn.dataset.action;

        if (action === 'inc') cart[index].qty += 1;
        if (action === 'dec') {
            if (cart[index].qty > 1) cart[index].qty -= 1;
            else cart.splice(index, 1);
        }
        if (action === 'remove') cart.splice(index, 1);
        saveCart();
    });

    // Product Card "Add to Bag" buttons
    productCards.forEach((card) => {
        const addBtn = card.querySelector('.add-to-cart-btn');
        addBtn.addEventListener('click', () => {
            const activeSize = card.querySelector('.size-pill.active')?.dataset.size || 'Medium';
            addToCart({
                id: card.dataset.id,
                name: card.dataset.name,
                price: Number(card.dataset.price),
                image: card.dataset.image,
                size: activeSize,
            });
        });
    });

    // Special Offer CTA button
    document.getElementById('claimOfferBtn').addEventListener('click', () => {
        addToCart({
            id: '1',
            name: 'Elegant Dress',
            price: 45000,
            image: 'images/dress.jpg',
            size: 'Medium',
        });
        openCart();
    });

    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Your bag is empty!');
            return;
        }
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        cart = [];
        saveCart();
        closeCartDrawer();
        showToast(`Order received! Total: ${formatIQD(total)} — Baghdad delivery confirmed.`);
    });

    renderCart();

    /* --- Quick View Modal --- */
    const modal = document.getElementById('quickViewModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const closeModalBtn = document.getElementById('closeModal');
    const quickViewBody = document.getElementById('quickViewBody');

    function closeQuickView() {
        modal.classList.remove('open');
        modalBackdrop.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('.btn-quick-view').forEach((btn) => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.product-card');
            const name = card.dataset.name;
            const price = Number(card.dataset.price);
            const image = card.dataset.image;
            const desc = card.dataset.desc;
            const id = card.dataset.id;
            const defaultSize = card.querySelector('.size-pill.active')?.dataset.size || 'Medium';

            quickViewBody.innerHTML = `
                <div class="modal-grid">
                    <img src="${image}" alt="${name}">
                    <div class="modal-details">
                        <span class="eyebrow">UG Women's Fashion</span>
                        <h3>${name}</h3>
                        <p style="color:var(--text-muted);font-size:0.94rem;">${desc}</p>
                        <strong style="font-size:1.3rem;">${formatIQD(price)}</strong>
                        <p style="font-size:0.85rem;color:var(--text-muted);">Selected Size: <strong>${defaultSize}</strong></p>
                        <button class="btn btn-primary" id="modalAddBtn">Add to Bag</button>
                    </div>
                </div>
            `;

            document.getElementById('modalAddBtn').addEventListener('click', () => {
                addToCart({ id, name, price, image, size: defaultSize });
                closeQuickView();
            });

            modal.classList.add('open');
            modalBackdrop.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
        });
    });

    closeModalBtn.addEventListener('click', closeQuickView);
    modalBackdrop.addEventListener('click', closeQuickView);

    /* --- Special Offer Countdown Timer --- */
    const targetTime = Date.now() + (2 * 24 * 60 * 60 + 14 * 60 * 60 + 36 * 60) * 1000;
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');

    function updateCountdown() {
        const diff = Math.max(0, targetTime - Date.now());
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);

        daysEl.textContent = String(d).padStart(2, '0');
        hoursEl.textContent = String(h).padStart(2, '0');
        minsEl.textContent = String(m).padStart(2, '0');
        secsEl.textContent = String(s).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    /* --- Contact Form --- */
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        showToast(`Thank you, ${name}! We'll reply to your message shortly.`);
        contactForm.reset();
    });

    /* --- Scroll Reveal Animation --- */
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    revealEls.forEach((el) => observer.observe(el));
});
