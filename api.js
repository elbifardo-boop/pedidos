/* Comunicación con la base de pedidos y armado de comandas.
   Lo usan index.html y admin.html. Necesita menu.js cargado antes. */

const LOCAL_KEY = "bifa_pedidos_local";

const Api = {
  usaLocal() { return !CONFIG.API_URL; },

  /* Guarda un pedido nuevo. No espera respuesta: así WhatsApp se abre al instante. */
  crear(pedido) {
    if (this.usaLocal()) {
      try {
        const arr = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
        arr.push({ ...pedido, fecha: new Date().toISOString(), estado: "Pendiente", pagado: false, numero: arr.length + 1 });
        localStorage.setItem(LOCAL_KEY, JSON.stringify(arr));
      } catch (e) {}
      return Promise.resolve({ ok: true });
    }
    const body = JSON.stringify({ action: "crear", pedido });
    return fetch(CONFIG.API_URL, {
      method: "POST", mode: "no-cors", keepalive: true,
      headers: { "Content-Type": "text/plain;charset=utf-8" }, body,
    }).catch(() => {
      try { navigator.sendBeacon && navigator.sendBeacon(CONFIG.API_URL, new Blob([body], { type: "text/plain" })); } catch (e) {}
    });
  },

  /* Pedidos con PIN: van por POST para que el PIN no quede en la dirección web. */
  async post(data) {
    const r = await fetch(CONFIG.API_URL, {
      method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data), redirect: "follow",
    });
    return r.json();
  },

  async verificar(pin) {
    if (this.usaLocal()) return { ok: true };
    return this.post({ action: "verificar", pin });
  },

  async menuCompleto(pin) { return this.post({ action: "menuCompleto", pin }); },
  async guardarMenu(pin, data) { return this.post({ action: "guardarMenu", pin, data }); },

  async listar(pin, horas = 36) {
    if (this.usaLocal()) {
      let arr = [];
      try { arr = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch (e) {}
      const lim = Date.now() - horas * 3600e3;
      return { ok: true, pedidos: arr.filter(p => new Date(p.fecha).getTime() >= lim).reverse() };
    }
    return this.post({ action: "listar", pin, horas });
  },

  async actualizar(pin, codigo, campo, valor) {
    if (this.usaLocal()) {
      try {
        const arr = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
        const p = arr.find(x => x.codigo === codigo);
        if (p) p[campo] = valor;
        localStorage.setItem(LOCAL_KEY, JSON.stringify(arr));
      } catch (e) {}
      return { ok: true };
    }
    return this.post({ action: "actualizar", pin, codigo, campo, valor });
  },
};

/* Código corto de pedido, legible para la cajera: ej. "K7Q2" */
function nuevoCodigo() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  const r = (crypto && crypto.getRandomValues) ? crypto.getRandomValues(new Uint8Array(5)) : Array.from({ length: 5 }, () => Math.random() * 256);
  for (let i = 0; i < 5; i++) s += abc[r[i] % abc.length];
  return s;
}

const $fmt = n => "$" + Number(n || 0).toLocaleString("es-AR");

/* Comanda en el mismo formato que pedidosporwhatsapp (para WhatsApp y ticket completo). */
function comandaTexto(p) {
  let m = `Pedido: ${p.nombre || "-"}\nPago: ${p.pago}\nWhatsapp: ${p.whatsapp || "-"}\n`;
  if (p.entrega === "delivery") {
    m += `Delivery a: ${p.direccion || "-"}\n\nEnvio: ${p.zona || "-"}\n\nEntre calles: ${p.entre || "."}\nReferencia del lugar: ${p.referencia || "."}\n`;
  } else {
    m += `Retiro Takeaway\nEntre calles: .\nReferencia del lugar: .\n`;
  }
  m += `-------------------------------\n`;
  let lastCat = null, n = 0;
  (p.items || []).forEach(it => {
    if (it.cat !== lastCat) { m += `\n${it.cat}\n`; lastCat = it.cat; }
    m += `- ${it.n}: ${it.q} x $${it.u} = $ ${it.q * it.u}\n`;
    (it.adds || []).forEach(a => { m += `   + ${a[0]} ($${a[1]})\n`; });
    (it.opts || []).forEach(o => { m += `   * ${o}\n`; });
    n += it.q;
  });
  m += `\n\nART.: ${n}   TOTAL: $${p.subtotal}\n-------------------------------\n\n${p.pago}\n`;
  if (p.pago === "Transferencia Bancaria" || p.pago === "Mercado Pago") m += `(El pago transferilo al alias ${CONFIG.ALIAS})\n`;
  if (p.pago === "Efectivo" && p.abonaCon) m += `Abona con: $${p.abonaCon}\n`;
  if (p.aclaraciones) m += `\nAclaraciones: ${p.aclaraciones}\n`;
  if (p.entrega === "delivery") m += `\nZona de Envio: ${p.zona} $${p.envio}\n`;
  m += `\n\n FINAL A ABONAR: $ ${p.total}`;
  if (p.codigo) m += `\n\nCódigo de pedido: ${p.codigo}`;
  return m;
}

/* ---------- Menú desde la planilla ----------
   Los precios, el stock y las zonas se editan en la planilla (pestañas Menu, Adicionales, Zonas).
   La página usa lo guardado en este navegador si tiene menos de 1 minuto; si no, lo pide a la base.
   Si la base no responde, usa el menú de menu.js como respaldo. */
function aplicarMenu(d) {
  if (!d || !Array.isArray(d.menu) || !d.menu.length) return false;
  MENU.length = 0; d.menu.forEach(c => MENU.push(c));
  if (d.adi && Object.keys(d.adi).length) { Object.keys(ADI).forEach(k => delete ADI[k]); Object.assign(ADI, d.adi); }
  if (Array.isArray(d.zonas) && d.zonas.length) { ZONAS.length = 0; d.zonas.forEach(z => ZONAS.push(z)); }
  return true;
}
async function cargarMenu(opts = {}) {
  if (!CONFIG.API_URL) return false;
  let cache = null;
  try { cache = JSON.parse(localStorage.getItem("bifa_menu") || "null"); } catch (e) {}
  const vigente = cache && cache.d && (Date.now() - cache.t) < 60e3;
  const traer = () => fetch(CONFIG.API_URL + "?action=menu", { cache: "no-store" })
    .then(r => r.json())
    .then(d => {
      if (!d.ok || !Array.isArray(d.menu) || !d.menu.length) throw new Error("menu vacío");
      try { localStorage.setItem("bifa_menu", JSON.stringify({ t: Date.now(), d })); } catch (e) {}
      return d;
    });
  if (vigente && !opts.fresco) { traer().catch(() => {}); return aplicarMenu(cache.d); }
  try {
    const d = await Promise.race([traer(), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 6000))]);
    return aplicarMenu(d);
  } catch (e) {
    return cache && cache.d ? aplicarMenu(cache.d) : false;
  }
}
const escHtml = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Precios por canal ----------
   Cada producto y adicional tiene precio del local (p) y, opcionalmente, de PedidosYa (py) y Rappi (rp).
   Vacío = mismo precio que en el local. */
const CANALES = {
  web: { nombre: "Web" }, mostrador: { nombre: "Mostrador" },
  pedidosya: { nombre: "PedidosYa", campo: "py", adi: 2, pago: "PedidosYa" },
  rappi: { nombre: "Rappi", campo: "rp", adi: 3, pago: "Rappi" },
};
function precioCanal(it, canal) { const c = CANALES[canal]; return (c && c.campo && it[c.campo]) || it.p; }
function precioAdiCanal(a, canal) { const c = CANALES[canal]; return (c && c.adi && a[c.adi]) || a[1]; }
/* Deja MENU y ADI con los precios del canal (para el armador de pedidos de PedidosYa / Rappi). */
function usarPreciosDe(canal) {
  if (!CANALES[canal] || !CANALES[canal].campo) return;
  MENU.forEach(c => c.items.forEach(it => { it.p = precioCanal(it, canal); delete it.old; }));
  Object.values(ADI).forEach(l => l.forEach(a => { a[1] = precioAdiCanal(a, canal); }));
}
