/* =====================================================
   ESTADO DE LA TIENDA
===================================================== */
let state = {
  sectionId: "all",
  categoryId: "all",
  searchQuery: "",
  cart: JSON.parse(localStorage.getItem("imas_cart") || "[]"),
  modalProduct: null,
  modalQty: 1
};
let checkoutInProgress = false;

function saveCart() { localStorage.setItem("imas_cart", JSON.stringify(state.cart)); }

/* =====================================================
   RENDER: FILTROS
===================================================== */
function renderSectionTabs() {
  const sections = getSections();
  const products = getProducts();
  const available = products.filter(p => p.active && (p.stock == null || p.stock > 0));

  const tabs = [
    { id: "all", name: "Todos", count: available.length },
    ...sections.map(s => ({
      id: s.id, name: s.name,
      count: available.filter(p => p.sectionId === s.id).length
    }))
  ];

  $("#sectionTabs").innerHTML = tabs.map(t => `
    <button class="tab ${state.sectionId === t.id ? "active" : ""}" data-section="${t.id}">
      ${t.name} <span style="opacity:0.7; font-weight:400; margin-left:4px;">(${t.count})</span>
    </button>
  `).join("");

  $$("#sectionTabs .tab").forEach(btn => {
    btn.addEventListener("click", () => {
      state.sectionId = btn.dataset.section;
      state.categoryId = "all";
      renderAll();
    });
  });
}

function renderCategoryFilters() {
  const sections = getSections();
  const products = getFilteredProducts();
  let cats = [...new Set(products.map(p => p.category))];

  if (state.sectionId !== "all") {
    cats = [...new Set(products.filter(p => p.sectionId === state.sectionId).map(p => p.category))];
  }

  const chips = [
    `<button class="chip ${state.categoryId === "all" ? "active" : ""}" data-cat="all">Todas las categorías</button>`,
    ...cats.map(c => `
      <button class="chip ${state.categoryId === c ? "active" : ""}" data-cat="${c}">
        ${getIcon(c)} ${c}
      </button>
    `)
  ];

  $("#categoryFilters").innerHTML = chips.join("");
  $$("#categoryFilters .chip").forEach(btn => {
    btn.addEventListener("click", () => {
      state.categoryId = btn.dataset.cat;
      renderAll();
    });
  });
}

/* =====================================================
   RENDER: PRODUCTOS
===================================================== */
function getFilteredProducts() {
  const sections = getSections();
  let list = getProducts().filter(p => p.active && (p.stock == null || p.stock > 0));
  if (state.sectionId !== "all") list = list.filter(p => p.sectionId === state.sectionId);
  if (state.categoryId !== "all") list = list.filter(p => p.category === state.categoryId);
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.unit.toLowerCase().includes(q)
    );
  }
  return list;
}

function renderProducts() {
  const sections = getSections();
  const products = getFilteredProducts();
  const grid = $("#productsGrid");

  if (state.sectionId === "all") {
    $("#sectionTitle").textContent = "Nuestros productos";
    $("#sectionDescription").textContent = "Explora todo nuestro catálogo";
  } else {
    const section = sections.find(s => s.id === state.sectionId);
    $("#sectionTitle").textContent = section ? section.name : "";
    $("#sectionDescription").textContent = section ? section.description : "";
  }
  $("#resultCount").textContent = `${products.length} producto${products.length !== 1 ? "s" : ""}`;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <h4>No encontramos productos</h4>
        <p>Prueba con otra búsqueda o categoría.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => {
    const inCart = state.cart.find(c => c.id === p.id);
    const stock = p.stock != null ? p.stock : 999;
    const lowStock = stock > 0 && stock <= 5;
    const outOfStock = stock <= 0;
    return `
      <article class="product-card ${outOfStock ? "out-of-stock" : ""}" data-id="${p.id}">
        <div class="product-image">
          <span class="product-type type-${p.type}">${p.type === "sin_freir" ? "Sin freír" : "Preparado"}</span>
          <span class="product-emoji">${getIcon(p.category, p.id)}</span>
          ${outOfStock ? '<span class="sold-out-badge">Agotado</span>' : lowStock ? '<span class="low-stock-badge">Quedan ' + stock + '</span>' : ''}
        </div>
        <div class="product-info">
          <div class="product-category">${p.category}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-unit">${p.unit}</div>
          <div class="product-footer">
            <div class="product-price">${fmt(p.price, getConfig().business.currency)} <span>/ ${p.unit}</span></div>
            ${outOfStock ? `<span class="no-stock-label">Sin stock</span>` : `
            <button class="add-btn" data-id="${p.id}" aria-label="Agregar ${p.name}">
              ${inCart ? `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              ` : `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14M12 5v14"/>
                </svg>
              `}
            </button>
            `}
          </div>
        </div>
      </article>
    `;
  }).join("");

  $$(".product-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".add-btn")) return;
      openProductModal(card.dataset.id);
    });
  });
  $$(".add-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(btn.dataset.id, 1);
    });
  });
}

/* =====================================================
   CARRITO
===================================================== */
function addToCart(id, qty = 1) {
  const products = getProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;
  const maxStock = product.stock != null ? product.stock : 999;
  if (maxStock <= 0) { showToast(`"${product.name}" agotado`, "⚠️"); return; }
  const existing = state.cart.find(c => c.id === id);
  const currentQty = existing ? existing.qty : 0;
  const newQty = currentQty + qty;
  if (newQty > maxStock) {
    showToast(`Solo hay ${maxStock} disponible${maxStock === 1 ? "" : "s"} de "${product.name}"`, "⚠️");
    return;
  }
  if (existing) existing.qty += qty;
  else state.cart.push({ id: product.id, name: product.name, category: product.category, unit: product.unit, price: product.price, qty });
  saveCart();
  updateCartCount();
  renderCart();
  renderProducts();
  bumpCart();
  showToast(`${product.name} agregado`, "🛒");
}

function updateCartQty(id, delta) {
  const item = state.cart.find(c => c.id === id);
  if (!item) return;
  if (delta > 0) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    const maxStock = product && product.stock != null ? product.stock : 999;
    if (item.qty + delta > maxStock) {
      showToast(`Solo hay ${maxStock} disponible${maxStock === 1 ? "" : "s"} de "${item.name}"`, "⚠️");
      return;
    }
  }
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(c => c.id !== id);
  saveCart();
  updateCartCount();
  renderCart();
  renderProducts();
}

function clearCart() {
  if (!confirm("¿Vaciar todo el carrito?")) return;
  state.cart = [];
  saveCart();
  updateCartCount();
  renderCart();
  renderProducts();
}

function getCartTotals() {
  const config = getConfig();
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = state.cart.length > 0 ? config.business.delivery_fee : 0;
  return { subtotal, delivery, total: subtotal + delivery };
}

function updateCartCount() {
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  const el = $("#cartCount");
  el.textContent = count;
  el.classList.toggle("hidden", count === 0);
}

function bumpCart() {
  const el = $("#cartCount");
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
}

function renderCart() {
  const body = $("#cartBody");
  const footer = $("#cartFooter");
  const config = getConfig();

  if (state.cart.length === 0) {
    body.innerHTML = `
      <div class="empty-cart">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
        <h4>Tu carrito está vacío</h4>
        <p>Agrega productos deliciosos de ¡I'MAS!</p>
      </div>`;
    footer.style.display = "none";
    return;
  }

  const currency = config.business.currency;
  const stockIssues = getCartStockIssues();
  body.innerHTML = state.cart.map(item => {
    const products = getProducts();
    const prod = products.find(p => p.id === item.id);
    const icon = prod ? getIcon(prod.category, prod.id) : "🍽️";
    const available = prod && prod.stock != null ? prod.stock : null;
    const itemIssue = stockIssues.find(issue => issue.id === item.id);
    return `
    <div class="cart-item">
      <div class="cart-item-image">${icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-unit">${item.unit} · ${fmt(item.price, currency)} c/u</div>
        ${itemIssue ? `<div class="cart-stock-warning">${itemIssue.message}</div>` : available != null ? `<div class="cart-stock-available">${available} disponible${available === 1 ? "" : "s"}</div>` : ""}
        <div class="cart-item-bottom">
          <div class="cart-qty">
            <button onclick="updateCartQty('${item.id}', -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="updateCartQty('${item.id}', 1)">+</button>
          </div>
          <div class="cart-item-price">${fmt(item.price * item.qty, currency)}</div>
        </div>
      </div>
    </div>`;
  }).join("");

  const { subtotal, delivery, total } = getCartTotals();
  $("#cartSubtotal").textContent = fmt(subtotal, currency);
  $("#cartDelivery").textContent = fmt(delivery, currency);
  $("#cartTotal").textContent = fmt(total, currency);
  $("#cartStockNotice").innerHTML = stockIssues.length
    ? "Actualiza las cantidades marcadas antes de continuar."
    : "Stock reservado al confirmar el pedido."
  $("#cartStockNotice").classList.toggle("warning", stockIssues.length > 0);
  $("#checkoutBtn").disabled = stockIssues.length > 0;
  footer.style.display = "block";
}

function getCartStockIssues() {
  const products = getProducts();
  return state.cart.reduce((issues, item) => {
    const product = products.find(p => p.id === item.id);
    if (!product) {
      issues.push({ id: item.id, message: "Producto no disponible" });
    } else if (!product.active || (product.stock != null && product.stock <= 0)) {
      issues.push({ id: item.id, message: "Agotado: quítalo del carrito" });
    } else if (product.stock != null && item.qty > product.stock) {
      issues.push({ id: item.id, message: `Solo quedan ${product.stock}; ajusta la cantidad` });
    }
    return issues;
  }, []);
}

/* =====================================================
   MODAL DE PRODUCTO
===================================================== */
function openProductModal(id) {
  const products = getProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;
  state.modalProduct = product;
  state.modalQty = 1;

  const stock = product.stock != null ? product.stock : 999;
  const inCart = state.cart.find(item => item.id === id);
  const availableStock = Math.max(0, stock - (inCart ? inCart.qty : 0));
  $("#modalEmoji").textContent = getIcon(product.category, product.id);
  $("#modalCategory").textContent = product.category;
  $("#modalName").textContent = product.name;
  $("#modalUnit").textContent = product.unit;
  $("#modalStock").textContent = availableStock > 0
    ? `${availableStock} disponible${availableStock === 1 ? "" : "s"} para agregar`
    : "No hay más unidades disponibles";
  $("#modalStock").classList.remove("hidden");

  const desc = product.type === "sin_freir"
    ? "Producto crudo preparado artesanalmente. Fríelo en casa para disfrutarlo recién hecho, con el punto perfecto. Congelación recomendada si no se consume el mismo día."
    : "Listo para comer. Preparado al momento con ingredientes frescos. Calienta y disfruta en casa.";
  $("#modalDescription").textContent = desc;
  updateModalTotal();
  $("#productModal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  $("#productModal").classList.remove("open");
  document.body.style.overflow = "";
  state.modalProduct = null;
  $("#addToCartBtn").disabled = false;
}

function updateModalTotal() {
  if (!state.modalProduct) return;
  const config = getConfig();
  const total = state.modalProduct.price * state.modalQty;
  const inCart = state.cart.find(item => item.id === state.modalProduct.id);
  const maxStock = state.modalProduct.stock != null ? Math.max(0, state.modalProduct.stock - (inCart ? inCart.qty : 0)) : 999;
  $("#qtyValue").textContent = state.modalQty;
  $("#modalTotal").textContent = fmt(total, config.business.currency);
  $("#qtyMinus").disabled = state.modalQty <= 1;
  $("#qtyPlus").disabled = state.modalQty >= maxStock;
  $("#addToCartBtn").disabled = maxStock <= 0;
}

/* =====================================================
   CHECKOUT
===================================================== */
function openCheckoutModal() {
  if (state.cart.length === 0) return;
  const stockIssues = getCartStockIssues();
  if (stockIssues.length) {
    renderCart();
    showToast("Actualiza el stock de tu carrito antes de continuar", "⚠️");
    return;
  }
  const config = getConfig();
  const currency = config.business.currency;
  const minDate = new Date();
  minDate.setHours(minDate.getHours() + config.business.lead_time_hours);
  $("#checkDate").min = minDate.toISOString().split("T")[0];
  if (!$("#checkDate").value) $("#checkDate").value = minDate.toISOString().split("T")[0];

  const { subtotal, delivery, total } = getCartTotals();
  $("#checkoutSummary").innerHTML = `
    <strong style="font-family:'Playfair Display',serif; display:block; margin-bottom:8px; color:var(--brown-900);">Resumen</strong>
    ${state.cart.map(i => `
      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
        <span>${i.qty}× ${i.name}</span>
        <strong>${fmt(i.price * i.qty, currency)}</strong>
      </div>
    `).join("")}
    <div style="border-top:1px dashed rgba(74,44,26,0.2); margin-top:8px; padding-top:8px; display:flex; justify-content:space-between;">
      <span>Mensajería</span><span>${fmt(delivery, currency)}</span>
    </div>
    <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:16px; font-weight:700; color:var(--terracotta-dark);">
      <span>Total</span>
      <strong style="font-family:'Playfair Display',serif;">${fmt(total, currency)}</strong>
    </div>`;

  closeCartDrawer();
  $("#checkoutModal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCheckoutModal() {
  $("#checkoutModal").classList.remove("open");
  document.body.style.overflow = "";
}

function validateCheckout() {
  let valid = true;
  const fields = [
    { id: "checkName", min: 2 },
    { id: "checkPhone", min: 6 },
    { id: "checkAddress", min: 5 }
  ];
  fields.forEach(f => {
    const el = $("#" + f.id);
    const group = el.closest(".form-group");
    group.classList.toggle("error", el.value.trim().length < f.min);
    if (el.value.trim().length < f.min) valid = false;
  });
  const payment = document.querySelector('input[name="payment"]:checked');
  const paymentGroup = $("#paymentOptions").closest(".form-group");
  paymentGroup.classList.toggle("error", !payment);
  if (!payment) valid = false;
  return valid;
}

function reserveCartStock() {
  if (getCartStockIssues().length) return false;
  const products = getProducts();
  const updatedProducts = products.map(product => {
    const item = state.cart.find(cartItem => cartItem.id === product.id);
    if (!item || product.stock == null) return product;

    const newStock = product.stock - item.qty;
    if (newStock < 0) return null;
    return { ...product, stock: newStock };
  });

  if (updatedProducts.some(product => product === null)) return false;
  saveProducts(updatedProducts);
  return true;
}

function sendWhatsApp() {
  if (checkoutInProgress) return;
  if (!validateCheckout()) {
    showToast("Completa los campos obligatorios", "⚠️");
    return;
  }

  const config = getConfig();
  const currency = config.business.currency;
  const name = $("#checkName").value.trim();
  const phone = $("#checkPhone").value.trim();
  const address = $("#checkAddress").value.trim();
  const date = $("#checkDate").value;
  const notes = $("#checkNotes").value.trim();
  const payment = document.querySelector('input[name="payment"]:checked').value;

  const paymentLabels = {
    transferencia: "100% Transferencia (50% ahora + 50% al entregar)",
    mixto: "50% Transferencia + 50% Efectivo al recibir",
    efectivo: "100% Efectivo al recibir (mensajería)"
  };

  const { subtotal, delivery, total } = getCartTotals();
  const dateStr = date ? new Date(date + "T12:00:00").toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long" }) : "A convenir";

  let msg = `¡Hola ${config.business.name}! 🛒\n*Nuevo pedido*\n\n`;
  msg += `👤 *Cliente:* ${name}\n📞 *Teléfono:* ${phone}\n📍 *Dirección:* ${address}\n📅 *Entrega deseada:* ${dateStr}\n\n*Productos:*\n`;
  state.cart.forEach(item => {
    msg += `• ${item.qty}× ${item.name} (${item.unit}) — ${fmt(item.price * item.qty, currency)}\n`;
  });
  msg += `\n*Subtotal:* ${fmt(subtotal, currency)}\n*Mensajería:* ${fmt(delivery, currency)}\n*TOTAL:* *${fmt(total, currency)} ${currency}*\n\n`;
  msg += `💳 *Método de pago:* ${paymentLabels[payment]}\n`;
  if (notes) msg += `📝 *Notas:* ${notes}\n`;
  msg += `\n_¡Gracias por elegir ${config.business.name}!_`;

  if (!reserveCartStock()) {
    showToast("Algunos productos ya no tienen stock suficiente", "⚠️");
    renderCart();
    renderAll();
    return;
  }

  checkoutInProgress = true;
  $("#sendWhatsApp").disabled = true;
  const url = `https://wa.me/${config.business.whatsapp}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");

  setTimeout(() => {
    closeCheckoutModal();
    state.cart = [];
    saveCart();
    updateCartCount();
    renderCart();
    renderProducts();
    checkoutInProgress = false;
    showToast("¡Pedido enviado por WhatsApp!", "✅");
  }, 800);
}

/* =====================================================
   DRAWER
===================================================== */
function openCartDrawer() {
  renderCart();
  $("#cartDrawer").classList.add("open");
  $("#drawerBackdrop").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCartDrawer() {
  $("#cartDrawer").classList.remove("open");
  $("#drawerBackdrop").classList.remove("open");
  document.body.style.overflow = "";
}

/* =====================================================
   RENDER ORQUESTADOR
===================================================== */
function renderAll() {
  renderSectionTabs();
  renderCategoryFilters();
  renderProducts();
}

/* =====================================================
   EVENTOS
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  $("#searchInput").addEventListener("input", debounce((e) => {
    state.searchQuery = e.target.value;
    $("#searchClear").classList.toggle("visible", e.target.value.length > 0);
    renderProducts();
  }, 150));

  $("#searchClear").addEventListener("click", () => {
    $("#searchInput").value = "";
    state.searchQuery = "";
    $("#searchClear").classList.remove("visible");
    renderProducts();
  });

  $("#cartBtn").addEventListener("click", openCartDrawer);
  $("#drawerClose").addEventListener("click", closeCartDrawer);
  $("#drawerBackdrop").addEventListener("click", closeCartDrawer);
  $("#clearCart").addEventListener("click", clearCart);
  $("#checkoutBtn").addEventListener("click", openCheckoutModal);

  $("#productModal").addEventListener("click", closeProductModal);
  $("#qtyMinus").addEventListener("click", () => {
    if (state.modalQty > 1) { state.modalQty--; updateModalTotal(); }
  });
  $("#qtyPlus").addEventListener("click", () => {
    const inCart = state.modalProduct && state.cart.find(item => item.id === state.modalProduct.id);
    const maxStock = state.modalProduct && state.modalProduct.stock != null
      ? Math.max(0, state.modalProduct.stock - (inCart ? inCart.qty : 0))
      : 999;
    if (state.modalQty < maxStock) { state.modalQty++; updateModalTotal(); }
  });
  $("#addToCartBtn").addEventListener("click", () => {
    if (state.modalProduct) { addToCart(state.modalProduct.id, state.modalQty); closeProductModal(); }
  });

  $("#checkoutModal").addEventListener("click", (e) => {
    if (e.target.id === "checkoutModal") closeCheckoutModal();
  });
  $("#sendWhatsApp").addEventListener("click", sendWhatsApp);
  $$('#paymentOptions input[type="radio"]').forEach(r => {
    r.addEventListener("change", () => {
      $$(".payment-option").forEach(o => o.classList.remove("selected"));
      r.closest(".payment-option").classList.add("selected");
    });
  });

  window.addEventListener("scroll", () => {
    $("#header").classList.toggle("scrolled", window.scrollY > 10);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if ($("#checkoutModal").classList.contains("open")) closeCheckoutModal();
      else if ($("#productModal").classList.contains("open")) closeProductModal();
      else if ($("#cartDrawer").classList.contains("open")) closeCartDrawer();
    }
  });

  updateCartCount();
  renderAll();
  renderCart();

  window.addEventListener("storage", (event) => {
    if (event.key !== "imas_products") return;
    renderAll();
    renderCart();
  });
});