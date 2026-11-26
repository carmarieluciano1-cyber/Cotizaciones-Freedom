/* =====================================================================
   Freedom Energy Group — Sometimientos a la distribuidora (Edenorte)
   Llena los documentos con la información del cliente y del proyecto.
   Cada documento se puede ver, corregir e imprimir por separado.
   Aunque falten datos, se puede imprimir (quedan las líneas en blanco).
   ===================================================================== */
(function () {
  "use strict";
  const BASE = "propuesta/";
  // Carpeta de las imágenes: propuesta/som/ (y lib/ adentro). Si en GitHub quedaron sueltas en la raíz, se usan de ahí.
  let SB = BASE + "som/", L = SB + "lib/";
  let rutaLista = null;
  const existe = (src) => new Promise(r => { const i = new Image(); i.onload = () => r(true); i.onerror = () => r(false); i.src = src + "?r=" + Date.now(); });
  function buscarRuta() {
    if (!rutaLista) rutaLista = (async () => {
      if (await existe(SB + "firma.png")) { if (!(await existe(L + "cne-187.jpg")) && await existe(SB + "cne-187.jpg")) L = SB; return; }
      if (await existe("firma.png")) { SB = ""; L = (await existe("lib/cne-187.jpg")) ? "lib/" : ""; return; }
      if (await existe("som/firma.png")) { SB = "som/"; L = (await existe("som/lib/cne-187.jpg")) ? "som/lib/" : "som/"; }
    })();
    return rutaLista;
  }
  const KEY = "feg_sometimientos_v1";
  const SIZES = { letter: [612, 792], a4: [595.3, 841.9], letterl: [792, 612], a4l: [841.9, 595.3] };
  const FREEDOM = { nombre: "FREEDOM ENERGY GROUP ALUES SRL", rnc: "133-59391-2", tel: "809-734-1605" };
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const PROVINCIAS = ["Azua", "Bahoruco", "Barahona", "Dajabón", "Distrito Nacional", "Duarte", "El Seibo", "Elías Piña", "Espaillat", "Hato Mayor", "Hermanas Mirabal", "Independencia", "La Altagracia", "La Romana", "La Vega", "María Trinidad Sánchez", "Monseñor Nouel", "Monte Cristi", "Monte Plata", "Pedernales", "Peravia", "Puerto Plata", "Samaná", "San Cristóbal", "San José de Ocoa", "San Juan", "San Pedro de Macorís", "Sánchez Ramírez", "Santiago", "Santiago Rodríguez", "Santo Domingo", "Valverde"];
  const TIPOS_CLIENTE = [["residencial", "Residencial"], ["comercial", "Comercial"], ["industrial", "Industrial"], ["agricola", "Agrícola"], ["educativa", "Institución educativa"], ["medica", "Facilidad médico-hospitalaria"]];

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const arch = () => window.FEGPropuesta && window.FEGPropuesta._arch;
  const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const fechaDe = (iso) => { const [y, m, d] = String(iso || hoyISO()).split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const fechaLarga = (iso) => { const d = fechaDe(iso); const t = `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; return t[0].toUpperCase() + t.slice(1); };
  const fechaCorta = (iso) => { const d = fechaDe(iso); return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; };
  const n1 = (v) => { const x = Math.round((Number(v) || 0) * 10) / 10; return Number.isInteger(x) ? String(x) : x.toFixed(1); };
  const nt = (v) => { const x = Math.round((Number(v) || 0) * 100) / 100; return x.toLocaleString("en-US", { maximumFractionDigits: 2 }); };

  let lista = [];
  let actual = null;
  let docActivo = null;
  let tGuardar = null;

  // ---------------------------------------------------------------------
  // Datos
  // ---------------------------------------------------------------------
  function nuevo() {
    return {
      id: "s" + Date.now(), creado: new Date().toISOString(), actualizado: new Date().toISOString(),
      programa: "cero", tipoCliente: "residencial", persona: "fisica",
      cliente: { nombre: "", cedula: "", telefono: "", celular: "", email: "", calle: "", sector: "", municipio: "", provincia: "" },
      sum: { contrato: "", medidor: "", tarifa: "", direccion: "" },
      eq: { paneles: { qty: 0, marca: "JINKO Solar", w: 650, modelo: "" }, inversores: [], baterias: [] },
      fecha: hoyISO(), descripcion: "", compensa: "todo", compensaPct: "", instalado: false,
      archivos: { cedula: [], factura: [], planos: [], fotos: [], empresa: [], otros: [] },
      edits: {}, incluir: {}
    };
  }
  function normalizar(s) {
    const b = nuevo();
    s = Object.assign(b, s || {});
    s.cliente = Object.assign(nuevo().cliente, s.cliente || {});
    s.sum = Object.assign(nuevo().sum, s.sum || {});
    s.eq = Object.assign(nuevo().eq, s.eq || {});
    s.archivos = Object.assign(nuevo().archivos, s.archivos || {});
    return s;
  }
  function leerLocal() { try { return (JSON.parse(localStorage.getItem(KEY) || "[]") || []).map(normalizar); } catch (e) { return []; } }
  function escribirLocal() { try { localStorage.setItem(KEY, JSON.stringify(lista)); } catch (e) { showToast("No se pudo guardar en este navegador", "error"); } }
  const nubeOk = () => typeof cloudOn === "function" && cloudOn();
  async function subirNube(s) {
    if (!nubeOk()) return;
    try {
      await cloudFetch("ajustes", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify([{ id: "som_" + s.id, data: s, updated_at: s.actualizado }]) });
    } catch (e) { }
  }
  async function borrarNube(id) {
    if (!nubeOk()) return;
    try { await cloudFetch("ajustes?id=eq." + encodeURIComponent("som_" + id), { method: "DELETE", headers: { Prefer: "return=minimal" } }); } catch (e) { }
  }
  async function sincronizar() {
    lista = leerLocal();
    if (!nubeOk()) return;
    try {
      const rows = await cloudFetch("ajustes?id=like.som_*&select=id,data");
      const map = new Map(lista.map(s => [s.id, s]));
      (rows || []).forEach(r => {
        const s = normalizar(r.data);
        const l = map.get(s.id);
        if (!l || (s.actualizado || "") > (l.actualizado || "")) map.set(s.id, s);
      });
      lista = [...map.values()];
      escribirLocal();
    } catch (e) { }
  }
  function guardar(inmediato) {
    if (!actual || !puedeEditar()) return;
    actual.actualizado = new Date().toISOString();
    const i = lista.findIndex(s => s.id === actual.id);
    if (i >= 0) lista[i] = actual; else lista.unshift(actual);
    escribirLocal();
    clearTimeout(tGuardar);
    const s = actual;
    tGuardar = setTimeout(() => subirNube(s), inmediato ? 0 : 1200);
  }

  // Biblioteca fija: certificados de la CNE, cartas de distribuidores y garantías de fábrica
  const BIBLIO_FIJA = [
    { id: "f-cne-187", tipo: "cne", nombre: "CNE-DE-CMN-187-2025 (Solis, ION, JA Solar)", registro: "CNE-DE-CMN-187-2025", src: ["cne-187.jpg"],
      claves: "S6-EH3P30K-H-LV, S5-GC20K-LV, S6-EH2P16K03-SV-YD-L-US, ION-LV-8K-US, ION-LV-12K-US, JAM66D46-710/LB, JAM66D45-620/LB, JAM54D40-450/LB, JAM66D45-615/LB, SOLIS, ION, JA SOLAR" },
    { id: "f-cne-176", tipo: "cne", nombre: "CNE-GE-CMN-176-2026 (ION, JA Solar, LONGi, YC Solar)", registro: "CNE-GE-CMN-176-2026", src: ["cne-176.jpg"],
      claves: "ION-LV-US-8K PRO, ION-LV-US-12K PRO, ION-LV-US-16K, JAM66D45-630/LB, LR8-66HGD-635M, JAM66D45-640/LB, JAM54D41-460/LB, JAM66D46-730/LB, YC620NDF66G12R/2, ION, JA SOLAR, LONGI, YC SOLAR" },
    { id: "f-cne-170", tipo: "cne", nombre: "CNE-GE-CMN-170-2026 (JINKO Tiger Neo)", registro: "CNE-GE-CMN-170-2026", src: ["cne-170.jpg"],
      claves: "JKM635N-78HL4-BDV, JKM640N-66QL6-BDV, JKM645N-66QL6-BDV, JKM650N-66QL6-BDV, JINKO" },
    { id: "f-carta-170", tipo: "distribuidor", nombre: "Sistemi di Energie Rinnovabili — uso del CNE-GE-CMN-170-2026", src: ["carta-170.jpg"],
      claves: "JKM635N-78HL4-BDV, JKM640N-66QL6-BDV, JKM645N-66QL6-BDV, JKM650N-66QL6-BDV, JINKO" },
    { id: "f-carta-176", tipo: "distribuidor", nombre: "Santana German Supply — uso del CNE 176-2026 y 099-2026", src: ["carta-176-099.jpg"],
      claves: "ION-LV-US-8K PRO, ION-LV-US-12K PRO, ION-LV-US-16K, JAM66D45-630/LB, LR8-66HGD-635M, JAM66D45-640/LB, JAM54D41-460/LB, JAM66D46-730/LB, YC620NDF66G12R/2, ION, JA SOLAR, LONGI, YC SOLAR" },
    { id: "f-carta-047", tipo: "distribuidor", nombre: "Santana German Supply — uso del CNE 047-2026, 009-2025 y 153-2025", src: ["carta-047-009-153.jpg"], claves: "" },
    { id: "f-gar-jinko", tipo: "garantiaFab", nombre: "Garantía limitada JINKO (módulos bifaciales)", src: [1, 2, 3, 4, 5, 6, 7, 8].map(n => "gar-jinko-" + n + ".jpg"), claves: "JINKO, JKM" },
    { id: "f-gar-solis", tipo: "garantiaFab", nombre: "Garantía limitada Solis (5 años)", src: [1, 2, 3, 4, 5].map(n => "gar-solis-" + n + ".jpg"), claves: "SOLIS" }
  ];
  const norm = (x) => String(x || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  // Las palabras de un documento fijo se pueden cambiar; se guardan aparte
  function bibliotecaCompleta() {
    const cambios = biblio().biblioClaves || {};
    const fijos = BIBLIO_FIJA.filter(x => !(biblio().biblioOcultos || []).includes(x.id)).map(x => Object.assign({}, x, { fijo: true }, cambios[x.id] !== undefined ? { claves: cambios[x.id] } : {}));
    return fijos.concat(biblio().certificados);
  }
  function itemsEquipo(s) {
    const e = resumenEquipos(s);
    const it = [];
    if (e.p.qty > 0) it.push({ marca: e.p.marca, modelo: e.p.modelo, nombre: "panel", tipo: "panel" });
    e.invs.forEach(x => it.push({ marca: marcaDe(x.inv.name), modelo: x.r.modelo, nombre: "inversor " + x.inv.name, tipo: "inversor", id: x.inv.id }));
    e.bats.forEach(x => it.push({ marca: marcaDe(x.bat.name), modelo: x.r.modelo || (x.bat.propio ? x.bat.name : ""), nombre: "batería " + x.bat.name, tipo: "bateria" }));
    return it;
  }
  // ¿Este documento corresponde a este equipo? Con modelo escrito se busca el modelo; sin modelo, la marca.
  // Las garantías de fábrica van siempre por marca.
  function corresponde(doc, item) {
    const ks = String(doc.claves || "").split(/[,;\n]+/).map(norm).filter(k => k.length >= 2);
    const m = norm(item.modelo), b = norm(item.marca);
    const porMarca = (k) => b && (b.includes(k) || (k.length >= 4 && k.includes(b)));
    if (doc.tipo === "garantiaFab") return ks.some(k => porMarca(k) || (m && k.length >= 3 && m.includes(k)));
    if (m) return ks.some(k => k.length >= 5 && (m.includes(k) || k.includes(m)));
    return ks.some(porMarca);
  }
  const docsPara = (tipo, s) => { const it = itemsEquipo(s); return bibliotecaCompleta().filter(d => d.tipo === tipo && it.some(i => corresponde(d, i))); };
  // Las baterías no necesitan certificado de la CNE ni garantía en el expediente
  const sinDoc = (tipo, s) => itemsEquipo(s).filter(i => (tipo === "ficha" || i.tipo !== "bateria") && !bibliotecaCompleta().some(d => d.tipo === tipo && corresponde(d, i)));
  const registroDe = (item) => { const d = bibliotecaCompleta().find(d => d.tipo === "cne" && d.registro && item.modelo && corresponde(d, item)); return d ? d.registro : "CNE"; };

  // Biblioteca de Freedom (sirve para todos los sometimientos). Se guarda aparte ("biblioteca"),
  // así el equipo de sometimientos la puede cambiar sin tocar los precios.
  const BIB_KEY = "feg_som_biblio";
  let BIB = null;
  function biblio() {
    if (!BIB) {
      try { BIB = JSON.parse(localStorage.getItem(BIB_KEY) || "null"); } catch (e) { BIB = null; }
      if (!BIB) {
        BIB = {};
        ["certificados", "codia", "biblioClaves", "biblioOcultos"].forEach(k => { if (typeof settings !== "undefined" && settings[k] !== undefined) BIB[k] = JSON.parse(JSON.stringify(settings[k])); });
      }
    }
    if (!Array.isArray(BIB.certificados)) BIB.certificados = [];
    return BIB;
  }
  function guardarBiblio() {
    const b = biblio();
    b.actualizado = new Date().toISOString();
    try { localStorage.setItem(BIB_KEY, JSON.stringify(b)); } catch (e) { }
    if (nubeOk() && puedeEditar()) cloudFetch("ajustes", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{ id: "biblioteca", data: b, updated_at: b.actualizado }]) }).catch(() => { });
  }
  async function sincronizarBiblio() {
    if (!nubeOk()) return;
    try {
      const rows = await cloudFetch("ajustes?id=eq.biblioteca&select=data");
      const r = rows && rows[0] && rows[0].data, l = biblio();
      if (r && (r.actualizado || "") > (l.actualizado || "")) { BIB = r; if (!Array.isArray(BIB.certificados)) BIB.certificados = []; try { localStorage.setItem(BIB_KEY, JSON.stringify(BIB)); } catch (e) { } }
      else if (puedeEditar() && (!r || (l.actualizado || "") > (r.actualizado || "")) && (l.certificados.length || l.codia || l.biblioClaves || l.biblioOcultos)) guardarBiblio();
    } catch (e) { }
  }
  // Permisos del usuario que entró (si no hay usuarios, se puede todo)
  const puedeEditar = () => !window.FEG_PUEDE || window.FEG_PUEDE.editarSometimientos();

  // ---------------------------------------------------------------------
  // Equipos
  // ---------------------------------------------------------------------
  const invDe = (r) => (typeof getInverter === "function" && r.invId) ? getInverter(r.invId) : null;
  // Batería: del catálogo o escrita a mano ("Soluna de 10k"). El nombre escrito es el que sale en los documentos.
  function batDe(r) {
    const cat = (typeof getBattery === "function" && r.batId && r.batId !== "otra") ? getBattery(r.batId) : null;
    const nombre = String(r.nombre || "").trim();
    if (nombre) return { id: cat ? cat.id : null, name: nombre, propio: true };
    return cat;
  }
  function marcaDe(nombre) { const w = String(nombre || "").trim().split(/\s+/)[0] || ""; return /^h[ií]brido$/i.test(w) ? "Solis" : w; }
  function kwhNombre(nombre) { const m = String(nombre || "").match(/(\d+(?:\.\d+)?)\s*K/i); return m ? Number(m[1]) : 0; }
  function resumenEquipos(s) {
    const p = s.eq.paneles;
    const invs = s.eq.inversores.map(r => ({ r, inv: invDe(r) })).filter(x => x.inv && x.r.qty > 0);
    const bats = s.eq.baterias.map(r => ({ r, bat: batDe(r) })).filter(x => x.bat && x.r.qty > 0);
    const kwp = (Number(p.qty) || 0) * (Number(p.w) || 0) / 1000;
    const kwInv = invs.reduce((a, x) => a + Number(x.inv.kw) * x.r.qty, 0);
    const hibrido = invs.some(x => x.inv.type === "hibrido");
    return { p, invs, bats, kwp, kwInv, hibrido, nInv: invs.reduce((a, x) => a + Number(x.r.qty), 0) };
  }
  function textoEquipos(s) {
    const e = resumenEquipos(s);
    return [e.p.marca, e.p.modelo, ...e.invs.map(x => x.inv.name + " " + (x.r.modelo || "")), ...e.bats.map(x => x.bat.name + " " + (x.r.modelo || ""))].join(" ").toLowerCase();
  }

  // ---------------------------------------------------------------------
  // Lectura automática (texto pegado, cédula y factura)
  // ---------------------------------------------------------------------
  const sinAcento = (x) => String(x || "").normalize("NFD").replace(/[̀-ͯ]/g, "");
  const RX = {
    email: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/,
    cedulaF: /(?<![\d-])(\d{3})\s*[-–.]\s*(\d{7})\s*[-–.]\s*(\d)(?![\d-])/,
    cedula11: /(?<![\d-])(\d{3})(\d{7})(\d)(?![\d-])/,
    tel: /(?<![\d-])(?:\+?1[\s\-.]?)?\(?(809|829|849)\)?[\s\-.]*(\d{3})[\s\-.]*(\d{4})(?![\d-])/g,
    tarifa: /\b(BTS|BTD|BTH|MTD|MTH)\s*[-–]?\s*([12])?(?![A-Z0-9])/i
  };
  const fmtTel = (m) => `${m[1]}-${m[2]}-${m[3]}`;
  const fmtCed = (m) => `${m[1]}-${m[2]}-${m[3]}`;
  const tarifaDe = (t) => { const m = String(t || "").match(RX.tarifa); return m ? (m[1].toUpperCase() + (m[2] ? "-" + m[2] : "")) : ""; };
  // Limpia el texto (OCR o PDF): puntos de relleno → ":"; espacios raros
  const limpiar = (t) => String(t || "").normalize("NFC").replace(/\r/g, "").replace(/[ \t]/g, " ").replace(/(\s*\.){3,}\s*:?/g, ": ").replace(/[ ]*:\s*:/g, ":");
  // Valor después de una etiqueta en la misma línea (corta donde empieza otra columna: 3+ espacios)
  function trasEtiqueta(t, etiquetas) {
    for (const e of etiquetas) {
      const r = new RegExp("(?:^|[^A-Za-zÁÉÍÓÚÑáéíóúñ])(?:" + e + ")\\s*[:=\\-–]+[ ]*([^\\n]*)", "im");
      const m = t.match(r);
      if (m) { const v = m[1].split(/\s{3,}/)[0].replace(/^[\s:.\-]+|[\s:.,;\-]+$/g, "").trim(); if (v) return v; }
    }
    return "";
  }
  // Número o código después de una etiqueta (permite algo de texto en medio: "Contrato No.: 123")
  function numeroTras(t, etiquetas, patron, hueco) {
    for (const e of etiquetas) {
      const r = new RegExp("(?:" + e + ")[^\\n\\d]{0," + (hueco || 22) + "}?" + patron, "i");
      const m = t.match(r);
      if (m) return m[1].replace(/[\s.]/g, "");
    }
    return "";
  }
  const PALABRAS_NO_NOMBRE = /calle|avenida|\bav\b|sector|residencial|municipio|provincia|c[eé]dula|contrato|medidor|tarifa|correo|tel[eé]fono|celular|direcci|whats|gmail|hotmail|outlook|santiago|santo domingo|rep[uú]blica|dominicana|hola|buen[oa]s|saludos|gracias|cliente|nombre|kwh|panel|inversor|bater/i;
  function separarDireccion(dir, d) {
    const partes = dir.split(/\s*,\s*/).map(x => x.trim()).filter(Boolean);
    if (partes.length < 2) { if (!d.calle) d.calle = dir; return; }
    const esProv = (x) => PROVINCIAS.some(p => sinAcento(p).toLowerCase() === sinAcento(x).toLowerCase().replace(/^prov(?:incia)?\.?\s+/, "").replace(/\s*(?:rd|r\.d\.|rep\.? dom\.?)$/, ""));
    let prov = "";
    if (esProv(partes[partes.length - 1])) prov = partes.pop();
    if (!d.calle) d.calle = partes.shift();
    if (partes.length && !d.sector) d.sector = partes.shift();
    if (partes.length && !d.municipio) d.municipio = partes.join(", ");
    if (prov && !d.provincia) d.provincia = PROVINCIAS.find(p => sinAcento(p).toLowerCase() === sinAcento(prov).toLowerCase().replace(/^prov(?:incia)?\.?\s+/, "").replace(/\s*(?:rd|r\.d\.|rep\.? dom\.?)$/, "")) || prov;
    if (prov && !d.municipio && /^santiago$|^santo domingo$|^la vega$|^puerto plata$|^san francisco/i.test(prov)) { /* municipio vacío: se deja para que lo escriban */ }
  }
  function analizarTexto(texto) {
    const d = {};
    let t = limpiar(texto);
    const em = t.match(RX.email); if (em) { d.email = em[0].toLowerCase(); t = t.replace(em[0], " "); }
    // Cédula / RNC
    let ce = null;
    const rCed = /(?:c[eé]dula|ced\.?|c\.\s?i\.?|identidad|documento)[^\n\d]{0,25}?(\d{3}[\s\-–.]*\d{7}[\s\-–.]*\d)(?!\d)/i;
    const mc = t.match(rCed);
    if (mc) ce = mc[1].replace(/\D/g, "").match(/(\d{3})(\d{7})(\d)/);
    if (!ce) ce = t.match(RX.cedulaF);
    if (!ce) { const m = t.match(RX.cedula11); if (m && !/^1(809|829|849)/.test(m[0])) ce = m; }
    if (ce) { d.cedula = fmtCed(ce); t = t.replace(mc ? mc[1] : ce[0], " "); }
    if (!d.cedula) { const rnc = numeroTras(t, ["rnc"], "(\\d[\\d\\s\\-]{7,12}\\d)"); if (rnc) { const x = rnc.replace(/\D/g, ""); if (x.length === 9) d.cedula = `${x[0]}-${x.slice(1, 3)}-${x.slice(3, 8)}-${x[8]}`; else if (x.length === 11) d.cedula = `${x.slice(0, 3)}-${x.slice(3, 10)}-${x[10]}`; } }
    // Contrato y medidor (antes de los teléfonos, para no confundirlos)
    const contrato = numeroTras(t, ["n[uú]mero de contrato", "no\\.? de contrato", "contrato", "\\bnic\\b", "suministro"], "(\\d{5,10})(?!\\d)");
    if (contrato) d.contrato = contrato;
    const medidor = numeroTras(t, ["n[uú]mero de medidor", "no\\.? de medidor", "medidor", "contador"], "([A-Z]{0,4}\\d[\\dA-Z\\-]{3,15})");
    if (medidor) d.medidor = medidor.toUpperCase();
    // Teléfonos: según la palabra que tengan delante
    const tels = [...t.matchAll(RX.tel)];
    const usados = new Set();
    tels.forEach(m => {
      const antes = t.slice(Math.max(0, m.index - 28), m.index).toLowerCase();
      const n = fmtTel(m);
      if (usados.has(n)) return;
      if (/(cel|m[oó]vil|whats|\bwa\b|flota)[^\n]*$/.test(antes) && !d.celular) { d.celular = n; usados.add(n); }
      else if (/(tel|casa|fijo|oficina|residencia|d[ií]a|noche)[^\n]*$/.test(antes) && !d.telefono) { d.telefono = n; usados.add(n); }
    });
    tels.map(fmtTel).filter(n => !usados.has(n)).forEach(n => { if (!d.celular) { d.celular = n; usados.add(n); } else if (!d.telefono && n !== d.celular) { d.telefono = n; usados.add(n); } });
    const ta = tarifaDe(t); if (ta) d.tarifa = ta;
    // Nombre
    let nombre = trasEtiqueta(t, ["nombre(?:s)?(?: completo)?(?: del cliente)?", "cliente", "titular", "se[nñ]or(?:a)?", "sr\\.?", "sra\\.?"]);
    if (!nombre) {
      const l = t.split("\n").map(x => x.trim()).find(x => /^[A-Za-zÁÉÍÓÚÑÜáéíóúñü][A-Za-zÁÉÍÓÚÑÜáéíóúñü'.\s]+$/.test(x) && x.split(/\s+/).length >= 2 && x.split(/\s+/).length <= 6 && !PALABRAS_NO_NOMBRE.test(x));
      if (l) nombre = l;
    }
    if (!nombre) { const m = t.match(/^\s*((?:[A-Za-zÁÉÍÓÚÑÜáéíóúñü]{2,}\s+){1,5}[A-Za-zÁÉÍÓÚÑÜáéíóúñü]{2,})\s*[,;:\-]?\s*(?=\d|\n|$)/); if (m && !PALABRAS_NO_NOMBRE.test(m[1])) nombre = m[1]; }
    nombre = nombre.replace(/[\d,;:].*$/, "").replace(/\s+/g, " ").trim();
    if (nombre && nombre.split(" ").length >= 2) d.nombre = nombre;
    // Dirección
    const sector = trasEtiqueta(t, ["sector", "barrio", "urbanizaci[oó]n", "urb\\.?", "residencial", "res\\."]); if (sector) d.sector = sector;
    const muni = trasEtiqueta(t, ["municipio", "ciudad", "distrito municipal"]); if (muni) d.municipio = muni;
    const prov = trasEtiqueta(t, ["provincia", "prov\\."]); if (prov) d.provincia = prov;
    let dir = trasEtiqueta(t, ["direcci[oó]n(?: completa)?", "dir\\.?", "domicilio", "ubicaci[oó]n", "vive en", "reside en"]);
    if (!dir) { const l = t.split("\n").map(x => x.trim()).find(x => /^(c\/|calle|av\.?|avenida|carretera|carr\.?|autopista|callej[oó]n|manzana|mz\.?)\s/i.test(x)); if (l) dir = l; }
    if (dir) separarDireccion(dir, d);
    if (!d.provincia) { const p = PROVINCIAS.slice().sort((a, b) => b.length - a.length).find(p => new RegExp("\\b" + sinAcento(p) + "\\b", "i").test(sinAcento(t))); if (p) d.provincia = p; }
    return d;
  }
  // Nombre en orden "nombres apellidos" a partir de "APELLIDOS, NOMBRES"
  const ordenarNombre = (x) => { const p = String(x || "").split(","); return (p.length === 2 ? p[1].trim() + " " + p[0].trim() : x).replace(/\s+/g, " ").trim(); };
  // Cédula dominicana: número y nombre. Se cruzan el frente (nombre con acentos) y la zona de lectura del reverso.
  function parecido(a, b) {
    a = sinAcento(a).toUpperCase(); b = sinAcento(b).toUpperCase();
    if (Math.abs(a.length - b.length) > 2) return false;
    const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) m[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return m[a.length][b.length] <= Math.max(1, Math.floor(a.length / 5));
  }
  function analizarCedula(texto) {
    const d = {};
    const t = limpiar(texto).replace(/«/g, "<<").replace(/‹/g, "<");
    const ce = t.match(RX.cedulaF) || t.match(RX.cedula11); if (ce) d.cedula = fmtCed(ce);
    const plano = t.replace(/[ \t]/g, "").toUpperCase();
    if (!d.cedula) { const m = plano.match(/[I1L]D[DO0][O0]M(\d{9})<?(\d)(\d)/); if (m) d.cedula = `${m[1].slice(0, 3)}-${m[1].slice(3)}${m[2]}-${m[3]}`; }
    // Reverso: APELLIDOS<<NOMBRES
    let mrz = null;
    for (const l of plano.split("\n").filter(l => /<</.test(l) && !/^[I1L]D|^\d/.test(l))) {
      const m = l.replace(/[^A-Z<]/g, "").match(/([A-Z]{2,}(?:<[A-Z]{2,})*)<<([A-Z]{2,}(?:<[A-Z]{2,})*)/);
      if (m) { mrz = { apellidos: m[1].split("<"), nombres: m[2].split("<") }; break; }
    }
    // Frente: líneas en mayúsculas que parecen nombres
    const NO = /REP[UÚ]BLICA|DOMINICANA|JUNTA|CENTRAL|ELECTORAL|C[EÉ]DULA|IDENTIDAD|NACIONALIDAD|SEXO|FECHA|NACIMIENTO|LUGAR|EXPIRA|VENCE|ESTADO|CIVIL|OCUPACI|SANGRE|FIRMA|MUNICIPIO|SECTOR|DIRECCI|NOMBRES?|APELLIDOS?|DOMINICAN|EMISI|SOLTER|CASAD|UNI[OÓ]N|MASCULINO|FEMENINO|PRIVADO|EMPLEAD|ESTUDIANTE|ESCUELA|COLEGIO|UBICACI|POSTAL|REGISTRO|ACTA|RESIDENCIA|PRESIDENTE|CASA|CALLE|ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE/i;
    const cand = t.split(/\n/).filter(l => !l.includes("<")).map(l => l.replace(/[^A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(w => w.length >= 3 || /^(DE|DEL|LA|LOS|LAS|Y)$/.test(w)).join(" "))
      .filter(l => l.length >= 5 && /^[A-ZÁÉÍÓÚÑÜ\s]+$/.test(l) && !NO.test(l) && l.split(" ").length <= 4 && l.split(" ").every(w => /[AEIOUÁÉÍÓÚ]/.test(w) || w.length <= 3));
    if (mrz) {
      const pal = (l) => l.split(" ").filter(w => w.length >= 3);
      const nom = cand.find(l => pal(l).some(w => mrz.nombres.some(x => parecido(w, x))));
      const ape = cand.find(l => l !== nom && pal(l).some(w => mrz.apellidos.some(x => x.length >= 3 && parecido(w, x))));
      if (nom && ape) d.nombre = nom + " " + ape;
      else d.nombre = mrz.nombres.join(" ") + " " + mrz.apellidos.join(" ");
    } else if (cand.length) d.nombre = cand.slice(0, 2).join(" ");
    return d;
  }
  // Factura de Edenorte (PDF o foto)
  function analizarFactura(texto) {
    const d = {};
    const t = limpiar(texto);
    const corta = (v) => String(v || "").split(/\s{2,}|\b(?:ENCF|Potencia|C[oó]digo|Ref\.|Ruta|Itiner|Voltaje|CIRCUITO|APOYO|No\. Factura)\b/i)[0].replace(/\s+\S$/, "").replace(/^[\s:.\-]+|[\s:.,;\-]+$/g, "").trim();
    const c = t.match(/CONTRATO[^\d\n]{0,12}(\d{6,9})(?!\d)/i) || t.match(/\bNIC[^\d\n]{0,12}(\d{6,9})(?!\d)/i); if (c) d.contrato = c[1];
    let m = t.match(/Medidor[^\dA-Z\n]{0,25}([0-9][0-9A-Z]{5,12})/i) || t.match(/Activa\s*B\.?\s*T\.*\s*:?\s*(\d{6,10})/i);
    if (m) d.medidor = m[1];
    const ta = tarifaDe((t.match(/TAR[I1Il][FP]A[^\n]{0,40}/i) || [""])[0]) || tarifaDe(t); if (ta) d.tarifa = ta;
    const n = t.match(/NOMBRE\s*O\s*RAZ[OÓ]N\s*SOCIAL\s*:?\s*([^\n]+)/i);
    if (n) { const v = corta(n[1]).replace(/[\]\[|}{]+.*$/, "").replace(/[^A-ZÁÉÍÓÚÑÜa-záéíóúñü, .]/g, "").trim(); if (v.length > 4) d.nombre = ordenarNombre(v); }
    // Valor de la etiqueta; si está vacío en esa línea, el de la línea siguiente (pasa en los PDF)
    const val = (re) => {
      const x = t.match(re); if (!x) return "";
      let v = corta(x[1]); if (/[A-Z]{3}/i.test(v)) return v;
      const sig = t.slice(x.index + x[0].length).split("\n")[1] || "";
      return sig.includes(":") ? "" : corta(sig);
    };
    const loc = val(/Localidad\s*\/?\s*(?:Barri\w*)?\s*:?\s*([^\n]+)/i); if (loc && /[A-Z]{3}/i.test(loc)) d.sector = loc;
    const mu = val(/Municip\w*\s*:?\s*([^\n]+)/i); if (mu && /[A-Z]{3}/i.test(mu)) d.municipio = mu;
    const pr = val(/Provincia\w*\s*:?\s*([^\n]+)/i); if (pr && /[A-Z]{3}/i.test(pr)) d.provincia = pr;
    const di = val(/DIRECCI[OÓ]N\s*SUMINISTRO\s*:?\s*([^\n]+)/i); if (di && /[A-Z]{3}/i.test(di)) d.calle = di.replace(/\s+\d$/, "");
    const ce = t.match(/RNC\s*Cliente\s*:?\s*(\d{3}-?\d{7}-?\d|\d{9})/i);
    if (ce) { const x = ce[1].replace(/\D/g, ""); if (x.length === 11) d.cedula = `${x.slice(0, 3)}-${x.slice(3, 10)}-${x[10]}`; }
    return d;
  }
  const MENORES = /^(de|del|la|las|los|el|y|e)$/;
  const titulo = (s) => String(s || "").toLowerCase().split(/(\s+)/).map((w, i) => i > 0 && MENORES.test(w) ? w : w.replace(/^(\p{L})/u, (m) => m.toUpperCase())).join("");
  function aplicar(d, origen, sobrescribir) {
    if (!actual) return [];
    const c = actual.cliente, su = actual.sum, puestos = [];
    const pon = (obj, k, v, nombre) => { if (v && (sobrescribir || !obj[k]) && obj[k] !== v) { obj[k] = v; puestos.push(nombre); } };
    pon(c, "nombre", d.nombre && d.nombre.toUpperCase(), "nombre");
    pon(c, "cedula", d.cedula, actual.persona === "empresa" ? "RNC" : "cédula");
    pon(c, "celular", d.celular, "celular");
    pon(c, "telefono", d.telefono, "teléfono");
    pon(c, "email", d.email, "correo");
    pon(c, "calle", d.calle && titulo(d.calle), "dirección");
    pon(c, "sector", d.sector && titulo(d.sector), "sector");
    pon(c, "municipio", d.municipio && titulo(d.municipio), "municipio");
    pon(c, "provincia", d.provincia && titulo(d.provincia), "provincia");
    pon(su, "contrato", d.contrato, "contrato");
    pon(su, "medidor", d.medidor, "medidor");
    pon(su, "tarifa", d.tarifa, "tarifa");
    guardar();
    showToast(puestos.length ? `${origen}: se llenó ${puestos.join(", ")}. Revísalo.` : (sobrescribir ? `${origen}: no encontré datos.` : `${origen}: no encontré datos nuevos (los campos ya llenos no se cambian).`), puestos.length ? "success" : "info");
    return puestos;
  }
  // Mejora la foto antes de leerla: más grande, en gris y con más contraste
  async function prepararParaLeer(src) {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
    // 1) Recorta el margen blanco (cédulas escaneadas en una hoja completa)
    const W0 = img.naturalWidth, H0 = img.naturalHeight;
    const c0 = document.createElement("canvas"); c0.width = W0; c0.height = H0;
    const x0 = c0.getContext("2d"); x0.drawImage(img, 0, 0);
    const d0 = x0.getImageData(0, 0, W0, H0).data;
    let minX = W0, minY = H0, maxX = 0, maxY = 0;
    for (let y = 0; y < H0; y += 2) for (let x = 0; x < W0; x += 2) {
      const k = (y * W0 + x) * 4; if (0.3 * d0[k] + 0.59 * d0[k + 1] + 0.11 * d0[k + 2] < 215) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    }
    if (maxX <= minX || maxY <= minY) { minX = 0; minY = 0; maxX = W0 - 1; maxY = H0 - 1; }
    const pad = 12; minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad); maxX = Math.min(W0 - 1, maxX + pad); maxY = Math.min(H0 - 1, maxY + pad);
    const cw = maxX - minX + 1, ch = maxY - minY + 1;
    // 2) Agranda, pasa a gris y sube el contraste
    const sc = Math.max(1, Math.min(4, 2400 / cw));
    const c = document.createElement("canvas"); c.width = Math.round(cw * sc); c.height = Math.round(ch * sc);
    const cx = c.getContext("2d"); cx.imageSmoothingQuality = "high"; cx.drawImage(c0, minX, minY, cw, ch, 0, 0, c.width, c.height);
    const px = cx.getImageData(0, 0, c.width, c.height), a = px.data;
    const g = new Uint8ClampedArray(a.length / 4);
    for (let i = 0, j = 0; i < a.length; i += 4, j++) g[j] = 0.3 * a[i] + 0.59 * a[i + 1] + 0.11 * a[i + 2];
    const hist = new Array(256).fill(0); g.forEach(v => hist[v]++);
    let min = 0, max = 255, acc = 0; const tot = g.length;
    for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc > tot * 0.02) { min = v; break; } }
    acc = 0; for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc > tot * 0.02) { max = v; break; } }
    const r = Math.max(1, max - min);
    for (let i = 0, j = 0; i < a.length; i += 4, j++) { const v = Math.max(0, Math.min(255, (g[j] - min) * 255 / r)); a[i] = a[i + 1] = a[i + 2] = v; }
    cx.putImageData(px, 0, 0);
    return c.toDataURL("image/png");
  }
  async function ocr(imagenes) {
    if (!window.Tesseract) await cargarScript("https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js");
    const w = await window.Tesseract.createWorker("spa");
    let texto = "";
    try {
      for (const src of imagenes) {
        let s2 = src; try { s2 = await prepararParaLeer(src); } catch (e) { }
        const r = await w.recognize(s2); texto += "\n" + r.data.text;
      }
    } finally { await w.terminate(); }
    return texto;
  }
  // Texto de un PDF (las facturas digitales traen el texto adentro: no hace falta leer la imagen)
  async function textoPDF(file) {
    try {
      if (!window.pdfjsLib) return "";
      const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      let out = "";
      for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
        const pg = await pdf.getPage(i);
        const tc = await pg.getTextContent();
        const filas = [];
        tc.items.forEach(it => {
          if (!it.str || !it.str.trim()) return;
          const y = it.transform[5], x = it.transform[4];
          let f = filas.find(f => Math.abs(f.y - y) < 3);
          if (!f) { f = { y, items: [] }; filas.push(f); }
          f.items.push({ x, s: it.str, w: it.width || it.str.length * 4 });
        });
        filas.sort((a, b) => b.y - a.y).forEach(f => {
          f.items.sort((a, b) => a.x - b.x);
          let linea = "", fin = null;
          f.items.forEach(it => { linea += fin === null ? it.s : (it.x - fin > 12 ? "    " : (it.x - fin > 1.5 ? " " : "")) + it.s; fin = it.x + it.w; });
          out += linea + "\n";
        });
      }
      return out;
    } catch (e) { return ""; }
  }
  function cargarScript(src) {
    return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("No se pudo cargar el lector de texto")); document.head.appendChild(s); });
  }

  // ---------------------------------------------------------------------
  // Piezas de las páginas
  // ---------------------------------------------------------------------
  // Texto colocado con su línea base en (x, y) puntos
  // Ancho de un texto en puntos (Arimo mide igual que Arial)
  let ctxMedir = null;
  function anchoTexto(texto, size, bold, fam) {
    if (!ctxMedir) { try { ctxMedir = document.createElement("canvas").getContext("2d"); } catch (e) { } }
    if (!ctxMedir) return String(texto).length * size * 0.5;
    ctxMedir.font = `${bold ? "700 " : ""}${size}px ${fam || "Arimo, Arial, sans-serif"}`;
    return ctxMedir.measureText(String(texto)).width;
  }
  // Texto en una línea del formulario: si no cabe en el ancho de la línea, se achica la letra
  function T(x, y, texto, o) {
    o = Object.assign({}, o);
    if (o.max && texto) { let sz = o.size || 9; while (sz > (o.min || 6.5) && anchoTexto(texto, sz, o.bold) > o.max) sz -= 0.25; o.size = sz; }
    const size = o.size || 9, fam = o.fam || "'Arimo','Arial',sans-serif";
    if (!texto) return "";
    const w = o.w ? `width:${o.w}pt;white-space:normal;` : "white-space:nowrap;";
    return `<div class="som-t" style="left:${x}pt;top:${y - size * 0.85}pt;${w}font-family:${fam};font-size:${size}pt;line-height:${o.lh || 1};font-weight:${o.bold ? 700 : 400};${o.center ? "text-align:center;" : ""}${o.color ? `color:${o.color};` : ""}">${esc(texto)}</div>`;
  }
  // Texto largo en dos líneas del formulario (cada línea con su inicio y su ancho). Corta por palabras.
  function T2(texto, l1, l2, o) {
    o = o || {};
    if (!texto) return "";
    let size = o.size || 9.5;
    const partir = (sz) => {
      const pal = String(texto).split(/\s+/); let a = "", i = 0;
      while (i < pal.length && anchoTexto((a ? a + " " : "") + pal[i], sz) <= l1[2]) { a = (a ? a + " " : "") + pal[i]; i++; }
      if (!a) { a = pal[0]; i = 1; }
      return [a, pal.slice(i).join(" ")];
    };
    let [a, b] = partir(size);
    while (b && anchoTexto(b, size) > l2[2] && size > 7) { size -= 0.25; [a, b] = partir(size); }
    return T(l1[0], l1[1], a, { size }) + (b ? T(l2[0], l2[1], b, { size, max: l2[2] }) : "");
  }
  // Casilla rellena (cuadro negro) en la posición exacta del cuadro del formulario
  const CAJA = (x, y) => `<div class="som-caja" style="position:absolute;left:${x}pt;top:${y}pt;width:5.4pt;height:5.5pt;background:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact"></div>`;
  const CHK = (x, y, s) => `<svg class="som-chk" style="left:${x - 1}pt;top:${y - (s || 9)}pt;width:${s || 9}pt;height:${s || 9}pt" viewBox="0 0 10 10"><path d="M1.2 5.4 4 8.2 9 1.6" fill="none" stroke="#111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const BLANCO = (r) => `<div style="position:absolute;left:${r[0]}pt;top:${r[1]}pt;width:${r[2] - r[0]}pt;height:${r[3] - r[1]}pt;background:#fff"></div>`;
  const pag = (size, bg, html, extra) => Object.assign({ size, bg, html }, extra || {});
  const falta = (v, ancho) => v ? `<b>${esc(v)}</b>` : `<span class="som-falta">${"_".repeat(ancho || 14)}</span>`;
  const faltaN = (v, ancho) => v ? esc(v) : `<span class="som-falta">${"_".repeat(ancho || 14)}</span>`;

  // Dirección del sistema (si no se escribió aparte, la del cliente)
  function direccion(s) {
    const c = s.cliente;
    return s.sum.direccion || [c.calle, c.sector, c.municipio, c.provincia].filter(Boolean).join(", ");
  }

  // ---------------------------------------------------------------------
  // Documentos
  // ---------------------------------------------------------------------
  function anexoA(s) {
    const c = s.cliente, e = resumenEquipos(s), x = e.invs[0];
    const f = fechaCorta(s.fecha);
    const tri = x && /trif/i.test(x.inv.name + " " + (x.r.modelo || "")) || (x && x.r.fase === "tri");
    const kw = x ? Number(x.inv.kw) : 0;
    const corriente = x ? (x.r.corriente || n1(kw * 1000 / (tri ? 208 * Math.sqrt(3) : 240))) : "";
    const comp = [];
    if (e.p.qty > 0) comp.push([`${e.p.qty} Paneles solares ${e.p.marca} ${e.p.w}W${e.p.modelo ? " (" + e.p.modelo + ")" : ""}`, registroDe({ marca: e.p.marca, modelo: e.p.modelo })]);
    e.invs.forEach(i => comp.push([`${i.r.qty} Inversor${i.r.qty > 1 ? "es" : ""} ${marcaDe(i.inv.name).toUpperCase()} ${nt(i.inv.kw)}kW${i.r.modelo ? " (" + i.r.modelo + ")" : ""}`, registroDe({ marca: marcaDe(i.inv.name), modelo: i.r.modelo })]));
    e.bats.forEach(b => comp.push([`${b.r.qty} Batería${b.r.qty > 1 ? "s" : ""} de litio ${b.bat.name}${b.r.modelo ? " (" + b.r.modelo + ")" : ""}`, registroDe({ marca: marcaDe(b.bat.name), modelo: b.r.modelo })]));
    const p1 = T(100.8, 198.5, f, { size: 9 }) +
      T(106, 431.8, c.nombre, { max: 430 }) + T(126, 445.2, c.telefono, { max: 124 }) + T(102, 457.8, c.celular, { max: 146 }) +
      T(96.5, 471.3, c.email, { max: 240 }) + T(449, 471.3, c.cedula, { max: 92 }) + T(110, 484.6, [c.calle, c.sector, c.municipio, c.provincia].filter(Boolean).join(", "), { max: 428 }) +
      T(135, 637.2, direccion(s), { max: 400 }) + T(180, 651.5, s.sum.contrato, { max: 150 }) + T(150, 664.0, s.sum.medidor, { max: 180 });
    const p2 = comp.slice(0, 3).map((r, i) => T(76, 168.3 + i * 11.4, r[0], { size: 7.5 }) + T(298, 168.3 + i * 11.4, r[1], { size: 7.5 })).join("") +
      T(176.2, 506.9, e.nInv ? String(e.nInv) : "", { size: 9 });
    let p3 = T(224.5, 226.2, kw ? nt(kw) : "", { size: 8, bold: true }) + T(323.7, 226.2, kw ? nt(kw) : "", { size: 8, bold: true }) + T(409.9, 226.2, kw ? nt(kw) : "", { size: 8, bold: true }) +
      T(365.1, 237.9, corriente ? String(corriente) : "", { size: 8, bold: true }) +
      T(124.7, 303.3, x ? marcaDe(x.inv.name).toUpperCase() : "", { size: 8, bold: true }) + T(378.5, 303.3, x ? (x.r.modelo || "") : "", { size: 8, bold: true }) +
      T(392, 415.5, f) + T(392, 437.3, f);
    if (tri) p3 += BLANCO([117, 205, 128, 216]) + T(118.5, 213.9, "☐", { size: 8, fam: "'Segoe UI Symbol','DejaVu Sans',sans-serif" }) + BLANCO([201.5, 205, 211, 216]) + T(202.9, 213.2, "☒", { size: 8, fam: "'Segoe UI Symbol','DejaVu Sans',sans-serif" });
    return [pag("letter", SB + "anexoA-1.jpg", p1), pag("letter", SB + "anexoA-2.jpg", p2), pag("letter", SB + "anexoA-3.jpg", p3)];
  }

  function anexoB(s) {
    const c = s.cliente, e = resumenEquipos(s);
    const f = fechaCorta(s.fecha);
    const dirCliente = [c.calle, c.sector, c.municipio, c.provincia].filter(Boolean).join(", ");
    const p1 = T(178, 500.8, f, { size: 10 }) +
      T(134, 643.3, c.nombre, { size: 10, max: 342 }) + T(159, 667.3, c.telefono, { size: 9.5, max: 59 }) + T(399, 667.3, c.celular, { size: 9.5, max: 59 }) +
      T(142, 690, c.email, { size: 9.5, max: 126 }) + T(367, 690, c.cedula, { size: 9.5, max: 103 }) +
      T2(dirCliente, [139, 714.2, 340], [91, 735, 392], { size: 9.5 });
    // Tipo de cliente: se marca la segunda casilla de cada opción
    // Casillas del formulario (esquina superior izquierda, medidas sobre el escaneo). Se rellena la segunda de cada par.
    const casillas = { residencial: [108.8, 61.2], comercial: [182.9, 60.6], industrial: [251.8, 59.6], agricola: [318.2, 58.7], educativa: [378.7, 58.2], medica: [109.0, 74.9] };
    const cc = casillas[s.tipoCliente] || casillas.residencial;
    const dir = direccion(s);
    let p2 = CAJA(cc[0], cc[1]) +
      T2(dir, [179, 141.6, 322], [106, 162.6, 396], { size: 9.5 }) + T(202, 190.5, s.sum.contrato, { size: 10 }) + T(209, 215, s.sum.medidor, { size: 10 }) +
      T(407, 259.6, e.kwp ? nt(e.kwp) : "", { size: 10 }) + T(430, 372.6, e.kwp ? nt(e.kwp) : "", { size: 10 }) +
      (s.compensa === "parte" ? CAJA(162.2, 439.3) + T(202, 443.4, s.compensaPct ? String(s.compensaPct).replace(/%/g, "") : "", { size: 9, max: 16 }) : CAJA(115.2, 439.7)) +
      (s.instalado ? CAJA(416.2, 491.0) : CAJA(382.6, 491.5)) +
      CAJA(116.6, 547.7) +
      T(352, 631, f, { size: 10 });
    return [pag("letter", SB + "anexoB-1.jpg", p1), pag("letter", SB + "anexoB-2.jpg", p2)];
  }

  // Cartas con el membrete de Freedom
  function membrete(html, docKey) {
    return pag("a4", SB + "membrete.jpg", `<div class="som-carta" data-doc="${docKey}">${html}</div>`, { editable: docKey });
  }
  const encabezadoCarta = (s) => `<div class="som-fecha">${esc(fechaLarga(s.fecha))}<br>Santiago, Rep. Dom.</div>`;
  function cartaAutorizacion(s) {
    const c = s.cliente;
    const empresa = s.persona === "empresa";
    const cuerpo = empresa
      ? `<p>Tras un cordial saludo, por medio de la presente carta, la empresa ${falta(c.nombre, 30)}, RNC ${falta(c.cedula, 14)}, autoriza y da su consentimiento al instalador <b>${FREEDOM.nombre} (RNC ${FREEDOM.rnc})</b> para que intervenga en todo lo relativo al proceso de sometimiento de su proyecto para el programa de medición neta.</p>
         <p>Su localidad está contratada bajo el <b>contrato No. </b>${falta(s.sum.contrato, 10)}, con el <b>medidor No. </b>${falta(s.sum.medidor, 10)}, dentro de la tarifa ${falta(s.sum.tarifa, 6)}.</p>`
      : `<p>Tras un cordial saludo, por medio de la presente carta, yo, ${falta(c.nombre, 30)}, portador(a) de la cédula de identidad y electoral ${falta(c.cedula, 14)}, autorizo y doy mi consentimiento al instalador <b>${FREEDOM.nombre} (RNC ${FREEDOM.rnc})</b> para que intervenga en todo lo relativo al proceso de sometimiento de mi proyecto para el programa de medición neta.</p>
         <p>Mi localidad está contratada bajo el <b>contrato No. </b>${falta(s.sum.contrato, 10)}, con el <b>medidor No. </b>${falta(s.sum.medidor, 10)}, dentro de la tarifa ${falta(s.sum.tarifa, 6)}.</p>`;
    return encabezadoCarta(s) +
      `<p class="som-dest">Estimados señores de <b>EDENORTE DOMINICANA, S. A.</b><br>Av. Juan Pablo Duarte No. 87, Santiago de los Caballeros.</p>` +
      cuerpo +
      `<div class="som-firma-cliente">${empresa ? "Firma y sello del representante" : "Firma del cliente"}: <span class="som-linea"></span></div>`;
  }
  function lineasEquipos(s) {
    const e = resumenEquipos(s);
    const li = [];
    e.invs.forEach(x => {
      const n = Number(x.r.qty), hib = x.inv.type === "hibrido";
      li.push(`<b>${n} ${n === 1 ? "Inversor" : "Inversores"} ${esc(marcaDe(x.inv.name).toUpperCase())} ${hib ? (n === 1 ? "Híbrido" : "Híbridos") : "de inyección"} de ${nt(x.inv.kw)}kW</b>, modelo ${falta(x.r.modelo, 16)}`);
    });
    if (e.p.qty > 0) li.push(`<b>${e.p.qty} Paneles Solares ${esc(e.p.marca)} ${esc(e.p.w)}W</b>, modelo ${falta(e.p.modelo, 16)}`);
    e.bats.forEach(x => {
      const n = Number(x.r.qty);
      const nb = x.bat.propio ? x.bat.name.replace(/^\p{Ll}/u, (c) => c.toUpperCase()) : x.bat.name.replace(/\s+de\s+(?=\d)/i, " ").replace(/(\d+(?:\.\d+)?)\s*K\b/i, "$1 kWh");
      li.push(`<b>${n} ${n === 1 ? "Batería" : "Baterías"} de Litio ${esc(nb)}</b>`);
    });
    return li.length ? `<ul class="som-lista">${li.map(l => `<li>${l}</li>`).join("")}</ul>` : `<p class="som-falta-p">(Agrega los equipos en la sección Equipos)</p>`;
  }
  function descripcionExtra(s) {
    const t = String(s.descripcion || "").trim();
    if (!t) return "";
    const lineas = t.split(/\n+/).map(l => l.trim()).filter(Boolean);
    return `<p><b>Descripción general:</b></p>` + lineas.map(l => /^[→\-•*]/.test(l) ? `<p class="som-sub">→ ${esc(l.replace(/^[→\-•*]\s*/, ""))}</p>` : `<p>${esc(l)}</p>`).join("");
  }
  function cartaDescripcion(s) {
    const lugar = s.persona === "empresa" || (s.tipoCliente && s.tipoCliente !== "residencial") ? "nuestras instalaciones" : "nuestra residencia";
    const peticion = s.programa === "neta"
      ? `solicitamos cordialmente la habilitación de la opción de lectura neta y el registro de medición bidireccional en nuestro medidor de energía, conforme a lo establecido en la <b>Ley No. 57-07, Ley de Incentivos al Desarrollo de Fuentes Renovables de Energía y de sus Regímenes Especiales.</b>`
      : `solicitamos cordialmente que nuestro proyecto de inyección cero y autoconsumo pueda formar parte del programa de medición neta, conforme a lo establecido en la <b>Ley No. 57-07, Ley de Incentivos al Desarrollo de Fuentes Renovables de Energía y de sus Regímenes Especiales.</b>`;
    return encabezadoCarta(s) +
      `<p class="som-dest">Estimados señores de <b>EDENORTE DOMINICANA, S. A.</b></p>` +
      `<p>Por medio de la presente, y con el propósito de producir energía solar en ${lugar}, ${peticion}</p>` +
      `<p>El sistema fotovoltaico propuesto estará compuesto por los siguientes equipos:</p>` + lineasEquipos(s) + descripcionExtra(s) +
      `<p>El proyecto estará bajo el <b>contrato No. </b>${falta(s.sum.contrato, 10)}, con el <b>medidor No. </b>${falta(s.sum.medidor, 10)}, dentro de la tarifa ${falta(s.sum.tarifa, 6)}.</p>` +
      `<p>Agradecemos de antemano su atención a la presente solicitud y quedamos a su disposición.</p>` +
      `<p style="margin-top:22pt">Atentamente,</p><p style="margin-top:26pt">Dirección General<br>${FREEDOM.nombre}<br>Tel.: ${FREEDOM.tel}</p>`;
  }
  function cartaGarantia(s) {
    const e = resumenEquipos(s);
    let h = encabezadoCarta(s) + `<p class="som-titulo-carta">NORMAS DE GARANTÍA</p>`;
    if (e.p.qty > 0) h += `<p class="som-h">MÓDULOS FOTOVOLTAICOS: ${esc(e.p.marca.toUpperCase())} ${e.p.modelo ? esc(e.p.modelo) : faltaN("", 16)}</p>
      <p>El producto cuenta con una garantía limitada de diez (10) años, lo que significa que, durante este período, los módulos deben estar libres de defectos que afecten su funcionalidad bajo condiciones normales de operación. Si el producto presenta algún defecto que no cumpla con esta garantía, se ofrecerá el servicio de reparación, reemplazo o una compensación adecuada.</p>
      <p>Además, se ofrece una garantía de desempeño lineal de veinticinco (25) años. En caso de que se detecte una desviación en el desempeño que no cumpla con los estándares establecidos, se compensará al cliente por la pérdida total de potencia, se reemplazarán los módulos afectados o se remunerará su valor correspondiente.</p><hr>`;
    e.invs.forEach(x => {
      h += `<p class="som-h">INVERSOR ${x.inv.type === "hibrido" ? "HÍBRIDO" : "DE INYECCIÓN"}: ${esc(marcaDe(x.inv.name).toUpperCase())} ${x.r.modelo ? esc(x.r.modelo) : faltaN("", 16)}</p>
      <p>La garantía limitada del producto tendrá una duración de cinco (5) años y cubrirá los inversores contra posibles defectos de fabricación o materiales en condiciones normales de funcionamiento. En caso de que el producto no cumpla con esta garantía, se procederá a su reparación, reemplazo o se ofrecerá una compensación adecuada. Sin embargo, existen algunas excepciones a tener en cuenta, como fallos en la red eléctrica del distribuidor o del cliente que estén fuera del alcance del proyecto solar, reparaciones o modificaciones realizadas sin autorización, o daños causados por circunstancias que no estén relacionadas con la calidad del producto.</p><hr>`;
    });
    h += `<p class="som-h">DISPONIBILIDAD DE NUESTRAS MARCAS</p>
      <p>En caso de sustitución necesaria, ${FREEDOM.nombre} se compromete a intercambiar componentes de la instalación por marcas de igual calidad, potencia y garantía.</p>
      <p style="margin-top:26pt">Dirección General<br>${FREEDOM.nombre}</p>`;
    return h;
  }
  // Formulario oficial de factura ecológica (mismo texto del formulario de Edenorte)
  function facturaEcologica(s) {
    const c = s.cliente, d = fechaDe(s.fecha);
    const u = (v, n) => v ? `<u>${esc(v)}</u>` : "_".repeat(n);
    const html = `<div class="som-eco-t">SOLICITUD RECEPCIÓN DE FACTURA ECOLÓGICA</div>
      <div class="som-eco">Quien subscribe, ${u(c.nombre, 49)}, titular de la cédula de identidad y electoral No. ${u(c.cedula, 24)}, domiciliado y residente en la Calle ${u(c.calle, 29)}., del sector ${u(c.sector, 16)}, municipio y provincia de ${u([c.municipio, c.provincia].filter(Boolean).join(", "), 29)}, República Dominicana. Con la firma del presente documento SOLICITO y AUTORIZO a EDENORTE DOMINICANA, S. A., a lo siguiente: PRIMERO: En vista de lo que estipula el artículo 467 del Reglamento para la Aplicación de la Ley General de Electricidad No. 125-01 que: “La Empresa de Distribución deberá entregar la factura mensual por consumo de energía eléctrica al cliente o usuario titular (…), en la dirección del punto de suministro de energía o en la dirección que indique el cliente o usuario titular; (…)”, proceda a remitirme, ÚNICAMENTE, vía a mi dirección de correo electrónico ${c.email ? u(c.email) : "_".repeat(52) + ", " + "_".repeat(52)} todas las facturas mensuales por concepto de consumo de energía eléctrica, así como cualquier otra documentación resultante del contrato del servicio de energía eléctrica que he suscrito con esta empresa distribuidora con el NIC ${u(s.sum.contrato, 16)}, ubicado en la calle ${u(c.calle, 29)}, del sector ${u(c.sector, 16)}, municipio y provincia de ${u([c.municipio, c.provincia].filter(Boolean).join(", "), 30)}, República Dominicana. SEGUNDO: Por tanto, declaro bajo la fe del juramento, que los datos aportados en este documento corresponden con la verdad y que no he omitido ni falseado dato alguno. Además reconozco que la recepción de las facturas en la dirección electrónica indicada anteriormente, actúa en efecto como notificación fehaciente de deuda, así como aviso de corte al vencimiento del plazo indicado, de conformidad con lo establecido en el artículo 95 de la Ley General de Electricidad No. 125-01 y su Reglamento de Aplicación.</div>
      <div class="som-eco" style="margin-top:14pt">Firmado el día ${u(String(d.getDate()), 7)} de ${u(MESES[d.getMonth()], 16)} del año ${u(String(d.getFullYear()), 10)}, en la ciudad de Santiago de los Caballeros, República Dominicana.</div>
      <div class="som-eco-firma"><span></span>Titular del Contrato</div>`;
    return [pag("letter", null, `<div class="som-eco-wrap">${html}</div>`)];
  }

  // Páginas a partir de archivos subidos (imágenes o PDF convertidos)
  async function paginasArchivos(lista, opciones) {
    const out = [];
    for (const a of lista || []) {
      const data = await arch().get(a.id);
      if (!data || !data.paginas) continue;
      for (let i = 0; i < data.paginas.length; i++) {
        const src = data.paginas[i];
        const dim = await medir(src);
        const horizontal = dim[0] > dim[1] * 1.05;
        const size = horizontal ? (opciones && opciones.a4 ? "a4l" : "letterl") : (opciones && opciones.a4 ? "a4" : "letter");
        const [W, H] = SIZES[size];
        const margen = opciones && opciones.margen !== undefined ? opciones.margen : 18;
        let html = `<img src="${src}" alt="" style="position:absolute;left:${margen}pt;top:${margen}pt;width:${W - 2 * margen}pt;height:${H - 2 * margen}pt;object-fit:contain">`;
        if (opciones && opciones.firma && a.firma !== false) {
          const pos = (a.firmaPos && a.firmaPos[i]) || { x: 0.865, y: 0.765, w: 0.075 };
          html += `<img src="${SB}firma.png" alt="" class="som-firma-img" data-archivo="${esc(a.id)}" data-pag="${i}" style="left:${pos.x * W}pt;top:${pos.y * H}pt;width:${pos.w * W}pt">`;
        }
        out.push(pag(size, null, html));
      }
    }
    return out;
  }
  // Cédula: frente y reverso en una misma hoja, como se presenta normalmente
  async function paginasCedula(s) {
    const imgs = [];
    for (const a of s.archivos.cedula) { const d = await arch().get(a.id); if (d && d.paginas) imgs.push(...d.paginas); }
    if (!imgs.length) return [];
    const html = imgs.slice(0, 2).map((src, i) => `<img src="${src}" alt="" style="position:absolute;left:96pt;top:${i ? 430 : 70}pt;width:420pt;height:300pt;object-fit:contain">`).join("");
    const pags = [pag("letter", null, html)];
    if (imgs.length > 2) pags.push(...imgs.slice(2).map(src => pag("letter", null, `<img src="${src}" alt="" style="position:absolute;left:36pt;top:36pt;width:540pt;height:720pt;object-fit:contain">`)));
    return pags;
  }
  async function paginasLibreria(tipo, s) {
    const docs = docsPara(tipo, s);
    const out = [];
    for (const d of docs) {
      if (d.src) {
        for (const f of d.src) {
          const src = d.fijo ? L + f : f;
          const dim = await medir(src);
          const a4 = Math.abs(dim[1] / dim[0] - 1.414) < 0.03;
          const [W, H] = SIZES[a4 ? "a4" : "letter"];
          out.push(pag(a4 ? "a4" : "letter", null, `<img src="${src}" alt="" style="position:absolute;left:0;top:0;width:${W}pt;height:${H}pt;object-fit:contain">`));
        }
      } else out.push(...await paginasArchivos([{ id: "cert_" + d.id }], { margen: 0, a4: d.a4 }));
    }
    return out;
  }
  async function paginasFichas(s) {
    const e = resumenEquipos(s);
    const F = window.FEGPropuesta && window.FEGPropuesta.fichasPaginas;
    if (!F) return [];
    // Si subiste un datasheet propio para un equipo, se usa ese en vez del del sistema
    const conPropia = (item) => bibliotecaCompleta().some(d => d.tipo === "ficha" && corresponde(d, item));
    const it = itemsEquipo(s);
    const panelPropio = it.some(i => i.tipo === "panel" && conPropia(i));
    const fichas = await F({ panelQty: panelPropio ? 0 : e.p.qty, panelW: e.p.w, marcaPanel: e.p.marca,
      inversores: e.invs.filter(x => !conPropia({ marca: marcaDe(x.inv.name), modelo: x.r.modelo })).map(x => x.inv.id),
      baterias: e.bats.filter(x => x.bat.id && !conPropia({ marca: marcaDe(x.bat.name), modelo: x.r.modelo || (x.bat.propio ? x.bat.name : "") })).map(x => x.bat.id) });
    const propias = await paginasLibreria("ficha", s);
    return fichas.map(f => pag("letter", null, `<img src="${f.src}" alt="" style="position:absolute;left:${f.completa ? 0 : 24}pt;top:${f.completa ? 0 : 24}pt;width:${f.completa ? 612 : 564}pt;height:${f.completa ? 792 : 744}pt;object-fit:contain">`)).concat(propias);
  }
  async function paginasCodia() {
    const cod = biblio().codia;
    if (cod && cod.id) { const p = await paginasArchivos([{ id: "codia_" + cod.id }], { margen: 0 }); if (p.length) return p; }
    return [pag("letterl", null, `<img src="${SB}carnet.jpg" alt="" style="position:absolute;left:96pt;top:70pt;width:600pt;height:472pt;object-fit:contain">`)];
  }
  const medirCache = new Map();
  function medir(src) {
    if (medirCache.has(src)) return Promise.resolve(medirCache.get(src));
    return new Promise(res => { const i = new Image(); i.onload = () => { const d = [i.naturalWidth, i.naturalHeight]; medirCache.set(src, d); res(d); }; i.onerror = () => res([612, 792]); i.src = src; });
  }

  // Lista de documentos según el programa (como la hoja de requisitos de Edenorte)
  function documentos(s) {
    const tiene = (k) => (s.archivos[k] || []).length > 0;
    const c = s.cliente;
    const faltan = (arr) => arr.filter(([v]) => !v).map(([, n]) => n);
    const e = resumenEquipos(s);
    const modelos = [e.p.qty > 0 && !e.p.modelo ? "modelo del panel" : "", ...e.invs.filter(x => !x.r.modelo).map(() => "modelo del inversor")].filter(Boolean);
    const datosCliente = faltan([[c.nombre, "nombre"], [c.cedula, "cédula"], [s.sum.contrato, "contrato"], [s.sum.medidor, "medidor"]]);
    const faltaDoc = (tipo) => sinDoc(tipo, s).map(i => "no hay documento para " + (i.modelo || i.nombre + " (escribe el modelo)"));
    const D = [];
    if (s.programa === "neta") D.push({ key: "anexoA", nombre: "Anexo A", falta: datosCliente.concat(e.invs.length ? [] : ["inversor"]), pags: async () => anexoA(s) });
    else D.push({ key: "anexoB", nombre: "Anexo B", falta: datosCliente.concat(e.kwp ? [] : ["paneles"]), pags: async () => anexoB(s) });
    D.push({ key: "descripcion", nombre: "Carta de descripción del proyecto", falta: faltan([[s.sum.contrato, "contrato"], [s.sum.medidor, "medidor"], [s.sum.tarifa, "tarifa"]]).concat(modelos), pags: async () => [membrete(cartaDescripcion(s), "descripcion")] });
    D.push({ key: "autorizacion", nombre: "Carta de autorización del cliente", falta: datosCliente.concat(s.sum.tarifa ? [] : ["tarifa"]), pags: async () => [membrete(cartaAutorizacion(s), "autorizacion")] });
    D.push({ key: "cedula", nombre: s.persona === "empresa" ? "Cédula del representante" : "Cédula del cliente", falta: tiene("cedula") ? [] : ["subir la cédula"], pags: () => paginasCedula(s) });
    if (s.programa === "neta" || tiene("factura")) D.push({ key: "factura", nombre: "Factura eléctrica de Edenorte", falta: tiene("factura") ? [] : ["subir la factura"], pags: () => paginasArchivos(s.archivos.factura) });
    D.push({ key: "garantia", nombre: "Carta de garantía de los equipos", falta: modelos, pags: async () => [membrete(cartaGarantia(s), "garantia")] });
    D.push({ key: "garantiaFab", nombre: "Garantía del fabricante", falta: faltaDoc("garantiaFab"), pags: () => paginasLibreria("garantiaFab", s) });
    D.push({ key: "cne", nombre: "Certificación de la CNE", falta: faltaDoc("cne"), pags: () => paginasLibreria("cne", s) });
    D.push({ key: "distribuidor", nombre: "Autorización del distribuidor (uso de certificación)", falta: [], pags: () => paginasLibreria("distribuidor", s) });
    const sinFicha = resumenEquipos(s).bats.filter(x => !x.bat.id && !bibliotecaCompleta().some(d => d.tipo === "ficha" && corresponde(d, { marca: marcaDe(x.bat.name), modelo: x.bat.name })));
    D.push({ key: "fichas", nombre: "Fichas técnicas", falta: sinFicha.map(x => "subir el datasheet de " + x.bat.name), pags: () => paginasFichas(s) });
    D.push({ key: "codia", nombre: "Certificación del CODIA del ingeniero", falta: biblio().codia ? [] : ["subir la certificación vigente"], pags: () => paginasCodia() });
    D.push({ key: "planos", nombre: "Diagrama unifilar y de situación (planos)", falta: tiene("planos") ? [] : ["subir los planos"], pags: () => paginasArchivos(s.archivos.planos, { firma: true, margen: 0, a4: true }) });
    D.push({ key: "fotos", nombre: s.programa === "neta" ? "Imágenes de la ubicación del proyecto" : "Fachada donde se realizará la instalación", falta: tiene("fotos") ? [] : ["subir las fotos"], pags: () => paginasArchivos(s.archivos.fotos) });
    D.push({ key: "ecologica", nombre: "Formulario de factura ecológica", falta: faltan([[c.nombre, "nombre"], [c.cedula, "cédula"], [c.email, "correo"], [s.sum.contrato, "NIC"]]), pags: async () => facturaEcologica(s) });
    if (s.persona === "empresa") D.push({ key: "empresa", nombre: "Registro mercantil y acta de asamblea", falta: tiene("empresa") ? [] : ["subir los documentos de la empresa"], pags: () => paginasArchivos(s.archivos.empresa) });
    if (tiene("otros")) D.push({ key: "otros", nombre: "Otros documentos", falta: [], pags: () => paginasArchivos(s.archivos.otros) });
    D.forEach(d => { d.incluir = s.incluir[d.key] !== undefined ? !!s.incluir[d.key] : !d.opcional; });
    return D;
  }

  // ---------------------------------------------------------------------
  // Pantalla
  // ---------------------------------------------------------------------
  function crear() {
    if ($("somOverlay")) return;
    const css = document.createElement("style");
    css.textContent = `
#somOverlay{position:fixed;inset:0;z-index:66;background:#f5f5f3;display:flex;flex-direction:column;font-family:Inter,system-ui,sans-serif;color:#2b2b2b;--e:cubic-bezier(.23,1,.32,1)}
#somOverlay.abre{animation:som-abre 240ms var(--e) both}
@keyframes som-abre{from{opacity:0;transform:scale(.985)}}
.som-top{background:#2b2b2b;box-shadow:inset 0 -2px 0 #ffab00;color:#fff;padding:10px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.som-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:0;border-radius:10px;padding:8px 13px;font-weight:700;font-size:12.5px;cursor:pointer;white-space:nowrap;transition:background-color 150ms var(--e),transform 150ms var(--e)}
.som-btn:active{transform:scale(.97)}
.som-btn.nar{background:#ffab00;color:#2b2b2b}.som-btn.osc{background:#333;color:#fff}.som-btn.cla{background:#ececea;color:#2b2b2b}.som-btn.top{background:rgba(255,255,255,.1);color:#fff}
.som-body{flex:1;min-height:0;display:flex}
.som-lado{width:390px;flex-shrink:0;overflow-y:auto;background:#fff;border-right:1px solid #e7e7e4;padding:14px 16px 60px}
.som-main{flex:1;min-width:0;overflow:auto;padding:16px 14px 60px}
.som-sec{border:1px solid #ececea;border-radius:14px;margin-bottom:10px;overflow:hidden}
.som-sec>summary{list-style:none;cursor:pointer;padding:11px 14px;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:space-between;background:#fafaf8}
.som-sec>summary::-webkit-details-marker{display:none}
.som-sec>summary:after{content:"›";transform:rotate(90deg);color:#999;transition:transform 160ms var(--e)}
.som-sec[open]>summary:after{transform:rotate(-90deg)}
.som-sec .in{padding:10px 14px 14px}
.som-lab{display:block;font-size:11px;font-weight:600;color:#666;margin:0 0 8px}
.som-in{width:100%;padding:7px 9px;font-size:13px;background:#f8f8f6;border:1px solid #e3e3e0;border-radius:8px;outline:none;margin-top:3px;transition:border-color 150ms var(--e),box-shadow 150ms var(--e)}
.som-in:focus{border-color:#ffcf4d;background:#fff;box-shadow:0 0 0 3px rgba(255,171,0,.14)}
.som-in.vacio{background:#fffaf0}
.som-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.som-seg{display:flex;background:#f1f1ef;border-radius:10px;padding:3px;gap:3px;margin-bottom:8px}
.som-seg button{flex:1;border:0;background:none;padding:7px 6px;border-radius:8px;font-size:12px;font-weight:600;color:#666;cursor:pointer}
.som-seg button.on{background:#fff;color:#2b2b2b;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.som-nota{font-size:10.5px;color:#999;line-height:1.4;margin:4px 0 8px}
.som-eqrow{border:1px solid #ececea;border-radius:10px;padding:8px;margin-bottom:8px;position:relative}
.som-x{position:absolute;top:4px;right:8px;border:0;background:none;color:#bbb;font-weight:700;cursor:pointer;font-size:15px}
.som-arch{display:flex;align-items:center;gap:8px;font-size:12px;padding:5px 0;border-bottom:1px dashed #eee}
.som-arch:last-child{border-bottom:0}
.som-arch span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.som-docs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.som-doc{display:flex;align-items:center;gap:7px;padding:7px 10px;border-radius:10px;background:#fff;border:1.5px solid #ececea;font-size:12px;font-weight:600;cursor:pointer;transition:border-color 150ms var(--e)}
.som-doc.on{border-color:#ffab00;background:#fffaf0}
.som-doc input{accent-color:#ffab00;width:14px;height:14px}
.som-dot{width:8px;height:8px;border-radius:8px;background:#7bc47f;flex-shrink:0}.som-dot.f{background:#ffab00}
.som-barra{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px}
.som-aviso{font-size:12px;color:#8a5a00;background:#fff4d6;border:1px solid #ffd98a;border-radius:10px;padding:8px 10px;margin-bottom:10px}
.som-wrap{margin:0 auto 18px;position:relative}
.som-page{position:absolute;left:0;top:0;overflow:hidden;background:#fff;transform-origin:0 0;box-shadow:0 4px 20px rgba(0,0,0,.12)}
.som-page>.bg{position:absolute;left:0;top:0;width:100%;height:100%}
.som-t{position:absolute;color:#111}
.som-chk{position:absolute}
.som-falta{color:#9a9a9a}
.som-carta{position:absolute;left:59.5pt;top:98pt;width:476pt;font-family:'Tinos','Times New Roman',Times,serif;font-size:12.5pt;line-height:1.32;color:#111;text-align:justify;outline:none}
.som-carta[contenteditable]:focus{box-shadow:0 0 0 1.5px #ffab00;border-radius:2px}
.som-carta p{margin:0 0 10pt}
.som-carta .som-fecha{text-align:right;font-weight:700;font-size:12pt;margin-bottom:36pt}
.som-carta .som-dest{margin-bottom:20pt}
.som-carta .som-lista{margin:0 0 12pt;padding-left:16pt}
.som-carta .som-lista li{margin-bottom:6pt}
.som-carta .som-sub{padding-left:12pt;margin-bottom:4pt}
.som-carta .som-titulo-carta{text-align:center;font-weight:700;font-size:14pt;margin:-10pt 0 16pt}
.som-carta .som-h{font-weight:700;margin-bottom:6pt}
.som-carta hr{border:0;border-top:1px solid #333;margin:8pt 0 12pt}
.som-carta .som-firma-cliente{margin-top:150pt}
.som-carta .som-linea{display:inline-block;width:200pt;border-bottom:1px solid #111;vertical-align:bottom}
.som-carta .som-falta-p{color:#b45309}
.som-eco-wrap{position:absolute;left:52.8pt;top:82pt;width:508pt;color:#111}
.som-eco-t{font-family:'Arimo',Arial,sans-serif;font-weight:700;font-size:12.5pt;text-align:center;margin-bottom:24pt}
.som-eco{font-family:'Carlito',Calibri,'Arimo',sans-serif;font-size:11pt;line-height:14.5pt;text-align:justify}
.som-eco u{text-decoration-thickness:.6pt;text-underline-offset:2pt;font-weight:700}
.som-eco-firma{margin:90pt auto 0;width:270pt;text-align:center;font-family:'Arimo',Arial,sans-serif;font-weight:700;font-size:11.5pt}
.som-eco-firma span{display:block;border-top:1px solid #111;margin-bottom:4pt}
.som-firma-img{position:absolute;cursor:move;touch-action:none}
.som-firma-img:hover{outline:1px dashed #ffab00}
.som-lista-s{max-width:760px;margin:0 auto}
.som-fila{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #ececea;border-radius:14px;padding:12px 14px;margin-bottom:8px;cursor:pointer;transition:border-color 150ms var(--e)}
.som-fila b{font-size:14px}.som-fila small{display:block;color:#888;font-size:11.5px;margin-top:2px}
.som-chipp{font-size:10.5px;font-weight:700;padding:3px 8px;border-radius:999px;background:#fff4d6;color:#8a5a00;border:1px solid #ffd98a}
@media (hover:hover) and (pointer:fine){.som-fila:hover,.som-doc:hover{border-color:#ffcf4d}.som-btn.nar:hover{background:#ffbd1f}.som-btn.top:hover{background:rgba(255,255,255,.16)}}
@media (max-width:900px){.som-body{flex-direction:column;overflow-y:auto}.som-lado{width:auto;border-right:0;overflow:visible}.som-main{overflow:visible}}
@media (prefers-reduced-motion:reduce){#somOverlay,#somOverlay *{animation:none!important;transition:none!important}}
#somPrint{display:none}
@page sletter{size:letter;margin:0}
@page sa4{size:A4;margin:0}
@page sletterl{size:letter landscape;margin:0}
@page sa4l{size:A4 landscape;margin:0}
@media print{
  body.som-imprimiendo>*:not(#somPrint){display:none!important}
  body.som-imprimiendo{background:#fff!important;display:block!important;overflow:visible!important}
  body.som-imprimiendo #somPrint{display:block!important}
  #somPrint .som-page{position:relative!important;transform:none!important;box-shadow:none!important;break-after:page;page-break-after:always}
  #somPrint .som-page:last-child{break-after:auto;page-break-after:auto}
  #somPrint .som-page.letter{page:sletter}#somPrint .som-page.a4{page:sa4}#somPrint .som-page.letterl{page:sletterl}#somPrint .som-page.a4l{page:sa4l}
  #somPrint .som-falta{color:#111}
  #somPrint .som-carta{box-shadow:none!important}
  #somPrint *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}`;
    document.head.appendChild(css);
    const d = document.createElement("div");
    d.id = "somOverlay"; d.style.display = "none";
    d.innerHTML = `<div class="som-top">
        <button type="button" class="som-btn top" id="somVolver">← Volver</button>
        <div class="feg-logo" style="width:112px;height:32px;flex-shrink:0" aria-hidden="true"></div>
        <div style="min-width:0;flex:1">
          <div id="somTitulo" style="font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Sometimientos</div>
          <div id="somSub" style="font-size:11px;color:rgba(255,255,255,.55)">Documentos para la distribuidora</div>
        </div>
        <div id="somAcciones" style="display:flex;gap:8px"></div>
      </div>
      <div class="som-body" id="somBody"></div>`;
    document.body.appendChild(d);
    $("somVolver").onclick = () => { if (actual) { guardar(true); actual = null; pintarLista(); } else cerrar(); };
    const p = document.createElement("div"); p.id = "somPrint"; document.body.appendChild(p);
    window.addEventListener("afterprint", () => { document.body.classList.remove("som-imprimiendo"); $("somPrint").innerHTML = ""; });
    window.addEventListener("resize", () => { if ($("somOverlay").style.display !== "none") escalar(); });
  }

  function pintarLista() {
    docActivo = null;
    $("somVolver").textContent = "← Inicio";
    $("somTitulo").textContent = "Sometimientos";
    $("somSub").textContent = "Documentos para la distribuidora";
    $("somAcciones").innerHTML = puedeEditar() ? `<button type="button" class="som-btn nar" onclick="FEGSometimiento.nuevo()">+ Nuevo sometimiento</button>` : `<span class="som-chipp">Solo lectura</span>`;
    const filas = lista.slice().sort((a, b) => (b.actualizado || "").localeCompare(a.actualizado || "")).map(s => {
      const e = resumenEquipos(s);
      return `<div class="som-fila" onclick="FEGSometimiento.abrirS('${esc(s.id)}')">
        <div style="flex:1;min-width:0"><b>${esc(s.cliente.nombre || "Sin nombre")}</b>
        <small>${s.programa === "neta" ? "Medición neta (Anexo A)" : "Inyección cero (Anexo B)"}${s.sum.contrato ? " • Contrato " + esc(s.sum.contrato) : ""}${e.kwp ? " • " + nt(e.kwp) + " kWp" : ""} • ${new Date(s.actualizado).toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" })}</small></div>
        ${puedeEditar() ? `<button type="button" class="som-x" style="position:static" title="Eliminar" onclick="event.stopPropagation();FEGSometimiento.borrar('${esc(s.id)}')">×</button>` : ""}</div>`;
    }).join("");
    $("somBody").innerHTML = `<div class="som-main"><div class="som-lista-s">
      <h2 style="font-family:Montserrat,Inter,sans-serif;font-weight:800;font-size:20px;margin:6px 0 4px">Sometimientos</h2>
      <p style="font-size:12.5px;color:#777;margin:0 0 14px">Cada sometimiento guarda los datos del cliente, los equipos y los archivos. Los documentos se llenan solos con lo que vayas poniendo.</p>
      ${filas || `<div class="som-fila" style="cursor:default;color:#888">Todavía no hay sometimientos. Toca “+ Nuevo sometimiento”.</div>`}
    </div></div>`;
  }

  // Campos del panel lateral
  const campo = (ruta, etiqueta, val, extra) => `<label class="som-lab">${etiqueta}<input class="som-in ${val ? "" : "vacio"}" value="${esc(val)}" ${extra || ""} onchange="FEGSometimiento.set('${ruta}', this.value)"></label>`;
  const seg = (ruta, val, opciones) => `<div class="som-seg">${opciones.map(([v, t]) => `<button type="button" class="${val === v ? "on" : ""}" onclick="FEGSometimiento.set('${ruta}', '${v}')">${t}</button>`).join("")}</div>`;
  function htmlArchivos(k, titulo, acepta, nota) {
    const l = actual.archivos[k] || [];
    return `<div style="margin-bottom:10px"><div class="som-lab" style="margin-bottom:4px">${titulo}</div>
      ${l.map((a, i) => `<div class="som-arch"><span>${esc(a.nombre)}${a.paginas > 1 ? ` (${a.paginas} pág.)` : ""}</span>
        ${k === "cedula" || k === "factura" ? `<button type="button" class="som-btn cla" style="padding:3px 8px;font-size:11px" title="Vuelve a leer el archivo y reemplaza los datos" onclick="FEGSometimiento.leer('${k}', ${i})">Leer</button>` : ""}
        ${k === "planos" ? `<label style="font-size:11px;display:flex;align-items:center;gap:4px"><input type="checkbox" ${a.firma !== false ? "checked" : ""} onchange="FEGSometimiento.firma(${i}, this.checked)">firma</label>` : ""}
        <button type="button" class="som-x" style="position:static" onclick="FEGSometimiento.quitarArchivo('${k}', ${i})">×</button></div>`).join("")}
      <label class="som-btn cla" style="width:100%;margin-top:4px">+ Subir ${acepta === "image/*" ? "imagen" : "imagen o PDF"}<input type="file" accept="${acepta}" multiple style="display:none" onchange="FEGSometimiento.subir('${k}', this)"></label>
      ${nota ? `<p class="som-nota">${nota}</p>` : ""}</div>`;
  }
  // Botón para subir un datasheet que no está en el sistema (queda guardado para los próximos sometimientos)
  function itemDeFila(cual, i) {
    const e = actual.eq;
    if (cual === "panel") return { marca: e.paneles.marca, modelo: e.paneles.modelo, nombre: `${e.paneles.marca} ${e.paneles.w}W`, tipo: "panel" };
    if (cual === "inversor") { const r = e.inversores[i], inv = r && invDe(r); return { marca: inv ? marcaDe(inv.name) : "", modelo: r ? r.modelo : "", nombre: inv ? inv.name : "inversor", tipo: "inversor" }; }
    const r = e.baterias[i], bat = r && batDe(r);
    return { marca: bat ? marcaDe(bat.name) : "", modelo: (r && r.modelo) || (bat && bat.propio ? bat.name : ""), nombre: bat ? bat.name : "batería", tipo: "bateria" };
  }
  function btnFicha(cual, i) {
    const it = itemDeFila(cual, i);
    const d = it.modelo ? bibliotecaCompleta().find(x => x.tipo === "ficha" && corresponde(x, it)) : null;
    return `<div style="display:flex;align-items:center;gap:8px;margin-top:2px">
      <span style="flex:1;min-width:0;font-size:11px;color:${d ? "#3f7d43" : "#999"};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d ? "✓ Datasheet propio cargado" : "Datasheet: el del sistema"}</span>
      <label class="som-btn cla" style="padding:5px 10px;font-size:11.5px">${d ? "Cambiar" : "+ Subir datasheet"}<input type="file" accept="image/*,application/pdf" style="display:none" onchange="FEGSometimiento.subirFicha('${cual}', ${i}, this)"></label></div>`;
  }
  function htmlLado() {
    const s = actual, c = s.cliente, su = s.sum, e = s.eq;
    const optsInv = typeof buildGroupedOptions === "function" ? buildGroupedOptions(settings.inverters, "") : "";
    const optsBat = typeof buildGroupedOptions === "function" ? buildGroupedOptions(settings.batteries, "") : "";
    const cot = typeof readQuotes === "function" ? readQuotes() : [];
    const certs = bibliotecaCompleta();
    const TIPO_TXT = { cne: "CNE", distribuidor: "Distribuidor", garantiaFab: "Garantía", ficha: "Datasheet" };
    return `
    <details class="som-sec" open><summary>1. Tipo de sometimiento</summary><div class="in">
      ${seg("programa", s.programa, [["cero", "Inyección cero (Anexo B)"], ["neta", "Medición neta (Anexo A)"]])}
      <div class="som-2">
        <label class="som-lab">Tipo de cliente<select class="som-in" onchange="FEGSometimiento.set('tipoCliente', this.value)">${TIPOS_CLIENTE.map(([v, t]) => `<option value="${v}" ${s.tipoCliente === v ? "selected" : ""}>${t}</option>`).join("")}</select></label>
        <label class="som-lab">Es<select class="som-in" onchange="FEGSometimiento.set('persona', this.value)"><option value="fisica" ${s.persona !== "empresa" ? "selected" : ""}>Persona</option><option value="empresa" ${s.persona === "empresa" ? "selected" : ""}>Empresa</option></select></label>
      </div>
      <label class="som-lab">Fecha de la solicitud<input type="date" class="som-in" value="${esc(s.fecha)}" onchange="FEGSometimiento.set('fecha', this.value)"></label>
    </div></details>

    <details class="som-sec" open><summary>2. Rellenar automáticamente</summary><div class="in">
      <label class="som-lab">Pega aquí lo que te mandó el cliente (WhatsApp, correo…)
        <textarea id="somPegar" class="som-in" rows="4" placeholder="Ej.: Juan Pérez, cédula 031-1234567-8, contrato 2225684, medidor 46408933, juan@gmail.com, 809-555-1234"></textarea></label>
      <button type="button" class="som-btn osc" style="width:100%" onclick="FEGSometimiento.detectar()">Detectar y llenar datos</button>
      <p class="som-nota">También puedes subir la cédula y la factura en “Archivos”: se leen solas para sacar el nombre, la cédula, el contrato y el medidor. Los campos que ya llenaste no se cambian.</p>
    </div></details>

    <details class="som-sec" open><summary>3. Datos del ${s.persona === "empresa" ? "cliente (empresa)" : "cliente"}</summary><div class="in">
      ${campo("cliente.nombre", s.persona === "empresa" ? "Nombre de la empresa" : "Nombre completo", c.nombre)}
      <div class="som-2">${campo("cliente.cedula", s.persona === "empresa" ? "RNC" : "Cédula", c.cedula)}${campo("cliente.celular", "Celular", c.celular)}</div>
      <div class="som-2">${campo("cliente.telefono", "Teléfono", c.telefono)}${campo("cliente.email", "Correo", c.email)}</div>
      ${campo("cliente.calle", "Calle y número", c.calle)}
      <div class="som-2">${campo("cliente.sector", "Sector", c.sector)}${campo("cliente.municipio", "Municipio", c.municipio)}</div>
      ${campo("cliente.provincia", "Provincia", c.provincia, 'list="somProvincias"')}
      <datalist id="somProvincias">${PROVINCIAS.map(p => `<option value="${p}">`).join("")}</datalist>
    </div></details>

    <details class="som-sec" open><summary>4. Suministro eléctrico</summary><div class="in">
      <div class="som-2">${campo("sum.contrato", "Contrato (NIC)", su.contrato)}${campo("sum.medidor", "Número de medidor", su.medidor)}</div>
      ${campo("sum.tarifa", "Tarifa", su.tarifa, 'list="somTarifas" placeholder="BTS-1"')}
      <datalist id="somTarifas"><option value="BTS-1"><option value="BTS-2"><option value="BTD"><option value="BTH"><option value="MTD-1"><option value="MTD-2"><option value="MTH"></datalist>
      ${campo("sum.direccion", "Dirección del sistema (si es distinta a la del cliente)", su.direccion)}
      ${s.programa === "cero" ? `<div class="som-lab">¿Se usará para compensar la demanda?</div>${seg("compensa", s.compensa, [["todo", "Todo"], ["parte", "Una parte"]])}
        ${s.compensa === "parte" ? campo("compensaPct", "Porcentaje aproximado", s.compensaPct) : ""}
        <div class="som-lab">¿El sistema ya está instalado?</div>${seg("instalado", s.instalado ? "si" : "no", [["no", "No"], ["si", "Sí"]])}` : ""}
    </div></details>

    <details class="som-sec" open><summary>5. Equipos</summary><div class="in">
      ${cot.length ? `<label class="som-lab">Traer los equipos de una cotización<select class="som-in" onchange="FEGSometimiento.desdeCotizacion(this.value); this.value=''"><option value="">Elegir cotización…</option>
        ${cot.flatMap(q => q.options.map(o => `<option value="${esc(q.id)}|${esc(o.id)}">${esc(q.clientName || "Sin nombre")} — ${esc(o.name)}</option>`)).join("")}</select></label>` : ""}
      <div class="som-eqrow"><div class="som-lab" style="font-weight:700;color:#2b2b2b">Paneles</div>
        <div class="som-2">${campo("eq.paneles.qty", "Cantidad", e.paneles.qty || "", 'type="number" min="0"')}${campo("eq.paneles.w", "Vatios (W)", e.paneles.w, 'type="number"')}</div>
        <div class="som-2">${campo("eq.paneles.marca", "Marca", e.paneles.marca, 'list="somMarcasPanel"')}${campo("eq.paneles.modelo", "Modelo exacto", e.paneles.modelo, 'placeholder="JKM635N-78HL4-BDV"')}</div>
        <datalist id="somMarcasPanel"><option value="JINKO Solar"><option value="JA Solar"></datalist>
        ${btnFicha("panel", 0)}</div>
      ${e.inversores.map((r, i) => `<div class="som-eqrow"><button type="button" class="som-x" onclick="FEGSometimiento.quitarEq('inversores', ${i})">×</button>
        <div class="som-lab" style="font-weight:700;color:#2b2b2b">Inversor ${e.inversores.length > 1 ? i + 1 : ""}</div>
        <label class="som-lab">Equipo<select class="som-in" onchange="FEGSometimiento.set('eq.inversores.${i}.invId', this.value)"><option value="">Elegir…</option>${optsInv.replace(`value="${r.invId}"`, `value="${r.invId}" selected`)}</select></label>
        <div class="som-2">${campo(`eq.inversores.${i}.qty`, "Cantidad", r.qty, 'type="number" min="1"')}${campo(`eq.inversores.${i}.modelo`, "Modelo exacto", r.modelo, 'placeholder="SUN-12K-SG05LP2-US-SM3"')}</div>
        <div class="som-2"><label class="som-lab">Conexión<select class="som-in" onchange="FEGSometimiento.set('eq.inversores.${i}.fase', this.value)"><option value="mono" ${r.fase !== "tri" ? "selected" : ""}>Monofásica</option><option value="tri" ${r.fase === "tri" ? "selected" : ""}>Trifásica</option></select></label>
        ${campo(`eq.inversores.${i}.corriente`, "Corriente nominal (A)", r.corriente || "", 'placeholder="automática"')}</div>
        ${btnFicha("inversor", i)}</div>`).join("")}
      <button type="button" class="som-btn cla" style="width:100%;margin-bottom:8px" onclick="FEGSometimiento.agregarEq('inversores')">+ Agregar inversor</button>
      ${e.baterias.map((r, i) => `<div class="som-eqrow"><button type="button" class="som-x" onclick="FEGSometimiento.quitarEq('baterias', ${i})">×</button>
        <div class="som-lab" style="font-weight:700;color:#2b2b2b">Batería ${e.baterias.length > 1 ? i + 1 : ""}</div>
        <label class="som-lab">Equipo<select class="som-in" onchange="FEGSometimiento.set('eq.baterias.${i}.batId', this.value)"><option value="">Elegir…</option>${optsBat.replace(`value="${r.batId}"`, `value="${r.batId}" selected`)}<option value="otra" ${r.batId === "otra" ? "selected" : ""}>Otra (no está en el sistema)</option></select></label>
        <div class="som-2">${campo(`eq.baterias.${i}.qty`, "Cantidad", r.qty, 'type="number" min="1"')}${campo(`eq.baterias.${i}.nombre`, r.batId === "otra" ? "Nombre de la batería" : "Nombre en los documentos", r.nombre || "", `placeholder="${esc(r.batId && r.batId !== "otra" && typeof getBattery === "function" && getBattery(r.batId) ? getBattery(r.batId).name : "Soluna de 10k")}"`)}</div>
        <p class="som-nota" style="margin-top:-4px">No necesita modelo. Lo que escribas aquí es lo que sale en las cartas.</p>
        ${btnFicha("bateria", i)}</div>`).join("")}
      <button type="button" class="som-btn cla" style="width:100%" onclick="FEGSometimiento.agregarEq('baterias')">+ Agregar batería</button>
    </div></details>

    <details class="som-sec"><summary>6. Descripción del proyecto (opcional)</summary><div class="in">
      <label class="som-lab">Explica el proyecto si necesita más detalle. Sale en la carta de descripción, debajo de los equipos.
        <textarea class="som-in" rows="6" placeholder="Ej.:&#10;72 paneles que se distribuyen en:&#10;→ 52 paneles para autoconsumo y almacenamiento&#10;→ 20 paneles para inyección a red" onchange="FEGSometimiento.set('descripcion', this.value)">${esc(s.descripcion)}</textarea></label>
      <p class="som-nota">Las líneas que empiecen con → o con guion salen como lista. Además, puedes tocar el texto de cualquier carta para cambiarlo.</p>
    </div></details>

    <details class="som-sec" open><summary>7. Archivos del cliente</summary><div class="in">
      ${htmlArchivos("cedula", s.persona === "empresa" ? "Cédula del representante (frente y reverso)" : "Cédula (frente y reverso)", "image/*,application/pdf", "Al subirla se lee sola para sacar el nombre y el número.")}
      ${htmlArchivos("factura", "Factura de Edenorte", "image/*,application/pdf", "Se lee sola para sacar el contrato, el medidor y la tarifa.")}
      ${htmlArchivos("planos", "Diagrama unifilar y de situación (planos)", "image/*,application/pdf", "La firma del ingeniero se pone sola en la esquina del cajetín; arrástrala en la vista si hay que moverla.")}
      ${htmlArchivos("fotos", s.programa === "neta" ? "Imágenes de la ubicación" : "Fachada donde se hará la instalación", "image/*,application/pdf")}
      ${s.persona === "empresa" ? htmlArchivos("empresa", "Registro mercantil y acta de la última asamblea", "image/*,application/pdf") : ""}
      ${htmlArchivos("otros", "Otros documentos", "image/*,application/pdf")}
    </div></details>

    <details class="som-sec"><summary>8. Documentos de Freedom (para todos)</summary><div class="in">
      <div class="som-lab" style="margin-bottom:4px">Certificación del CODIA del ingeniero</div>
      ${biblio().codia ? `<div class="som-arch"><span>${esc(biblio().codia.nombre)} · ${esc(new Date(biblio().codia.fecha).toLocaleDateString("es-DO"))}</span></div>` : `<p class="som-nota">Sin subir: mientras tanto sale el carnet del CODIA.</p>`}
      <label class="som-btn cla" style="width:100%;margin:4px 0 12px">${biblio().codia ? "Reemplazar por la nueva" : "+ Subir certificación"}<input type="file" accept="image/*,application/pdf" style="display:none" onchange="FEGSometimiento.subirCodia(this)"></label>
      <div class="som-lab" style="margin-bottom:4px">Certificados de la CNE, cartas de distribuidores y garantías de fábrica</div>
      <p class="som-nota">Cada documento sale solo cuando el equipo coincide: si escribiste el modelo exacto, se busca el modelo; si no, la marca. Las garantías de fábrica van por marca.</p>
      ${certs.map(x => `<div class="som-eqrow"><button type="button" class="som-x" title="Quitar de la biblioteca" onclick="FEGSometimiento.borrarCert('${esc(x.id)}')">×</button>
        <div style="font-size:12px;font-weight:700;margin-bottom:6px;padding-right:16px">${esc(x.nombre)} <span class="som-chipp">${TIPO_TXT[x.tipo] || x.tipo}</span></div>
        <label class="som-lab">Modelos y marcas que cubre (separados por coma)<textarea class="som-in" rows="2" onchange="FEGSometimiento.claves('${esc(x.id)}', this.value)">${esc(x.claves)}</textarea></label></div>`).join("")}
      <div class="som-2">
        <label class="som-btn cla">+ Certificado CNE<input type="file" accept="image/*,application/pdf" style="display:none" onchange="FEGSometimiento.subirCert('cne', this)"></label>
        <label class="som-btn cla">+ Carta distribuidor<input type="file" accept="image/*,application/pdf" style="display:none" onchange="FEGSometimiento.subirCert('distribuidor', this)"></label>
      </div>
      <div class="som-2" style="margin-top:8px">
        <label class="som-btn cla">+ Garantía fabricante<input type="file" accept="image/*,application/pdf" style="display:none" onchange="FEGSometimiento.subirCert('garantiaFab', this)"></label>
        <label class="som-btn cla">+ Datasheet<input type="file" accept="image/*,application/pdf" style="display:none" onchange="FEGSometimiento.subirCert('ficha', this)"></label>
      </div>
    </div></details>`;
  }

  async function pintarEditor(mantenerScroll) {
    const s = actual;
    $("somVolver").textContent = "← Sometimientos";
    $("somTitulo").textContent = "Sometimiento • " + (s.cliente.nombre || "Sin nombre");
    $("somSub").textContent = s.programa === "neta" ? "Programa de medición neta (inyección a red)" : "Programa de medición neta — inyección cero";
    $("somAcciones").innerHTML = `<button type="button" class="som-btn nar" onclick="FEGSometimiento.imprimirSel()">Imprimir seleccionados</button>`;
    const yL = $("somLado") ? $("somLado").scrollTop : 0;
    const abiertos = [...document.querySelectorAll("#somLado details")].map(d => d.open);
    if (!$("somLado")) $("somBody").innerHTML = `<aside class="som-lado" id="somLado"></aside><div class="som-main" id="somMain"></div>`;
    $("somLado").innerHTML = (puedeEditar() ? "" : `<div class="som-aviso" style="margin-bottom:10px">Tu usuario puede ver e imprimir este sometimiento, pero no cambiarlo.</div>`) + htmlLado();
    if (!puedeEditar()) {
      $("somLado").querySelectorAll("input, select, textarea").forEach(el => el.disabled = true);
      $("somLado").querySelectorAll("button, label.som-btn").forEach(el => el.style.display = "none");
    }
    if (mantenerScroll && abiertos.length) document.querySelectorAll("#somLado details").forEach((d, i) => { if (abiertos[i] !== undefined) d.open = abiertos[i]; });
    $("somLado").scrollTop = yL;
    await pintarDocs();
  }

  let turno = 0;
  async function pintarDocs() {
    const t = ++turno;
    const s = actual;
    const D = documentos(s);
    if (!docActivo || !D.some(d => d.key === docActivo)) docActivo = D[0].key;
    const d = D.find(x => x.key === docActivo);
    const pags = await d.pags();
    if (t !== turno) return;
    const y = $("somMain").scrollTop;
    $("somMain").innerHTML = `
      <div class="som-docs">${D.map(x => `<div class="som-doc ${x.key === docActivo ? "on" : ""}" onclick="FEGSometimiento.ver('${x.key}')" title="${x.falta.length ? "Falta: " + esc(x.falta.join(", ")) : "Listo"}">
        <input type="checkbox" ${x.incluir ? "checked" : ""} onclick="event.stopPropagation()" onchange="FEGSometimiento.incluir('${x.key}', this.checked)">
        <span class="som-dot ${x.falta.length ? "f" : ""}"></span>${esc(x.nombre)}</div>`).join("")}</div>
      <div class="som-barra"><b style="font-size:14px">${esc(d.nombre)}</b>
        <button type="button" class="som-btn osc" onclick="FEGSometimiento.imprimir('${d.key}')">Imprimir este documento</button>
        ${d.key in { descripcion: 1, autorizacion: 1, garantia: 1 } && s.edits[d.key] ? `<button type="button" class="som-btn cla" onclick="FEGSometimiento.restaurar('${d.key}')">Volver al texto automático</button>` : ""}</div>
      ${d.falta.length ? `<div class="som-aviso">Falta: ${esc(d.falta.join(", "))}. Igual se puede imprimir; esos espacios quedan en blanco.</div>` : ""}
      ${d.key in { descripcion: 1, autorizacion: 1, garantia: 1 } ? `<p class="som-nota" style="margin-top:-4px">Toca el texto de la carta para cambiar lo que necesites.</p>` : ""}
      <div id="somPags">${pags.length ? pags.map(p => `<div class="som-wrap">${htmlPagina(p, s)}</div>`).join("") : `<div class="som-aviso">Este documento todavía no tiene páginas (sube el archivo o el certificado correspondiente).</div>`}</div>`;
    $("somMain").scrollTop = y;
    activarEdicion();
    escalar();
  }
  function htmlPagina(p, s) {
    const [W, H] = SIZES[p.size];
    let html = p.html;
    if (p.editable && s.edits[p.editable]) html = `<div class="som-carta" data-doc="${p.editable}">${s.edits[p.editable]}</div>`;
    return `<div class="som-page ${p.size}" style="width:${W}pt;height:${H}pt">${p.bg ? `<img class="bg" src="${p.bg}" alt="">` : ""}${html}</div>`;
  }
  function activarEdicion() {
    if (!puedeEditar()) return;
    document.querySelectorAll("#somPags .som-carta").forEach(el => {
      el.contentEditable = "true"; el.spellcheck = true;
      el.addEventListener("blur", () => { actual.edits[el.dataset.doc] = el.innerHTML; guardar(); });
    });
    document.querySelectorAll("#somPags .som-firma-img").forEach(img => {
      img.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        const page = img.closest(".som-page"), r = page.getBoundingClientRect();
        const sx = ev.clientX, sy = ev.clientY, x0 = img.offsetLeft, y0 = img.offsetTop;
        const escala = r.width / page.offsetWidth;
        img.setPointerCapture(ev.pointerId);
        const mover = (e2) => { img.style.left = (x0 + (e2.clientX - sx) / escala) + "px"; img.style.top = (y0 + (e2.clientY - sy) / escala) + "px"; };
        const soltar = () => {
          img.removeEventListener("pointermove", mover); img.removeEventListener("pointerup", soltar);
          const a = actual.archivos.planos.find(x => x.id === img.dataset.archivo);
          if (a) { a.firmaPos = a.firmaPos || {}; a.firmaPos[img.dataset.pag] = { x: img.offsetLeft / page.offsetWidth, y: img.offsetTop / page.offsetHeight, w: img.offsetWidth / page.offsetWidth }; guardar(); }
        };
        img.addEventListener("pointermove", mover); img.addEventListener("pointerup", soltar);
      });
    });
  }
  function escalar() {
    const cont = $("somPags"); if (!cont) return;
    const disp = cont.clientWidth - 8;
    cont.querySelectorAll(".som-wrap").forEach(w => {
      const p = w.firstElementChild; const W = p.offsetWidth, H = p.offsetHeight;
      const sc = Math.min(1, disp / W);
      w.style.width = W * sc + "px"; w.style.height = H * sc + "px";
      p.style.transform = sc < 1 ? `scale(${sc})` : "";
    });
  }

  async function imprimirDocs(keys) {
    const s = actual;
    const D = documentos(s).filter(d => keys.includes(d.key));
    let html = "";
    for (const d of D) { const pags = await d.pags(); html += pags.map(p => htmlPagina(p, s)).join(""); }
    if (!html) { showToast("No hay páginas para imprimir", "error"); return; }
    $("somPrint").innerHTML = html;
    document.querySelectorAll("#somPrint .som-carta").forEach(el => el.removeAttribute("contenteditable"));
    document.body.classList.add("som-imprimiendo");
    const t = document.title;
    document.title = `Sometimiento ${s.cliente.nombre || ""} - ${D.length === 1 ? D[0].nombre : "documentos"}`.trim();
    await Promise.all([...document.querySelectorAll("#somPrint img")].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    try { await document.fonts.ready; } catch (e) { }
    setTimeout(() => { window.print(); setTimeout(() => { document.title = t; }, 800); }, 80);
  }

  function cerrar() {
    const o = $("somOverlay"); if (o) o.style.display = "none";
    if (typeof actualizarPortada === "function") actualizarPortada();
    document.body.style.overflow = "";
    actual = null;
  }
  function setRuta(obj, ruta, v) {
    const k = ruta.split("."); let o = obj;
    for (let i = 0; i < k.length - 1; i++) o = o[k[i]];
    const ult = k[k.length - 1];
    o[ult] = (typeof o[ult] === "number" || /qty|^w$/.test(ult)) && v !== "" && !isNaN(v) ? Number(v) : v;
  }

  async function subirArchivos(k, files) {
    const A = arch(); if (!A) { showToast("Falta el generador de propuestas", "error"); return; }
    const nuevos = [];
    let textoDigital = "";
    for (const f of files) {
      const imgs = await A.aImagenes(f, k === "planos" ? 2200 : (k === "cedula" ? 2000 : 1600), 12);
      if ((k === "cedula" || k === "factura") && /pdf$/i.test(f.type || f.name)) textoDigital += "\n" + await textoPDF(f);
      const id = `somf_${actual.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      await A.put(id, { tipo: k, nombre: f.name, paginas: imgs });
      const a = { id, nombre: f.name, paginas: imgs.length };
      actual.archivos[k].push(a); nuevos.push({ a, imgs });
    }
    guardar(true);
    await pintarEditor(true);
    // Lectura automática de la cédula y de la factura
    if (k === "cedula" || k === "factura") {
      await leerDocumento(k, nuevos.flatMap(x => x.imgs), textoDigital, false);
    }
  }
  // Lee la cédula o la factura: primero el texto del PDF (si es digital); si no, la imagen
  async function leerDocumento(k, imgs, textoDigital, sobrescribir) {
    const origen = k === "cedula" ? "Cédula" : "Factura";
    showToast(k === "cedula" ? "Leyendo la cédula…" : "Leyendo la factura…", "info");
    try {
      const analizar = (t) => k === "cedula" ? analizarCedula(t) : analizarFactura(t);
      let d = textoDigital && textoDigital.replace(/\s/g, "").length > 60 ? analizar(textoDigital) : {};
      const util = (x) => Object.keys(x).length >= (k === "cedula" ? 2 : 3);
      if (!util(d) && imgs.length) d = Object.assign(analizar(await ocr(imgs.slice(0, 3))), d);
      if (aplicar(d, origen, sobrescribir).length) await pintarEditor(true);
    } catch (e) { showToast("No se pudo leer el archivo automáticamente; escribe los datos a mano.", "error"); }
  }

  window.FEGSometimiento = {
    async abrir() {
      if (!window.FEGPropuesta) { showToast("Falta la carpeta “propuesta”", "error"); return; }
      crear();
      await buscarRuta();
      const o = $("somOverlay");
      o.style.display = "flex"; o.classList.remove("abre"); void o.offsetWidth; o.classList.add("abre");
      document.body.style.overflow = "hidden";
      if (window.FEG_PUEDE && !window.FEG_PUEDE.verSometimientos()) return;
      lista = leerLocal(); actual = null; pintarLista();
      await Promise.all([sincronizar(), sincronizarBiblio()]); if (!actual) pintarLista();
    },
    cerrar,
    nuevo() { if (!puedeEditar()) return; actual = nuevo(); docActivo = null; $("somBody").innerHTML = ""; guardar(true); pintarEditor(); },
    abrirS(id) { actual = normalizar(JSON.parse(JSON.stringify(lista.find(s => s.id === id)))); docActivo = null; $("somBody").innerHTML = ""; pintarEditor(); },
    borrar(id) {
      if (!puedeEditar()) return;
      const s = lista.find(x => x.id === id);
      if (!s || !confirm(`¿Eliminar el sometimiento de ${s.cliente.nombre || "este cliente"}? Se borran también sus archivos.`)) return;
      Object.values(s.archivos).flat().forEach(a => arch() && arch().del(a.id));
      lista = lista.filter(x => x.id !== id); escribirLocal(); borrarNube(id); pintarLista();
    },
    set(ruta, v) {
      if (ruta === "instalado") v = v === "si";
      setRuta(actual, ruta, typeof v === "string" ? v.trim() : v);
      if (/^cliente\.nombre$/.test(ruta)) actual.cliente.nombre = actual.cliente.nombre.toUpperCase();
      guardar(); pintarEditor(true);
    },
    agregarEq(k) {
      if (k === "inversores") actual.eq.inversores.push({ invId: "", qty: 1, modelo: "", fase: "mono", corriente: "" });
      else actual.eq.baterias.push({ batId: "", qty: 1, modelo: "" });
      guardar(); pintarEditor(true);
    },
    quitarEq(k, i) { actual.eq[k].splice(i, 1); guardar(); pintarEditor(true); },
    desdeCotizacion(v) {
      if (!v) return;
      const [qid, oid] = v.split("|");
      const q = readQuotes().find(x => x.id === qid); const o = q && q.options.find(x => x.id === oid);
      if (!o) return;
      const viejos = actual.eq;
      const modeloInv = (id) => (viejos.inversores.find(r => r.invId === id) || {}).modelo || "";
      const modeloBat = (id) => (viejos.baterias.find(r => r.batId === id) || {}).modelo || "";
      actual.eq = {
        paneles: { qty: parseInt(o.panelQty, 10) || 0, marca: o.panelMarca || "JINKO Solar", w: Number(o.panelW) || 650, modelo: viejos.paneles.modelo },
        inversores: (o.inverterRows || []).filter(r => r.invId && r.qty > 0).map(r => ({ invId: r.invId, qty: Number(r.qty), modelo: modeloInv(r.invId), fase: "mono", corriente: "" })),
        baterias: o.batteryId && o.batteryId !== "none" && Number(o.batteryQty) > 0 ? [{ batId: o.batteryId, qty: Number(o.batteryQty), modelo: modeloBat(o.batteryId) }] : []
      };
      if (o.modalidad === "ongrid") actual.programa = "neta"; else if (o.modalidad === "hibrido") actual.programa = "cero";
      if (!actual.cliente.nombre && q.clientName) actual.cliente.nombre = q.clientName.toUpperCase();
      const dq = q.datos || {};
      if (!actual.sum.contrato && dq.contrato) actual.sum.contrato = dq.contrato;
      guardar(); pintarEditor(true);
      showToast("Equipos traídos de la cotización. Escribe el modelo exacto de cada uno.", "success");
    },
    detectar() {
      const t = $("somPegar").value;
      if (!t.trim()) { showToast("Pega primero la información del cliente", "error"); return; }
      aplicar(analizarTexto(t), "Texto", true); pintarEditor(true);
    },
    subir(k, input) {
      const files = [...(input.files || [])]; input.value = "";
      if (!files.length) return;
      showToast(files.length > 1 ? `Subiendo ${files.length} archivos…` : "Subiendo el archivo…", "info");
      subirArchivos(k, files).catch(e => showToast(String(e.message || e), "error"));
    },
    quitarArchivo(k, i) {
      const a = actual.archivos[k][i]; if (!a) return;
      actual.archivos[k].splice(i, 1); arch() && arch().del(a.id); guardar(); pintarEditor(true);
    },
    async leer(k, i) {
      const a = actual.archivos[k][i]; if (!a) return;
      const data = await arch().get(a.id);
      if (!data || !data.paginas) { showToast("No encuentro el archivo", "error"); return; }
      await leerDocumento(k, data.paginas, "", true);
    },
    firma(i, on) { const a = actual.archivos.planos[i]; if (a) { a.firma = !!on; guardar(); pintarEditor(true); } },
    ver(k) { docActivo = k; pintarDocs(); $("somMain").scrollTop = 0; },
    incluir(k, on) { actual.incluir[k] = !!on; guardar(); },
    restaurar(k) { delete actual.edits[k]; guardar(); pintarDocs(); },
    imprimir(k) { imprimirDocs([k]); },
    imprimirSel() {
      const keys = documentos(actual).filter(d => d.incluir).map(d => d.key);
      if (!keys.length) { showToast("Marca al menos un documento", "error"); return; }
      imprimirDocs(keys);
    },
    async subirCodia(input) {
      const f = input.files && input.files[0]; input.value = ""; if (!f) return;
      showToast("Subiendo la certificación…", "info");
      const imgs = await arch().aImagenes(f, 1700, 4);
      const id = String(Date.now()), viejo = biblio().codia;
      await arch().put("codia_" + id, { tipo: "codia", nombre: f.name, paginas: imgs });
      biblio().codia = { id, nombre: f.name, fecha: new Date().toISOString(), paginas: imgs.length };
      guardarBiblio();
      if (viejo && viejo.id) arch().del("codia_" + viejo.id);   // se elimina la anterior
      showToast("Certificación del CODIA actualizada", "success");
      pintarEditor(true);
    },
    async subirFicha(cual, i, input) {
      const f = input.files && input.files[0]; input.value = ""; if (!f) return;
      const it = itemDeFila(cual, i);
      if (!it.modelo) { showToast(cual === "bateria" ? "Escribe primero el nombre de la batería" : "Escribe primero el modelo exacto del equipo", "error"); return; }
      showToast("Subiendo el datasheet…", "info");
      try {
        const imgs = await arch().aImagenes(f, 1700, 8);
        const id = String(Date.now());
        await arch().put("cert_" + id, { tipo: "ficha", nombre: f.name, paginas: imgs });
        // Si ya había uno propio para este equipo, se reemplaza
        const viejo = biblio().certificados.find(x => x.tipo === "ficha" && corresponde(x, it));
        if (viejo) { biblio().certificados = biblio().certificados.filter(x => x !== viejo); arch().del("cert_" + viejo.id); }
        biblio().certificados.push({ id, tipo: "ficha", nombre: "Datasheet " + (it.modelo || it.nombre), claves: it.modelo, paginas: imgs.length });
        guardarBiblio();
        showToast("Datasheet guardado. Saldrá en las fichas técnicas de este y de los próximos sometimientos con este equipo.", "success");
        pintarEditor(true);
      } catch (e) { showToast("No se pudo subir: " + (e.message || e), "error"); }
    },
    async subirCert(tipo, input) {
      const f = input.files && input.files[0]; input.value = ""; if (!f) return;
      showToast("Subiendo el documento…", "info");
      const imgs = await arch().aImagenes(f, 1700, 6);
      const id = String(Date.now());
      await arch().put("cert_" + id, { tipo, nombre: f.name, paginas: imgs });
      const guess = f.name.toLowerCase().match(/jinko|ja ?solar|deye|solis|soluna|pytes|must|growatt|huawei|longi/g) || [];
      biblio().certificados.push({ id, tipo, nombre: f.name.replace(/\.[^.]+$/, ""), claves: [...new Set(guess)].join(", "), paginas: imgs.length });
      guardarBiblio();
      showToast("Documento agregado. Revisa con qué equipos sale.", "success");
      pintarEditor(true);
    },
    claves(id, v) {
      const c = biblio().certificados.find(x => x.id === id);
      if (c) c.claves = v; else { biblio().biblioClaves = Object.assign({}, biblio().biblioClaves, { [id]: v }); }
      guardarBiblio(); pintarDocs();
    },
    borrarCert(id) {
      const c = bibliotecaCompleta().find(x => x.id === id);
      if (!c || !confirm(`¿Quitar “${c.nombre}” de la biblioteca?`)) return;
      if (c.fijo) biblio().biblioOcultos = [...new Set([...(biblio().biblioOcultos || []), id])];
      else { biblio().certificados = biblio().certificados.filter(x => x.id !== id); arch().del("cert_" + id); }
      guardarBiblio(); pintarEditor(true);
    },
    // Para pruebas
    _analizar: { texto: analizarTexto, cedula: analizarCedula, factura: analizarFactura, pdf: textoPDF }
  };
})();
