/* =====================================================
   ADMIN: LOGIN / LOGOUT
===================================================== */
function checkAuth() {
  const authed = sessionStorage.getItem("imas_admin_session") === "true";
  $("#loginScreen").style.display = authed ? "none" : "grid";
  $("#adminApp").style.display = authed ? "flex" : "none";
  if (authed) renderAdminPanel();
}

function doLogin() {
  const config = getConfig();
  const u = $("#loginUser").value.trim();
  const p = $("#loginPass").value;
  const ug = $("#loginUser").closest(".form-group");
  const pg = $("#loginPass").closest(".form-group");
  ug.classList.remove("error");
  pg.classList.remove("error");

  if (u !== config.admin.username) { ug.classList.add("error"); return; }
  if (p !== config.admin.password) { pg.classList.add("error"); return; }

  sessionStorage.setItem("imas_admin_session", "true");
  showToast("Sesión iniciada correctamente", "🔓");
  checkAuth();
}

function doLogout() {
  sessionStorage.removeItem("imas_admin_session");
  showToast("Sesión cerrada", "👋");
  checkAuth();
}

/* =====================================================
   ADMIN: PANEL
===================================================== */
function renderAdminPanel() {
  renderAdminProducts();
  renderSectionsList();
  const config = getConfig();
  $("#bizName").value = config.business.name;
  $("#bizWhatsApp").value = config.business.whatsapp;
  $("#bizZone").value = config.business.delivery_zone;
  $("#bizDelivery").value = config.business.delivery_fee;
  $("#bizAddress").value = config.business.address;
  $("#adminUser").value = config.admin.username;
  $("#adminPass").value = "";
}

function switchAdminTab(tab) {
  $$(".admin-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
  ["products", "sections", "settings"].forEach(id => {
    const el = $("#tab-" + id);
    if (el) el.style.display = id === tab ? "block" : "none";
  });
}

/* =====================================================
   ADMIN: PRODUCTOS
===================================================== */
function renderAdminProducts() {
  const products = getProducts();
  const sections = getSections();
  const config = getConfig();
  const q = $("#adminSearch") ? $("#adminSearch").value.toLowerCase().trim() : "";

  let list = products;
  if (q) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.unit.toLowerCase().includes(q)
    );
  }

  $("#productsCount").textContent =
    `${products.length} productos en total · ${products.filter(p => p.active).length} activos`;

  if (list.length === 0) {
    $("#adminProducts").innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <h4>Sin resultados</h4>
        <p>${q ? "Intenta otra búsqueda." : "Aún no hay productos. Crea el primero."}</p>
      </div>`;
    return;
  }

  $("#adminProducts").innerHTML = list.map(p => {
    const section = sections.find(s => s.id === p.sectionId);
    return `
      <div class="admin-product ${p.active ? "" : "inactive"}">
        <div class="admin-product-header">
          <div class="admin-product-icon">${getIcon(p.category, p.id)}</div>
          <div class="admin-product-title">
            <h4>${p.name}</h4>
            <div class="cat">${p.category}</div>
          </div>
          <span class="status-badge ${p.active ? "status-active" : "status-inactive"}">
            ${p.active ? "Activo" : "Inactivo"}
          </span>
        </div>
        <div class="admin-product-meta">
          <div class="item"><span class="label">Precio</span><span class="value">${fmt(p.price, config.business.currency)}</span></div>
          <div class="item"><span class="label">Stock disponible</span><span class="value ${p.stock <= 0 ? "stock-zero" : p.stock <= 5 ? "stock-low" : ""}">${p.stock != null ? p.stock : "—"}</span></div>
          <div class="item"><span class="label">Sección</span><span class="value">${section ? section.name : "-"}</span></div>
          <div class="item"><span class="label">Tipo</span><span class="value">${p.type === "sin_freir" ? "Sin freír" : "Preparado"}</span></div>
        </div>
        <div class="admin-product-actions">
          <button class="admin-btn-action edit" onclick="openEditModal('${p.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            </svg>
            Editar
          </button>
          <button class="admin-btn-action toggle" onclick="toggleProduct('${p.id}')">
            ${p.active ? "Desactivar" : "Activar"}
          </button>
          <button class="admin-btn-action delete" onclick="deleteProduct('${p.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function toggleProduct(id) {
  const products = getProducts();
  const p = products.find(x => x.id === id);
  if (!p) return;
  p.active = !p.active;
  saveProducts(products);
  renderAdminProducts();
  showToast(p.active ? `"${p.name}" activado` : `"${p.name}" desactivado`, p.active ? "✓" : "⏸");
}

function deleteProduct(id) {
  const products = getProducts();
  const p = products.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`¿Eliminar "${p.name}"?\n\nEsta acción no se puede deshacer.`)) return;
  const updated = products.filter(x => x.id !== id);
  saveProducts(updated);
  renderAdminProducts();
  showToast(`"${p.name}" eliminado`, "🗑");
}

/* =====================================================
   ADMIN: SECTIONS
===================================================== */
function renderSectionsList() {
  const sections = getSections();
  const products = getProducts();

  $("#sectionsList").innerHTML = sections.map(s => {
    const count = products.filter(p => p.sectionId === s.id && p.active).length;
    return `
      <div class="section-item">
        <div class="section-info">
          <h4>${s.name}</h4>
          <p>${s.description || "Sin descripción"}</p>
        </div>
        <span class="section-count">${count} productos</span>
      </div>
    `;
  }).join("");
}

/* =====================================================
   ADMIN: EDIT PRODUCT MODAL
===================================================== */
let editingId = null;
let selectedEmoji = "🍽️";

function openEditModal(id = null) {
  const products = getProducts();
  const sections = getSections();
  editingId = id;

  $("#editSection").innerHTML = sections.map(s =>
    `<option value="${s.id}">${s.name}</option>`
  ).join("");

  const cats = [...new Set(products.map(p => p.category))];
  $("#categoryList").innerHTML = cats.map(c => `<option value="${c}">`).join("");

  $("#emojiPicker").innerHTML = EMOJI_LIST.map(e =>
    `<button type="button" class="emoji-option" data-emoji="${e}">${e}</button>`
  ).join("");

  $$("#emojiPicker .emoji-option").forEach(btn => {
    btn.addEventListener("click", () => selectEmoji(btn.dataset.emoji));
  });

  if (id) {
    const p = products.find(x => x.id === id);
    $("#editTitle").textContent = "Editar producto";
    $("#editId").value = p.id;
    $("#editName").value = p.name;
    $("#editSection").value = p.sectionId;
    $("#editType").value = p.type;
    $("#editCategory").value = p.category;
    $("#editUnit").value = p.unit;
$("#editPrice").value = p.price;
      $("#editStock").value = p.stock != null ? p.stock : 0;
      selectEmoji(p.icon || getIcon(p.category, p.id));
    } else {
      $("#editTitle").textContent = "Nuevo producto";
      $("#editId").value = "";
      $("#editName").value = "";
      $("#editSection").value = sections[0].id;
      $("#editType").value = "sin_freir";
      $("#editCategory").value = "";
      $("#editUnit").value = "";
      $("#editPrice").value = "";
      $("#editStock").value = "0";
      selectEmoji("🍽️");
  }

  ["editName","editCategory","editUnit","editPrice"].forEach(fid => {
    const el = $("#" + fid);
    if (el) el.closest(".form-group").classList.remove("error");
  });

  $("#editModal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function selectEmoji(emoji) {
  selectedEmoji = emoji;
  $$("#emojiPicker .emoji-option").forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.emoji === emoji);
  });
}

function closeEditModal() {
  $("#editModal").classList.remove("open");
  document.body.style.overflow = "";
  editingId = null;
}

function saveEditProduct() {
  const products = getProducts();
  const id = $("#editId").value;
  const name = $("#editName").value.trim();
  const sectionId = $("#editSection").value;
  const type = $("#editType").value;
  const category = $("#editCategory").value.trim();
  const unit = $("#editUnit").value.trim();
  const price = parseInt($("#editPrice").value, 10);
  const stockVal = parseInt($("#editStock").value, 10);
  const stock = isNaN(stockVal) || stockVal < 0 ? 0 : stockVal;
  const icon = selectedEmoji || "🍽️";

  let valid = true;
  const setErr = (fid, cond) => {
    $("#" + fid).closest(".form-group").classList.toggle("error", !cond);
    if (!cond) valid = false;
  };
  setErr("editName", name.length >= 1);
  setErr("editCategory", category.length >= 1);
  setErr("editUnit", unit.length >= 1);
  setErr("editPrice", price > 0);
  if (!valid) { showToast("Revisa los campos marcados", "⚠️"); return; }

  if (id) {
    const p = products.find(x => x.id === id);
    if (p) {
      p.name = name; p.sectionId = sectionId; p.type = type;
      p.category = category; p.unit = unit; p.price = price; p.icon = icon;
      p.stock = stock;
      if (stock <= 0) p.active = false;
    }
    showToast(`"${name}" actualizado`, "✓");
  } else {
    const newId = uid();
    products.push({
      id: newId, name, sectionId, type, category, unit, price, icon,
      active: stock > 0, stock
    });
    showToast(`"${name}" creado`, "✨");
  }

  saveProducts(products);
  closeEditModal();
  renderAdminProducts();
  renderSectionsList();
}

/* =====================================================
   ADMIN: SETTINGS
===================================================== */
function saveBusiness() {
  const config = getConfig();
  config.business.name = $("#bizName").value.trim() || config.business.name;
  config.business.whatsapp = $("#bizWhatsApp").value.trim() || config.business.whatsapp;
  config.business.delivery_zone = $("#bizZone").value.trim();
  config.business.delivery_fee = parseInt($("#bizDelivery").value, 10) || config.business.delivery_fee;
  config.business.address = $("#bizAddress").value.trim();
  saveConfig(config);
  showToast("Datos del negocio guardados", "✓");
}

function saveSecurity() {
  const config = getConfig();
  const u = $("#adminUser").value.trim();
  const p = $("#adminPass").value;
  if (u) config.admin.username = u;
  if (p) config.admin.password = p;
  saveConfig(config);
  showToast("Credenciales actualizadas", "✓");
}

function resetCatalog() {
  if (!confirm("¿Restablecer el catálogo?\n\nSe borrarán todos los productos agregados/editados y se volverá al catálogo original.")) return;
  localStorage.removeItem("imas_products");
  localStorage.removeItem("imas_sections");
  showToast("Catálogo restablecido. Recargando...", "♻");
  setTimeout(() => location.reload(), 1200);
}

function exportData() {
  const data = {
    config: getConfig(),
    products: getProducts(),
    sections: getSections(),
    exported_at: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `imas-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Catálogo exportado", "💾");
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  $("#loginBtn").addEventListener("click", doLogin);
  $("#loginPass").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doLogin();
  });
  $("#editModal").addEventListener("click", (e) => {
    if (e.target.id === "editModal") closeEditModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $("#editModal").classList.contains("open")) closeEditModal();
  });
  checkAuth();

  window.addEventListener("storage", (event) => {
    if (event.key !== "imas_products") return;
    if (sessionStorage.getItem("imas_admin_session") !== "true") return;
    renderAdminProducts();
    renderSectionsList();
  });
});