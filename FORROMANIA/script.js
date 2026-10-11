// ========================================
// DATOS DE PRODUCTOS
// ========================================

const products = [
    {
        id: 'helmet',
        name: 'Casco integral',
        type: 'Protección · Road series',
        short: 'Seguridad y confort para cada kilómetro.',
        description: 'Diseñado para acompañarte en ciudad y carretera. Su interior acolchado y visor amplio ofrecen comodidad y una visión clara en cada recorrido.',
        price: 389000,
        label: 'MÁS VENDIDO',
        art: 'helmet'
    },
    {
        id: 'gloves',
        name: 'Guantes para motociclistas',
        type: 'Protección · Street series',
        short: 'Agarre firme. Manos siempre protegidas.',
        description: 'Palma reforzada y ajuste cómodo para una mayor sensación de control. Una pieza esencial para tus trayectos diarios y escapadas.',
        price: 89000,
        label: 'ESENCIAL',
        art: 'gloves'
    },
    {
        id: 'phone',
        name: 'Soporte celular',
        type: 'Accesorios · Utility series',
        short: 'Tu ruta a la vista, tus manos al manillar.',
        description: 'Soporte de montaje ajustable con sujeción firme para mantener tu teléfono visible durante el recorrido. Compatible con la mayoría de motocicletas.',
        price: 65000,
        label: 'NUEVO',
        art: 'phone'
    },
    {
        id: 'tank',
        name: 'Protector de tanque',
        type: 'Accesorios · Care series',
        short: 'Protege el tanque y dale carácter.',
        description: 'Protector resistente que ayuda a evitar rayones y desgaste. Su textura antideslizante suma estilo y funcionalidad a tu motocicleta.',
        price: 42000,
        label: '',
        art: 'tank'
    },
    {
        id: 'intercom',
        name: 'Intercomunicador',
        type: 'Tecnología · Connect series',
        short: 'Conecta con tu ruta y con los tuyos.',
        description: 'Comunicación manos libres para rodar acompañado. Su diseño compacto se integra fácilmente al casco para que te concentres en disfrutar el camino.',
        price: 249000,
        label: 'CONECTIVIDAD',
        art: 'intercom'
    },
    {
        id: 'trunk',
        name: 'Maletero moto',
        type: 'Equipaje · Touring series',
        short: 'Más espacio para llegar más lejos.',
        description: 'Maletero rígido y práctico para llevar tus esenciales en cada salida. Silueta compacta que combina con tu moto y mantiene tus cosas resguardadas.',
        price: 319000,
        label: 'RUTA LARGA',
        art: 'trunk'
    }
];

// ========================================
// ESTADO DE LA APLICACIÓN
// ========================================

let cart = loadCart();
let view = 'home';
let selectedProduct = null;
let detailQty = 1;
let lastOrder = null;
let toastTimer;

// ========================================
// UTILIDADES
// ========================================

function formatMoney(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(amount);
}

function showToast(message) {
    const toast = document.getElementById('toast');

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2300);
}

// ========================================
// CARRITO
// ========================================

function loadCart() {
    try {
        const savedCart = JSON.parse(
            window.localStorage.getItem('forromania-cart')
        );

        if (!savedCart || typeof savedCart !== 'object' || Array.isArray(savedCart)) {
            return {};
        }

        return Object.fromEntries(
            Object.entries(savedCart)
                .filter(([productId, quantity]) => (
                    products.some(product => product.id === productId) &&
                    Number.isFinite(Number(quantity)) &&
                    Number(quantity) > 0
                ))
                .map(([productId, quantity]) => [productId, Math.floor(Number(quantity))])
        );
    } catch {
        return {};
    }
}

function saveCart() {
    // La persistencia es opcional para que el carrito funcione con index.html local.
    try {
        window.localStorage.setItem('forromania-cart', JSON.stringify(cart));
    } catch {
        // El estado en memoria sigue disponible si el navegador restringe localStorage.
    }

    updateCount();
}

function countItems() {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
}

function updateCount() {
    const cartCount = document.getElementById('cart-count');
    const cartButton = document.querySelector('.cart-nav');
    const quantity = countItems();

    if (cartCount) {
        cartCount.textContent = quantity;
    }

    if (cartButton) {
        cartButton.setAttribute(
            'aria-label',
            `Carrito, ${quantity} ${quantity === 1 ? 'producto' : 'productos'}`
        );
    }
}

function addToCart(productId, quantity = 1) {
    const product = products.find(item => item.id === productId);

    if (!product) {
        return;
    }

    const validQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
    cart[productId] = (cart[productId] || 0) + validQuantity;

    saveCart();
    showToast(
        `${product.name} agregado al carrito. Cantidad: ${cart[productId]}. ` +
        `Subtotal y total: ${formatMoney(calculateTotal())}.`
    );
}

function removeFromCart(productId) {
    const product = products.find(item => item.id === productId);

    delete cart[productId];

    saveCart();
    render();

    const focusTarget = (
        document.querySelector('.summary [data-view="checkout"]') ||
        document.querySelector('.empty-state [data-view="catalog"]')
    );

    focusTarget?.focus({ preventScroll: true });

    if (product) {
        showToast(
            `${product.name} eliminado. Subtotal y total: ` +
            `${formatMoney(calculateTotal())}.`
        );
    }
}

function changeCartQuantity(productId, amount) {
    const product = products.find(item => item.id === productId);

    if (!product) {
        return;
    }

    const nextQuantity = Math.max(0, (cart[productId] || 0) + amount);

    if (nextQuantity === 0) {
        delete cart[productId];
    } else {
        cart[productId] = nextQuantity;
    }

    saveCart();
    render();

    const quantityButton = document.querySelector(
        `[data-cart-qty="${amount}"][data-id="${productId}"]`
    );
    const focusTarget = (
        quantityButton ||
        document.querySelector('.summary [data-view="checkout"]') ||
        document.querySelector('.empty-state [data-view="catalog"]')
    );

    focusTarget?.focus({ preventScroll: true });

    const quantityMessage = nextQuantity === 0
        ? `${product.name} eliminado al reducir la cantidad a cero.`
        : `Cantidad de ${product.name}: ${nextQuantity}.`;

    showToast(
        `${quantityMessage} Subtotal y total: ${formatMoney(calculateTotal())}.`
    );
}

function calculateTotal() {
    return products.reduce((sum, product) => (
        sum + product.price * (cart[product.id] || 0)
    ), 0);
}

// ========================================
// ILUSTRACIONES
// ========================================

function illustration(product, className = '') {
    return `
        <img
            class="${className}"
            src="assets/${product.art}.webp"
            alt="Ilustración de ${product.name}"
        >
    `;
}

// ========================================
// COMPONENTES
// ========================================

function productCard(product) {
    return `
        <article class="product-card">
            <div
                class="product-image"
                data-detail="${product.id}"
                role="button"
                tabindex="0"
                aria-label="Ver producto: ${product.name}"
            >
                ${product.label ? `
                    <span class="product-label">${product.label}</span>
                ` : ''}
                ${illustration(product)}
            </div>
            <div class="product-info">
                <div class="product-type">${product.type}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.short}</p>
                <div class="product-bottom">
                    <span class="price">${formatMoney(product.price)}</span>
                    <div class="product-actions">
                        <button class="tiny-btn" data-detail="${product.id}">
                            Ver producto
                        </button>
                        <button class="tiny-btn add" data-add="${product.id}">
                            + Añadir
                        </button>
                    </div>
                </div>
            </div>
        </article>
    `;
}

function summaryLine(label, value, isTotal = false) {
    return `
        <div class="summary-line${isTotal ? ' total' : ''}">
            <span>${label}</span>
            <span>${value}</span>
        </div>
    `;
}

// ========================================
// VISTAS
// ========================================

function homeView() {
    const featuredProducts = products.slice(0, 3);

    return `
        <div class="view">
            <section class="hero">
                <div class="hero-copy">
                    <div class="eyebrow">Accesorios para cada ruta</div>
                    <h1 tabindex="-1">El camino<br>es <em>tuyo.</em></h1>
                    <p>
                        Encuentra ese equipo que te acompaña kilómetro a kilómetro.
                        Lo esencial para salir a rodar, hecho para tu manera de vivir la moto.
                    </p>
                    <button class="button" data-view="catalog">
                        Ver catálogo <span class="button-arrow">↗</span>
                    </button>
                    <div class="hero-meta">
                        <strong>01</strong>
                        <span>ELIGE TU<br>PRÓXIMO DESTINO</span>
                        <i></i>
                        <strong>02</strong>
                        <span>EQUÍPATE<br>A TU MANERA</span>
                    </div>
                </div>
                <div class="hero-art">
                    <div class="rays"></div>
                    <div class="sun"></div>
                    ${illustration(products[0], 'hero-helmet')}
                    <div class="hero-stamp">F/01 <span>— ROAD ESSENTIALS</span></div>
                    <div class="hero-tag">LISTO PARA RODAR</div>
                </div>
            </section>
            <section class="section">
                <div class="section-head">
                    <div>
                        <div class="section-kicker">SELECCIÓN FORROMANIA</div>
                        <h2>Favoritos de ruta</h2>
                    </div>
                    <button class="text-link" data-view="catalog">
                        EXPLORAR TODO EL CATÁLOGO ↗
                    </button>
                </div>
                <div class="product-grid">
                    ${featuredProducts.map(productCard).join('')}
                </div>
            </section>
        </div>
    `;
}

function catalogView() {
    return `
        <div class="view catalog-top">
            <div class="catalog-title-row">
                <div>
                    <div class="eyebrow">Todo lo que necesitas para salir</div>
                    <h1 tabindex="-1">El catálogo</h1>
                    <p>
                        Encuentra tu próximo compañero de ruta.
                        <span
                            id="product-count"
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                        >${products.length} productos</span>
                    </p>
                </div>
                <input
                    class="search"
                    id="search"
                    type="search"
                    placeholder="⌕  Buscar accesorios..."
                    aria-label="Buscar productos"
                >
            </div>
            <div class="product-grid catalog-grid" id="catalog-grid">
                ${products.map(productCard).join('')}
            </div>
        </div>
    `;
}

function detailView() {
    const product = products.find(item => item.id === selectedProduct) || products[0];

    return `
        <div class="view page-wrap">
            <div class="breadcrumb">
                <button data-view="home">Inicio</button>
                <span>/</span>
                <button data-view="catalog">Catálogo</button>
                <span>/</span>
                <span>${product.name}</span>
            </div>
            <div class="detail-layout">
                <div class="detail-image">
                    ${illustration(product)}
                </div>
                <div class="detail-copy">
                    <div class="product-type">${product.type}</div>
                    <h1 tabindex="-1">${product.name}</h1>
                    <div class="detail-price">${formatMoney(product.price)}</div>
                    <p>${product.description}</p>
                    <ul class="feature-list">
                        <li>Selección FORROMANIA para cada recorrido</li>
                        <li>Diseño práctico y fácil de usar</li>
                        <li>Listo para acompañar tu próxima salida</li>
                    </ul>
                    <div class="buy-row">
                        <div class="quantity">
                            <button
                                type="button"
                                data-qty="-1"
                                aria-label="Disminuir cantidad de ${product.name}"
                            >−</button>
                            <span id="detail-qty" aria-live="polite" aria-atomic="true">
                                ${detailQty}
                            </span>
                            <button
                                type="button"
                                data-qty="1"
                                aria-label="Aumentar cantidad de ${product.name}"
                            >+</button>
                        </div>
                        <button class="button" data-add-detail="${product.id}">
                            Agregar al carrito <span class="button-arrow">↗</span>
                        </button>
                    </div>
                    <p>
                        <button class="text-link" data-view="catalog">
                            ← Volver al catálogo
                        </button>
                    </p>
                </div>
            </div>
        </div>
    `;
}

function cartItem(product) {
    return `
        <div class="cart-row">
            <div class="cart-thumb">
                ${illustration(product)}
            </div>
            <div>
                <div class="cart-product-type">${product.type}</div>
                <div class="cart-product-title">${product.name}</div>
                <div class="cart-controls">
                    <div class="quantity">
                        <button
                            type="button"
                            data-cart-qty="-1"
                            data-id="${product.id}"
                            aria-label="Disminuir cantidad de ${product.name}"
                        >−</button>
                        <span>${cart[product.id]}</span>
                        <button
                            type="button"
                            data-cart-qty="1"
                            data-id="${product.id}"
                            aria-label="Aumentar cantidad de ${product.name}"
                        >+</button>
                    </div>
                    <button class="remove-btn" data-remove="${product.id}">
                        Eliminar
                    </button>
                </div>
            </div>
            <div class="cart-line-price">
                ${formatMoney(product.price * cart[product.id])}
            </div>
        </div>
    `;
}

function cartSummary() {
    const total = calculateTotal();

    return `
        <aside class="summary">
            <h2>Resumen del pedido</h2>
            ${summaryLine('Subtotal', formatMoney(total))}
            ${summaryLine('Envío', 'A coordinar')}
            ${summaryLine('Total', formatMoney(total), true)}
            <button class="button" data-view="checkout">
                Continuar pedido <span class="button-arrow">→</span>
            </button>
            <p class="summary-note">
                El costo de envío se coordina al confirmar tu pedido.
            </p>
        </aside>
    `;
}

function cartView() {
    const cartProducts = products.filter(product => cart[product.id]);

    return `
        <div class="view page-wrap">
            <div class="eyebrow">Tu selección</div>
            <h1 class="page-title" tabindex="-1">
                Tu carrito <span class="cart-count-title">(${countItems()})</span>
            </h1>
            ${cartProducts.length ? `
                <div class="cart-layout">
                    <div>${cartProducts.map(cartItem).join('')}</div>
                    ${cartSummary()}
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-icon">▱</div>
                    <h2>Tu próxima ruta empieza aquí</h2>
                    <p>
                        Aún no tienes productos en el carrito. Explora el catálogo
                        y encuentra lo que necesitas.
                    </p>
                    <button class="button" data-view="catalog">
                        Ir al catálogo <span class="button-arrow">↗</span>
                    </button>
                </div>
            `}
        </div>
    `;
}

function checkoutItem(product) {
    return `
        <div class="checkout-item">
            <span>${product.name} × ${cart[product.id]}</span>
            <span>${formatMoney(product.price * cart[product.id])}</span>
        </div>
    `;
}

function checkoutView() {
    const cartProducts = products.filter(product => cart[product.id]);
    const total = calculateTotal();

    return `
        <div class="view page-wrap">
            <div class="eyebrow">Ya casi está</div>
            <h1 class="page-title" tabindex="-1">Completa tu pedido</h1>
            <div class="checkout-layout">
                <form class="form-panel" id="order-form">
                    <h2>Datos para contactarte</h2>
                    <div class="form-grid">
                        <div class="field">
                            <label for="name">Nombre del cliente *</label>
                            <input
                                id="name"
                                name="name"
                                required
                                autocomplete="name"
                                placeholder="Tu nombre completo"
                            >
                        </div>
                        <div class="field">
                            <label for="phone">Teléfono *</label>
                            <input
                                id="phone"
                                name="phone"
                                required
                                type="tel"
                                autocomplete="tel"
                                placeholder="300 000 0000"
                            >
                        </div>
                        <div class="field full">
                            <label for="address">Dirección de entrega *</label>
                            <input
                                id="address"
                                name="address"
                                required
                                autocomplete="street-address"
                                placeholder="Calle, número, barrio, ciudad"
                            >
                        </div>
                        <div class="field full">
                            <label for="notes">Observaciones</label>
                            <textarea
                                id="notes"
                                name="notes"
                                placeholder="Cuéntanos algún detalle para tu pedido (opcional)"
                            ></textarea>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button class="button" type="submit">
                            Confirmar pedido <span class="button-arrow">↗</span>
                        </button>
                    </div>
                </form>
                <aside class="summary">
                    <h2>Resumen del pedido</h2>
                    <div class="checkout-items">
                        ${cartProducts.map(checkoutItem).join('')}
                    </div>
                    ${summaryLine('Subtotal', formatMoney(total))}
                    ${summaryLine('Envío', 'A coordinar')}
                    ${summaryLine('Total', formatMoney(total), true)}
                    <p class="summary-note">
                        Este es un pedido de demostración. No se realizará ningún cobro.
                    </p>
                </aside>
            </div>
        </div>
    `;
}

function successView() {
    const orderNumber = lastOrder?.number || 'FR-00000';

    return `
        <div class="view">
            <section class="success">
                <div class="success-mark">✓</div>
                <div class="eyebrow">Pedido registrado</div>
                <h1 tabindex="-1">¡Listo para rodar!</h1>
                <p>
                    Tu pedido quedó registrado correctamente. En este prototipo,
                    FORROMANIA se pondría en contacto contigo para coordinar los detalles.
                </p>
                <div class="order-number">PEDIDO #${orderNumber}</div>
                <button class="button" data-view="home">
                    Volver al inicio <span class="button-arrow">↗</span>
                </button>
            </section>
        </div>
    `;
}

function render() {
    const app = document.getElementById('app');
    const viewTemplates = {
        home: homeView,
        catalog: catalogView,
        detail: detailView,
        cart: cartView,
        checkout: checkoutView,
        success: successView
    };

    app.innerHTML = viewTemplates[view]();
    updateCount();
    bindViewEvents();
}

// ========================================
// NAVEGACIÓN
// ========================================

function showView(viewName) {
    view = viewName;
    render();

    const viewHeading = document.querySelector('#app h1');
    viewHeading?.focus({ preventScroll: true });

    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });

    updateNavigation(viewName);
}

function updateNavigation(viewName) {
    document.querySelectorAll('.nav-link').forEach(navLink => {
        const isActive = (
            (viewName === 'home' && navLink.dataset.view === 'home') ||
            (viewName === 'catalog' && navLink.dataset.view === 'catalog')
        );

        navLink.classList.toggle('active', isActive);
    });
}

// ========================================
// EVENTOS
// ========================================

function bindNavigationEvents() {
    document.querySelectorAll('#app [data-view]').forEach(button => {
        button.addEventListener('click', () => {
            const viewName = button.dataset.view;

            if (viewName === 'checkout' && countItems() === 0) {
                showView('cart');
                return;
            }

            showView(viewName);
        });
    });
}

function bindHeaderNavigationEvents() {
    document.querySelectorAll('.site-header [data-view]').forEach(button => {
        button.addEventListener('click', () => {
            showView(button.dataset.view);
        });
    });
}

function bindBrandEvents() {
    document.querySelectorAll('.brand, .footer-brand').forEach(brandLink => {
        brandLink.addEventListener('click', event => {
            event.preventDefault();
            showView('home');
        });
    });
}

function bindProductEvents() {
    document.querySelectorAll('[data-detail]').forEach(productTarget => {
        const openProduct = () => {
            selectedProduct = productTarget.dataset.detail;
            detailQty = 1;
            showView('detail');
        };

        productTarget.addEventListener('click', openProduct);

        if (productTarget.getAttribute('role') === 'button') {
            productTarget.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openProduct();
                }
            });
        }
    });

    document.querySelectorAll('[data-add]').forEach(button => {
        button.addEventListener('click', () => {
            addToCart(button.dataset.add);
        });
    });

    document.querySelectorAll('[data-add-detail]').forEach(button => {
        button.addEventListener('click', () => {
            addToCart(button.dataset.addDetail, detailQty);
            showView('cart');
        });
    });

    document.querySelectorAll('[data-qty]').forEach(button => {
        button.addEventListener('click', () => {
            const amount = Number(button.dataset.qty);
            detailQty = Math.max(1, Math.min(99, detailQty + amount));
            document.getElementById('detail-qty').textContent = detailQty;
        });
    });
}

function bindCartEvents() {
    document.querySelectorAll('[data-cart-qty]').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.id;
            const amount = Number(button.dataset.cartQty);

            changeCartQuantity(productId, amount);
        });
    });

    document.querySelectorAll('[data-remove]').forEach(button => {
        button.addEventListener('click', () => {
            removeFromCart(button.dataset.remove);
        });
    });
}

function bindSearchEvents() {
    const searchInput = document.getElementById('search');

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener('input', () => {
        const searchQuery = searchInput.value.trim().toLocaleLowerCase('es');
        const filteredProducts = products.filter(product => {
            const searchableText = `${product.name} ${product.type} ${product.short}`;
            return searchableText.toLocaleLowerCase('es').includes(searchQuery);
        });
        const catalogGrid = document.getElementById('catalog-grid');
        const productCount = document.getElementById('product-count');

        catalogGrid.innerHTML = filteredProducts.length
            ? filteredProducts.map(productCard).join('')
            : '<div class="no-results">No encontramos productos para tu búsqueda.</div>';
        productCount.textContent = filteredProducts.length === 1
            ? '1 producto'
            : `${filteredProducts.length} productos`;

        bindProductEvents();
    });
}

function submitOrder(form) {
    if (!form.reportValidity()) {
        return;
    }

    if (countItems() === 0) {
        showView('cart');
        return;
    }

    lastOrder = {
        number: `FR-${Math.floor(10000 + Math.random() * 90000)}`,
        name: form.elements.namedItem('name').value,
        phone: form.elements.namedItem('phone').value,
        address: form.elements.namedItem('address').value,
        notes: form.elements.namedItem('notes').value,
        total: calculateTotal()
    };

    cart = {};
    saveCart();
    showView('success');
}

function bindCheckoutEvents() {
    const orderForm = document.getElementById('order-form');

    if (!orderForm) {
        return;
    }

    orderForm.addEventListener('submit', event => {
        event.preventDefault();
        submitOrder(orderForm);
    });
}

function bindViewEvents() {
    bindNavigationEvents();
    bindProductEvents();
    bindCartEvents();
    bindSearchEvents();
    bindCheckoutEvents();
}

// ========================================
// INICIALIZACIÓN
// ========================================

bindHeaderNavigationEvents();
bindBrandEvents();
render();
