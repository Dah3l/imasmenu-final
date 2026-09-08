/* =====================================================
   CONFIGURACIÓN Y DATOS
===================================================== */
const DEFAULT_CONFIG = {
  business: {
    name: "¡I'MAS!",
    tagline: "Lo que necesitas...",
    social: "@I'MAS",
    address: "Alamar Z12",
    delivery_zone: "Alamar",
    delivery_fee: 200,
    currency: "CUP",
    lead_time_hours: 24,
    order_hours: { open: "07:00", close: "19:00" },
    payment_policy: "50% transferencia + 50% efectivo (si pago es transferencia). Mensajería 100% efectivo.",
    whatsapp: "5351234567"
  },
  admin: { username: "admin", password: "mas2025" },
  productIcons: {
    "Croquetas (10 unid)": "🟤",
    "Croquetas rellenas (5 unid)": "🥟",
    "Medallones (5 unid)": "🥩",
    "Bolitas (10 unid)": "🧀",
    "Yuca rellena (1 unid)": "🥔",
    "Tamales (1 unid)": "🌽",
    "Bananas (2 unid)": "🍌",
    "Salchirollos (8 unid)": "🌭"
  }
};

const DEFAULT_SECTIONS = [
  { id: "ofertas-sin-freir", name: "Ofertas sin freír", description: "Productos crudos/preparados para freír en casa" },
  { id: "especial-preparados", name: "Especial IMAS — Preparados", description: "Listos para comer" }
];

const DEFAULT_PRODUCTS = [
  { id:"croquetas-embutido", name:"Croquetas de embutido", category:"Croquetas (10 unid)", price:250, unit:"10 unidades", type:"sin_freir", sectionId:"ofertas-sin-freir", active:true },
  { id:"croquetas-pollo", name:"Croquetas de pollo", category:"Croquetas (10 unid)", price:300, unit:"10 unidades", type:"sin_freir", sectionId:"ofertas-sin-freir", active:true },
  { id:"croquetas-atun", name:"Croquetas de atún", category:"Croquetas (10 unid)", price:400, unit:"10 unidades", type:"sin_freir", sectionId:"ofertas-sin-freir", active:true },
  { id:"croquetas-rellenas-salchicha", name:"Croquetas rellenas de salchicha", category:"Croquetas rellenas (5 unid)", price:350, unit:"5 unidades", type:"sin_freir", sectionId:"ofertas-sin-freir", active:true },
  { id:"croquetas-rellenas-queso", name:"Croquetas rellenas de queso", category:"Croquetas rellenas (5 unid)", price:350, unit:"5 unidades", type:"sin_freir", sectionId:"ofertas-sin-freir", active:true },
  { id:"croquetas-rellenas-salchicha-queso", name:"Croquetas rellenas de salchicha y queso", category:"Croquetas rellenas (5 unid)", price:400, unit:"5 unidades", type:"sin_freir", sectionId:"ofertas-sin-freir", active:true },
  { id:"croquetas-rellenas-atun", name:"Croquetas rellenas de atún", category:"Croquetas rellenas (5 unid)", price:500, unit:"5 unidades", type:"sin_freir", sectionId:"ofertas-sin-freir", active:true },
  { id:"medallones-queso", name:"Medallones de queso", category:"Medallones (5 unid)", price:300, unit:"5 unidades", type:"sin_freir", sectionId:"ofertas-sin-freir", active:true },
  { id:"medallones-jamon", name:"Medallones de jamón", category:"Medallones (5 unid)", price:350, unit:"5 unidades", type:"sin_freir", sectionId:"ofertas-sin-freir", active:true },
  { id:"medallones-jamon-queso", name:"Medallones de jamón y queso", category:"Medallones (5 unid)", price:400, unit:"5 unidades", type:"sin_freir", sectionId:"ofertas-sin-freir", active:true },
  { id:"bolitas-queso", name:"Bolitas de queso", category:"Bolitas (10 unid)", price:300, unit:"10 unidades", type:"sin_freir", sectionId:"ofertas-sin-freir", active:true },
  { id:"bolitas-jamon", name:"Bolitas de jamón", category:"Bolitas (10 unid)", price:350, unit:"10 unidades", type:"sin_freir", sectionId:"ofertas-sin-freir", active:true },
  { id:"yuca-picadillo", name:"Yuca rellena de picadillo", category:"Yuca rellena (1 unid)", price:70, unit:"1 unidad", type:"sin_freir", sectionId:"ofertas-sin-freir", active:true },
  { id:"yuca-salchicha", name:"Yuca rellena de salchicha en salsa", category:"Yuca rellena (1 unid)", price:80, unit:"1 unidad", type:"sin_freir", sectionId:"ofertas-sin-freir", active:true },
  { id:"tamal-picadillo", name:"Tamal de picadillo", category:"Tamales (1 unid)", price:300, unit:"1 unidad", type:"preparado", sectionId:"especial-preparados", active:true },
  { id:"tamal-pollo", name:"Tamal de pollo", category:"Tamales (1 unid)", price:400, unit:"1 unidad", type:"preparado", sectionId:"especial-preparados", active:true },
  { id:"tamal-lomo", name:"Tamal de lomo ahumado", category:"Tamales (1 unid)", price:500, unit:"1 unidad", type:"preparado", sectionId:"especial-preparados", active:true },
  { id:"banana-picadillo", name:"Banana'MAS (canoa) de picadillo", category:"Bananas (2 unid)", price:400, unit:"2 unidades", type:"preparado", sectionId:"especial-preparados", active:true },
  { id:"banana-picadillo-queso", name:"Banana'MAS (canoa) de picadillo con queso", category:"Bananas (2 unid)", price:500, unit:"2 unidades", type:"preparado", sectionId:"especial-preparados", active:true },
  { id:"salchirollos", name:"Salchirollos", category:"Salchirollos (8 unid)", price:850, unit:"8 unidades", type:"preparado", sectionId:"especial-preparados", active:true }
];

const EMOJI_LIST = ["🟤","🥟","🥩","🧀","🥔","🌽","🍌","🌭","🍗","🥘","🍲","🌶️","🥗","🍤","🦐","🍖","🥓","🍕","🥪","🌮","🥙","🍟","🍱","🥠","🍙","🍚","🍛","🍜","🥣","🍳","🥐","🍞","🧆","🥚","🥞","🧇","🍦","🍰","🎂","🍩","🍪","🍫","🍬","🍭","☕","🍵","🥤","🧃","🍽️"];

/* =====================================================
   INICIALIZAR DATOS EN LOCALSTORAGE
===================================================== */
function loadData(key, defaultValue) {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return JSON.parse(JSON.stringify(defaultValue));
  }
  return JSON.parse(stored);
}

function getConfig() { return loadData("imas_config", DEFAULT_CONFIG); }
function getProducts() { return loadData("imas_products", DEFAULT_PRODUCTS); }
function getSections() { return loadData("imas_sections", DEFAULT_SECTIONS); }

function saveConfig(data) { localStorage.setItem("imas_config", JSON.stringify(data)); }
function saveProducts(data) { localStorage.setItem("imas_products", JSON.stringify(data)); }
function saveSections(data) { localStorage.setItem("imas_sections", JSON.stringify(data)); }