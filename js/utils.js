/* =====================================================
   UTILIDADES
===================================================== */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function fmt(n, currency = "CUP") {
  return (n || 0).toLocaleString("es-ES") + " " + currency;
}

function showToast(message, icon = "✓") {
  const t = $("#toast");
  if (!t) return;
  t.innerHTML = `<span style="font-size:16px;">${icon}</span> ${message}`;
  t.classList.add("show");
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => t.classList.remove("show"), 2500);
}

function uid() { return "p_" + Math.random().toString(36).substr(2, 9); }

function getIcon(category, productId) {
  const products = getProducts();
  const config = getConfig();
  const p = products.find(x => x.id === productId);
  if (p && p.icon) return p.icon;
  return config.productIcons[category] || "🍽️";
}

function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}