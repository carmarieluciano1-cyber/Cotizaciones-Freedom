/* =====================================================================
   Freedom Energy Group — Generador de propuestas
   Arma la propuesta igual a la plantilla de Canva (fondos + textos encima),
   con los datos del cotizador. Todo texto se puede editar tocándolo.
   Necesita la carpeta "propuesta/" junto a index.html.
   ===================================================================== */
(function () {
  "use strict";
  const BASE = "propuesta/";
  const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";

  // ---------------------------------------------------------------------
  // Biblioteca de fichas técnicas (las de la plantilla). "completa" = la
  // imagen ya trae el encabezado naranja; si no, se le pone el encabezado.
  // siempre: "paneles" (si hay paneles) | "todos" | "" (según equipos)
  // ---------------------------------------------------------------------
  // Paneles: sale UNA sola ficha, la de la marca del panel y cuyo rango de vatios incluye los del panel.
  const FICHAS_VER = 3;
  const FICHAS_DEF = [
    { id: "jinko-66hl4m", nombre: "Panel JINKO Tiger Neo 66HL4M 625-650W", cat: 1, paginas: 2, completa: true, siempre: "panel", marca: "JINKO Solar", wMin: 640, wMax: 650, equipos: [] },
    { id: "jinko-66ql6", nombre: "Panel JINKO JKM635-670N-66QL6", cat: 1, paginas: 2, completa: false, siempre: "panel", marca: "JINKO Solar", wMin: 635, wMax: 670, equipos: [] },
    { id: "jinko-78hl4", nombre: "Panel JINKO JKM615-635N-78HL4", cat: 1, paginas: 2, completa: false, siempre: "panel", marca: "JINKO Solar", wMin: 615, wMax: 635, equipos: [] },
    { id: "jinko-72hl4", nombre: "Panel JINKO JKM550-570N-72HL4", cat: 1, paginas: 2, completa: false, siempre: "panel", marca: "JINKO Solar", wMin: 550, wMax: 570, equipos: [] },
    { id: "jinko-66hl5", nombre: "Panel JINKO JKM710-735N-66HL5", cat: 1, paginas: 2, completa: false, siempre: "panel", marca: "JINKO Solar", wMin: 710, wMax: 735, equipos: [] },
    { id: "ja620", nombre: "Panel JA Solar JAM66D45 620W", cat: 1, paginas: 2, completa: true, siempre: "panel", marca: "JA Solar", wMin: 600, wMax: 630, equipos: [] },
    { id: "ja465", nombre: "Panel JA Solar JAM54D41 465W", cat: 1, paginas: 2, completa: false, siempre: "panel", marca: "JA Solar", wMin: 440, wMax: 470, equipos: [] },
    { id: "deye-5-12k-sg05lp2-us", nombre: "Inversor Deye SUN-(5-12)K-SG05LP2-US", cat: 2, paginas: 1, completa: true, siempre: "", equipos: ["inv_deye6", "inv_deye8", "inv_deye10", "inv_deye12"] },
    { id: "deye-sg02lp1", nombre: "Inversor Deye SUN-(8-12)K-SG02LP1 (EU)", cat: 2, paginas: 1, completa: true, siempre: "", equipos: [] },
    { id: "deye-sun76-12k-sg02lp1-ds", nombre: "Inversor Deye SUN-(7.6-12)K-SG02LP1 (EU)", cat: 2, paginas: 2, completa: false, siempre: "", equipos: [] },
    { id: "deye-sun3-12k-sg05lp3", nombre: "Inversor Deye SUN-(3-12)K-SG05LP3 (trifásico)", cat: 2, paginas: 2, completa: false, siempre: "", equipos: [] },
    { id: "ion-hibrido-5-8k", nombre: "Inversor ION híbrido 5K / 8K", cat: 2, paginas: 2, completa: false, siempre: "", equipos: ["inv_ion5", "inv_ion8"] },
    { id: "ion-lv-us-12k", nombre: "Inversor ION LV-US 12K", cat: 2, paginas: 2, completa: false, siempre: "", equipos: ["inv_ion12"] },
    { id: "ion-lv-us-13-16k", nombre: "Inversor ION LV-US 13K-16K", cat: 2, paginas: 2, completa: false, siempre: "", equipos: ["inv_ion16"] },
    { id: "solis-s6-gr1p25-6k", nombre: "Inversor Solis S6-GR1P(2.5-6)K", cat: 2, paginas: 2, completa: false, siempre: "", equipos: ["inv_sol3", "inv_sol4", "inv_sol5"] },
    { id: "solis-s5-gr1p7-10k", nombre: "Inversor Solis S5-GR1P(7-10)K", cat: 2, paginas: 2, completa: false, siempre: "", equipos: ["inv_sol7", "inv_sol8", "inv_sol9", "inv_sol10"] },
    { id: "solis-s5-gc25-36k", nombre: "Inversor Solis S5-GC(25-36)K", cat: 2, paginas: 2, completa: false, siempre: "", equipos: ["inv_sol30"] },
    { id: "solis-s5-gc50-60k", nombre: "Inversor Solis S5-GC(50-60)K", cat: 2, paginas: 2, completa: false, siempre: "", equipos: ["inv_sol60a", "inv_sol60b"] },
    { id: "pytes-v16", nombre: "Batería PYTES V16 (16 kWh, pared)", cat: 3, paginas: 2, completa: true, siempre: "", equipos: ["bat_py16"] },
    { id: "pytes-v10", nombre: "Batería PYTES V10 (10 kWh, pared)", cat: 3, paginas: 2, completa: false, siempre: "", equipos: ["bat_py10"] },
    { id: "pytes-v5", nombre: "Batería PYTES V5 (5 kWh, rack)", cat: 3, paginas: 2, completa: false, siempre: "", equipos: ["bat_py5"] },
    { id: "soluna10", nombre: "Batería Soluna 10 kWh", cat: 3, paginas: 2, completa: true, siempre: "", equipos: [] },
    { id: "ion-bateria", nombre: "Batería ION de pared 5 kWh", cat: 3, paginas: 2, completa: true, siempre: "", equipos: ["bat_ion_p5"] },
    { id: "estructura", nombre: "Estructura de montaje", cat: 4, paginas: 1, completa: true, siempre: "paneles", equipos: [] },
    { id: "cable", nombre: "Cable solar", cat: 5, paginas: 1, completa: true, siempre: "todos", equipos: [] }
  ];
  const MARCAS_PANEL = ["JINKO Solar", "JA Solar"];
  const GALERIA_DEF = [
    { id: "proyecto-1", nombre: "Proyecto 1 (plantilla)" },
    { id: "proyecto-2", nombre: "Proyecto 2 (plantilla)" }
  ];
  const CATS = { 1: "Panel", 2: "Inversor", 3: "Batería", 4: "Estructura", 5: "Cable", 6: "Otro" };

  let TPL = null;           // window.PLANTILLAS
  let estado = null;        // { propId, optId }
  let ultimoCtx = null;
  let bloqueActivo = null;

  // ---------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  // Redondeo como en Excel: 5.715 → 5.72 (evita el error de decimales de la computadora)
  const red = (v, d) => { const x = Number(Number(v || 0).toPrecision(12)); const f = Math.pow(10, d); return Math.sign(x) * Math.round(Math.abs(x) * f + 1e-9) / f; };
  const fx = (v, d) => red(v, d).toFixed(d);
  const n2 = (v) => red(v, 2).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const nt = (v) => red(v, 2).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const usd = (v) => "US$" + n2(v);
  const rd = (v) => "RD$" + n2(v);
  const hoyTexto = () => { const d = new Date(); return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; };
  function cargarScript(src) {
    return new Promise((res, rej) => {
      if ([...document.scripts].some(s => s.src && s.src.endsWith(src))) return res();
      const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("No se pudo cargar " + src));
      document.head.appendChild(s);
    });
  }
  async function cargarPlantillas() {
    if (TPL) return TPL;
    if (!window.PLANTILLAS) await cargarScript(BASE + "plantillas.js");
    TPL = window.PLANTILLAS;
    return TPL;
  }

  // ---------------------------------------------------------------------
  // Biblioteca (lista en "settings", imágenes subidas en la nube)
  // ---------------------------------------------------------------------
  function biblio() {
    if (!Array.isArray(settings.fichas)) settings.fichas = [];
    // Actualización de la biblioteca: las fichas de fábrica toman la configuración nueva
    if ((settings.fichasVer || 1) < FICHAS_VER) {
      settings.fichas = settings.fichas.filter(f => !FICHAS_DEF.some(d => d.id === f.id) && f.id !== "ja620");
      settings.fichas = JSON.parse(JSON.stringify(FICHAS_DEF)).concat(settings.fichas);
      settings.fichasVer = FICHAS_VER;
      setTimeout(saveSettings, 0);
    }
    FICHAS_DEF.forEach(d => { if (!settings.fichas.some(f => f.id === d.id)) settings.fichas.push(JSON.parse(JSON.stringify(d))); });
    if (!Array.isArray(settings.galeria)) settings.galeria = [];
    GALERIA_DEF.forEach(d => { if (!settings.galeria.some(f => f.id === d.id)) settings.galeria.push(Object.assign({}, d)); });
    return settings;
  }
  const esPropia = (f) => !FICHAS_DEF.some(d => d.id === f.id) && !GALERIA_DEF.some(d => d.id === f.id);

  // Imágenes subidas: memoria → este navegador (IndexedDB) → nube (tabla "ajustes", fila arch_<id>)
  const mem = new Map();
  let dbProm = null;
  function idb() {
    if (!dbProm) dbProm = new Promise((res, rej) => {
      try {
        const r = indexedDB.open("feg_archivos", 1);
        r.onupgradeneeded = () => r.result.createObjectStore("a");
        r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
      } catch (e) { rej(e); }
    });
    return dbProm;
  }
  async function idbOp(mode, fn) {
    try {
      const db = await idb();
      return await new Promise((res) => {
        const t = db.transaction("a", mode); const st = t.objectStore("a");
        const q = fn(st); t.oncomplete = () => res(q && q.result); t.onerror = () => res(null);
      });
    } catch (e) { return null; }
  }
  async function getArchivo(id) {
    if (!id) return null;
    if (mem.has(id)) return mem.get(id);
    let v = await idbOp("readonly", st => st.get(id));
    if (!v && typeof cloudOn === "function" && cloudOn()) {
      try {
        const rows = await cloudFetch("ajustes?id=eq." + encodeURIComponent("arch_" + id) + "&select=data");
        v = rows && rows[0] && rows[0].data;
        if (v) idbOp("readwrite", st => st.put(v, id));
      } catch (e) { }
    }
    if (v) mem.set(id, v);
    return v || null;
  }
  async function putArchivo(id, data) {
    mem.set(id, data);
    await idbOp("readwrite", st => st.put(data, id));
    if (typeof cloudOn === "function" && cloudOn()) {
      try {
        await cloudFetch("ajustes", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify([{ id: "arch_" + id, data, updated_at: new Date().toISOString() }]) });
      } catch (e) { showToast("Se guardó solo en este equipo (sin conexión a la nube)", "error"); }
    }
  }
  async function delArchivo(id) {
    mem.delete(id);
    await idbOp("readwrite", st => st.delete(id));
    if (typeof cloudOn === "function" && cloudOn()) {
      try { await cloudFetch("ajustes?id=eq." + encodeURIComponent("arch_" + id), { method: "DELETE", headers: { Prefer: "return=minimal" } }); } catch (e) { }
    }
  }

  // PDF o imagen → imágenes JPG (una por página)
  async function archivoAImagenes(file, maxW, maxPag) {
    const toJpg = (c) => c.toDataURL("image/jpeg", 0.82);
    if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
      if (!window.pdfjsLib) await cargarScript(PDFJS + "pdf.min.js");
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js";
      const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const out = [];
      for (let i = 1; i <= Math.min(pdf.numPages, maxPag); i++) {
        const pg = await pdf.getPage(i);
        const v1 = pg.getViewport({ scale: 1 });
        const vp = pg.getViewport({ scale: maxW / v1.width });
        const c = document.createElement("canvas"); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
        const cx = c.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, c.width, c.height);
        await pg.render({ canvasContext: cx, viewport: vp }).promise;
        out.push(toJpg(c));
      }
      return out;
    }
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("Imagen no válida")); i.src = url; });
      const sc = Math.min(1, maxW / img.naturalWidth);
      const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * sc); c.height = Math.round(img.naturalHeight * sc);
      const cx = c.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, c.width, c.height); cx.drawImage(img, 0, 0, c.width, c.height);
      return [toJpg(c)];
    } finally { URL.revokeObjectURL(url); }
  }

  // ---------------------------------------------------------------------
  // Datos de la propuesta (los mismos números del cotizador)
  // ---------------------------------------------------------------------
  function nombreEquipo(name, unidad) {
    // "ION de 16K" → "ION 16kW" ; "Soluna 32K" → "Soluna 32 kWh"
    let s = String(name || "").replace(/\s+de\s+(?=\d)/i, " ");
    s = s.replace(/(\d+(?:\.\d+)?)\s*K\b/i, unidad === "kWh" ? "$1 kWh" : "$1kW");
    return s.trim();
  }
  function lineaInversores(combo) {
    if (!combo.length) return "";
    const total = combo.reduce((a, c) => a + c.qty, 0);
    const hib = combo.every(c => c.inv.type === "hibrido");
    const tipo = hib ? (total === 1 ? "Inversor Híbrido" : "Inversores Híbridos") : (total === 1 ? "Inversor de inyección" : "Inversores de inyección");
    const modelos = combo.length === 1 ? nombreEquipo(combo[0].inv.name, "kW") : combo.map(c => `${c.qty}× ${nombreEquipo(c.inv.name, "kW")}`).join(" + ");
    return `${total} ${tipo}\n${modelos}`;
  }
  function lineaBaterias(bat, qty) {
    if (!bat || !(qty > 0)) return "";
    return `${qty} ${qty === 1 ? "Batería de Litio" : "Baterías de Litio"}\n${nombreEquipo(bat.name, "kWh")}`;
  }
  const lineaPaneles = (qty, w, marca) => qty > 0 ? `${qty} Paneles Solares\n${marca || MARCAS_PANEL[0]} ${w}W` : "";
  const marcaPanelActual = () => { const el = document.getElementById("panelMarca"); return (el && el.value) || MARCAS_PANEL[0]; };
  // Textos de la página "Descripción del proyecto" (formato de la última propuesta)
  function marcaEquipo(name) { const w = String(name || "").split(/\s+/)[0]; return /^h[ií]brido$/i.test(w) ? "Solis" : w; }
  function descInversores(combo) {
    if (!combo.length) return "";
    const total = combo.reduce((a, c) => a + c.qty, 0);
    const hib = combo.every(c => c.inv.type === "hibrido");
    const tipo = hib ? (total === 1 ? "Inversor Híbrido" : "Inversores Híbridos") : (total === 1 ? "Inversor de inyección" : "Inversores de inyección");
    const mod = (inv) => `${marcaEquipo(inv.name)} de ${nt(inv.kw)}kW`;
    return combo.length === 1 ? `${total} ${tipo} ${mod(combo[0].inv)}` : `${total} ${tipo} (${combo.map(c => `${c.qty} ${mod(c.inv)}`).join(" + ")})`;
  }
  function descBaterias(bat, qty) {
    if (!bat || !(qty > 0)) return "";
    const nom = String(bat.name).replace(/\s+de\s+(?=\d)/i, " ").replace(/(\d+(?:\.\d+)?)\s*K\b/i, "$1kWh");
    return `${qty} ${qty === 1 ? "Batería de Litio" : "Baterías de Litio"} ${nom}`;
  }

  // Valores de una opción guardada (para la página de Alternativas)
  function resumenOpcion(o) {
    const combo = (o.inverterRows || []).map(x => ({ inv: getInverter(x.invId), qty: Number(x.qty) || 0 })).filter(c => c.inv && c.qty > 0);
    const bat = o.batteryId && o.batteryId !== "none" ? getBattery(o.batteryId) : null;
    const bq = bat ? (parseInt(o.batteryQty, 10) || 0) : 0;
    const kwh = bat ? (Number(bat.kwh) || 0) * bq : 0;
    const kwp = Number(o.potenciaKw) || 0;
    const panelQty = parseInt(o.panelQty, 10) || 0;
    let titulo;
    if (o.modalidad === "ongrid") titulo = `INYECCIÓN A RED DE ${fx(kwp, 2)} kWp`;
    else if (o.modalidad === "integracion") titulo = `INTEGRACIÓN DE ALMACENAMIENTO DE ${nt(kwh)} kWh`;
    else titulo = kwh > 0 ? `GENERACIÓN HÍBRIDA DE ${fx(kwp, 2)} kWp` : "GENERACIÓN HÍBRIDA SIN ALMACENAMIENTO";
    return {
      titulo,
      paneles: lineaPaneles(panelQty, o.panelW, o.panelMarca),
      inversor: lineaInversores(combo),
      bateria: lineaBaterias(bat, bq),
      prod: o.sinGeneracion || !(o.kwhMes > 0) ? "" : `Producción de\n${n2(o.kwhMes)} kWh/Mes`,
      alm: kwh > 0 ? `Almacenamiento\n${nt(kwh)}kWh` : "",
      inv: usd(o.total),
      roi: o.sinGeneracion || !(o.roiConLey > 0) ? "—" : fx(o.roiConLey, 1),
      ley: usd((Number(o.total) || 0) * 0.40)
    };
  }

  function construirContexto() {
    const prop = readQuotes().find(p => p.id === estado.propId);
    if (!prop) return null;
    const opt = prop.options.find(o => o.id === estado.optId);
    if (!opt) return null;
    const r = latestCalculationResult || {};
    const datos = prop.datos || {};
    const combo = getInverterCombo();
    const batId = $("quickBatterySelect").value;
    const bat = batId === "none" ? null : getBattery(batId);
    const batQty = bat ? (parseInt($("quickBatteryQty").value, 10) || 0) : 0;
    const almKwh = bat ? (Number(bat.kwh) || 0) * batQty : 0;
    const bc = getBatteryCalc();
    const dod = Math.min(100, Math.max(0, parseFloat(bc.dod) || 0));
    const desc = almKwh * dod / 100;
    const cons = (bc.consumos || []).map(c => parseFloat(c) || 0);
    const horas = cons.map(c => c > 0 ? desc / c : 0);
    const invKw = combo.reduce((a, c) => a + Number(c.inv.kw) * c.qty, 0);
    const consumo = parseFloat(String(datos.consumo || "").replace(/,/g, ""));
    const plazoAnios = (r.plazoMeses || 60) / 12;

    const v = {
      contrato: datos.contrato || "",
      cliente: (prop.clientName || "").trim(),
      ubicacion: (datos.ubicacion || "").trim() || r.province || "",
      fecha: datos.fecha || hoyTexto(),
      kwp: fx(r.potenciaKw, 2) + "kWp",
      almCover: almKwh > 0 ? `/ ${nt(almKwh)}kWh` : "",
      almKwh: almKwh > 0 ? `${nt(almKwh)}kWh` : "",
      almKwhSp: almKwh > 0 ? `${nt(almKwh)} kWh` : "",
      prodMes: `${n2(r.kwhMes)} KWh/mes`,
      prodDia: `${n2((r.kwhMes || 0) / 30)} kwh/día`,
      consumo: consumo > 0 ? `${nt(consumo)} KWh` : "",
      roiLey: `${fx(r.roiConLey, 1)} años`,
      costoWp: "US$" + fx(r.costoPorWp, 2),
      inversion: usd(r.totalEjecucion),
      ahorroAnual: rd(r.ahorroAnualDop),
      ahorroMes: rd(r.ahorroMesDop),
      credito: usd(r.creditoFiscalUsd),
      distribAnual: usd(r.deduccionAnualUsd),
      inversionNeta: usd(r.inversionNetaUsd),
      monto70: rd(r.montoFinanciado70),
      cuota70: rd(r.cuota70),
      tasaInteres: n2(r.tasaAnual) + "%",
      plazoAnios: Number.isInteger(plazoAnios) ? String(plazoAnios) : plazoAnios.toFixed(1),
      panelesLinea: lineaPaneles(r.panelQty || 0, r.panelW, marcaPanelActual()),
      inversorLinea: lineaInversores(combo),
      bateriaLinea: lineaBaterias(bat, batQty),
      dod: nt(dod),
      descMax: `${nt(desc)} KWh`,
      salidaKw: `${nt(invKw)} KW`,
      salidaKwCover: `${nt(invKw)}kW`,
      salidaKwSp: `${nt(invKw)} kW`
    };
    const mod0 = r.modalidad || opt.modalidad || "hibrido";
    if (mod0 === "ongrid") { v.descL1 = `Sistema solar de inyección a red de ${v.kwp}`; v.descL2 = ""; }
    else if (mod0 === "integracion") { v.descL1 = `Sistema de integración de almacenamiento de ${v.almKwhSp}`; v.descL2 = (r.panelQty || 0) > 0 ? `con ${v.kwp} de paneles solares.` : ""; }
    else if (almKwh > 0) { v.descL1 = `Sistema solar híbrido de ${v.kwp} con`; v.descL2 = "almacenamiento en baterías."; }
    else { v.descL1 = `Sistema solar híbrido de ${v.kwp}`; v.descL2 = "sin almacenamiento en baterías."; }
    const filas = [];
    if ((r.panelQty || 0) > 0) filas.push({ k: "paneles", t: `${r.panelQty} Paneles Solares ${marcaPanelActual()} ${r.panelW}W` });
    if (combo.length) filas.push({ k: "inversor", t: descInversores(combo) });
    if (bat && batQty > 0) filas.push({ k: "bateria", t: descBaterias(bat, batQty) });
    filas.push({ k: "cable", t: "Cablería y canalizaciones", sub: "Certificadas" });
    filas.push({ k: "protecciones", t: "Protecciones Eléctricas", sub: "Certificadas" });
    filas.push({ k: "instalacion", t: "Instalación y puesta en funcionamiento" });
    [0, 1, 2, 3].forEach(k => {
      v["cons" + (k + 1)] = cons[k] > 0 ? `${nt(cons[k])} kW` : "";
      v["h" + (k + 1)] = horas[k] > 0 ? `${nt(horas[k])} HORAS` : "";
    });
    // Alternativas: las otras opciones de esta misma propuesta (máximo 2)
    const otras = prop.options.filter(o => o.id !== opt.id).slice(0, 2);
    otras.forEach((o, i) => { const a = resumenOpcion(o); Object.keys(a).forEach(k => v[`a${i + 1}_${k}`] = a[k]); });
    ["a1", "a2"].forEach((p, i) => { if (!otras[i]) ["titulo", "paneles", "inversor", "bateria", "prod", "alm", "inv", "roi", "ley"].forEach(k => v[`${p}_${k}`] = ""); });

    // Fichas automáticas según los equipos
    const equipos = new Set([...combo.map(c => c.inv.id), ...(bat && batQty > 0 ? [bat.id] : [])]);
    const panelQty = r.panelQty || 0;

    return {
      filasDesc: filas, panelW: r.panelW, marcaPanel: marcaPanelActual(),
      prop, opt, r, datos, v, otras, almKwh, panelQty, equipos,
      modalidad: r.modalidad || opt.modalidad || "hibrido",
      doc: Object.assign({ pag: {}, edits: {}, fichas: {}, galeria: null }, opt.doc || {})
    };
  }

  // La ficha del panel: la de su marca cuyo rango incluye los vatios (si ninguna, la de rango más cercano)
  function fichaPanelId(ctx) {
    if (!(ctx.panelQty > 0)) return null;
    const W = Number(ctx.panelW) || 0;
    const marca = String(ctx.marcaPanel || "").toLowerCase();
    const cands = settings.fichas.filter(f => f.siempre === "panel" && String(f.marca || "").toLowerCase() === marca);
    if (!cands.length) return null;
    const dist = (f) => W < f.wMin ? f.wMin - W : W > f.wMax ? W - f.wMax : 0;
    return cands.slice().sort((a, b) => dist(a) - dist(b))[0].id;
  }
  function fichaAuto(f, ctx) {
    if (f.siempre === "panel") return f.id === ctx.fichaPanel;
    if (f.siempre === "todos") return true;
    if (f.siempre === "paneles") return ctx.panelQty > 0;
    return (f.equipos || []).some(id => ctx.equipos.has(id));
  }
  const fichaElegida = (f, ctx) => (f.id in ctx.doc.fichas) ? !!ctx.doc.fichas[f.id] : fichaAuto(f, ctx);
  const galeriaElegida = (ctx) => Array.isArray(ctx.doc.galeria) ? ctx.doc.galeria.filter(id => settings.galeria.some(g => g.id === id)) : GALERIA_DEF.map(g => g.id);

  // Lista de páginas en el orden de la plantilla
  function listaPaginas(ctx) {
    const orden = TPL.orden[ctx.modalidad] || TPL.orden.hibrido;
    const out = [];
    orden.forEach(([t, n, rol]) => {
      const key = t + n;
      const base = { rol, key, nombre: TPL.nombres[rol] || rol };
      if (rol === "fichas") {
        biblio().fichas.filter(f => fichaElegida(f, ctx)).sort((a, b) => (a.cat || 6) - (b.cat || 6)).forEach(f => {
          for (let p = 1; p <= (f.paginas || 1); p++) out.push({ rol, key: `ficha:${f.id}:${p}`, ficha: f, pagina: p, nombre: `Ficha: ${f.nombre}${f.paginas > 1 ? ` (${p}/${f.paginas})` : ""}`, grupo: "fichas" });
        });
        return;
      }
      if (rol === "galeria") {
        const fotos = galeriaElegida(ctx);
        if (!fotos.length) { out.push(Object.assign(base, { inst: "galeria", nota: "Sin fotos elegidas", fija: false, vacia: true })); return; }
        for (let i = 0; i < fotos.length; i += 2) out.push(Object.assign({}, base, { inst: `galeria#${i / 2}`, fotos: fotos.slice(i, i + 2), nombre: base.nombre + (fotos.length > 2 ? ` ${i / 2 + 1}` : "") }));
        return;
      }
      const p = Object.assign(base, { inst: rol });
      if (rol === "factura" && !ctx.datos.facturaId) { p.vacia = true; p.nota = "Sube la factura del cliente"; }
      if (rol === "alternativas" && !ctx.otras.length) { p.vacia = true; p.nota = "Solo hay una opción en esta propuesta"; }
      if (rol === "capacidad" && !(ctx.almKwh > 0)) { p.defOff = true; p.nota = "Sin baterías"; }
      out.push(p);
    });
    out.forEach(p => {
      const id = p.inst || p.key;
      p.id = id;
      const elegido = ctx.doc.pag[id];
      p.on = !p.vacia && (elegido === undefined ? !p.defOff : !!elegido);
    });
    return out;
  }

  // ---------------------------------------------------------------------
  // Dibujo de páginas
  // ---------------------------------------------------------------------
  function textoAuto(b, v) {
    return b.f.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
  }
  function htmlBloque(b, texto, auto, editado, pagId) {
    const tplMulti = b.text.includes("\n") || b.align === "justify";
    const lh = tplMulti ? b.lh : b.size * 1.2;
    let left = b.x, width = null, align = b.align, ws = "pre";
    if (auto) {
      const fa = b.fa || "l";
      const W = b.fw || (texto.length > 40 ? Math.max(b.w + 40, 300) : 300);
      if (b.fw) ws = "pre-wrap";
      if (fa === "c") { width = W; left = b.x + b.w / 2 - W / 2; align = "center"; }
      else if (fa === "r") { width = W; left = b.x + b.w - W; align = "right"; }
      else { if (b.fw) width = W; align = "left"; }
      if (b.align === "justify") { width = b.w * 1.04 + 2; ws = "pre-wrap"; align = "left"; left = b.x; }
    } else if (tplMulti) {
      width = b.w * 1.04 + 2;
      if (b.align === "center") left = b.x + b.w / 2 - width / 2;
      if (b.align === "justify") ws = "normal";
    }
    const st = `left:${left}pt;top:${b.y - b.size}pt;${width ? `width:${width}pt;` : ""}font-family:'${b.family}';font-weight:${b.weight};font-size:${b.size}pt;line-height:${lh}pt;color:${b.color};text-align:${align};white-space:${ws}`;
    return `<div class="pp-t${editado ? " pp-ed" : ""}${auto ? " pp-auto" : ""}" data-pag="${esc(pagId)}" data-b="${b.id}" data-y="${b.y}" contenteditable="plaintext-only" spellcheck="false" style="${st}">${esc(texto)}</div>`;
  }

  function bloquesPagina(tplKey, pagId, ctx, filtro, cambios) {
    const pg = TPL.paginas[tplKey];
    const ed = ctx.doc.edits[pagId] || {};
    return pg.blocks.filter(b => !filtro || filtro(b)).map(b0 => {
      const b = cambios && cambios[b0.id] ? Object.assign({}, b0, cambios[b0.id]) : b0;
      const auto = !!b.f;
      const def = auto ? textoAuto(b, ctx.v) : b.text;
      const editado = Object.prototype.hasOwnProperty.call(ed, b.id);
      return htmlBloque(b, editado ? ed[b.id] : def, auto, editado, pagId);
    }).join("");
  }

  const sinLey = (ctx) => { const l = (ctx.paginas || []).find(x => x.rol === "ley"); return !!l && !l.on; };
  const rect = (r, extra) => `left:${r[0]}pt;top:${r[1]}pt;width:${r[2] - r[0]}pt;height:${r[3] - r[1]}pt;${extra || ""}`;

  async function htmlPagina(p, ctx) {
    if (p.rol === "fichas") {
      const f = p.ficha;
      let src;
      if (esPropia(f)) { const a = await getArchivo("ficha_" + f.id); src = a && a.paginas && a.paginas[p.pagina - 1]; }
      else src = `${BASE}fichas/${f.id}-${p.pagina}.jpg`;
      if (!src) return `<div class="pp-page" data-id="${esc(p.id)}"><div class="pp-falta">No se encontró la imagen de esta ficha</div></div>`;
      if (f.completa) return `<div class="pp-page" data-id="${esc(p.id)}"><img class="pp-bg" src="${src}" alt=""></div>`;
      return `<div class="pp-page" data-id="${esc(p.id)}" style="background:#fff">
        <img class="pp-bg" src="${BASE}ficha-header.jpg" alt="" style="height:80pt">
        <img src="${src}" alt="" style="position:absolute;${rect([56, 86, 556, 782], "object-fit:contain;object-position:center top")}">
        ${bloquesPagina("c15", p.id, ctx)}</div>`;
    }
    const tplKey = p.key;
    const pg = TPL.paginas[tplKey];
    const z = (TPL.zonas || {})[tplKey] || {};
    let extra = "", filtro = null;
    if (p.rol === "factura") {
      const a = await getArchivo(ctx.datos.facturaId);
      extra += `<div style="position:absolute;${rect(z.tapar, `background:${z.color || "#fba81c"}`)}"></div>`;
      if (a && a.paginas && a.paginas[0]) {
        // Pila de facturas: la del cliente al frente y otra hoja detrás, como en la plantilla
        const src = a.paginas[0];
        const dim = await new Promise(res => { const i = new Image(); i.onload = () => res([i.naturalWidth, i.naturalHeight]); i.onerror = () => res([850, 1100]); i.src = src; });
        const maxW = 440, maxH = 566, cx = 282, cy = 432;
        const sc = Math.min(maxW / dim[0], maxH / dim[1]);
        const w = dim[0] * sc, h = dim[1] * sc, l = cx - w / 2, t = cy - h / 2;
        const hoja = (tr, br) => `<div style="position:absolute;left:${l}pt;top:${t}pt;width:${w}pt;height:${h}pt;transform:${tr};background:#fff;box-shadow:0 1.5pt 6pt rgba(0,0,0,.35)"><img src="${src}" alt="" style="width:100%;height:100%;display:block;object-fit:fill;${br}"></div>`;
        extra += hoja("translate(34pt,-11pt) rotate(1.8deg)", "filter:brightness(.97)");
        extra += hoja("rotate(-0.5deg)", "");
      }
    }
    if (p.rol === "galeria" && p.fotos) {
      const srcs = await Promise.all(p.fotos.map(async id => {
        const g = settings.galeria.find(x => x.id === id);
        if (g && esPropia(g)) { const a = await getArchivo("foto_" + id); return a && a.paginas && a.paginas[0]; }
        return `${BASE}galeria/${id}.jpg`;
      }));
      const slots = z.fotos || [];
      if (srcs.length === 1 && slots.length === 2) {
        const r = [slots[0][0], slots[0][1], slots[1][2], slots[1][3]];
        extra += `<div style="position:absolute;${rect(r, "background:#fff")}"></div>`;
        extra += `<img src="${srcs[0]}" alt="" class="pp-foto" style="position:absolute;${rect(r, "object-fit:cover")}">`;
      } else srcs.forEach((s, i) => { if (s && slots[i]) extra += `<img src="${s}" alt="" class="pp-foto" style="position:absolute;${rect(slots[i], "object-fit:cover")}">`; });
    }
    if (p.rol === "alternativas" && ctx.otras.length === 1 && z.tarjeta2) {
      const y0 = z.tarjeta2[1];
      extra += `<div style="position:absolute;${rect(z.tarjeta2, "background:#fff")}"></div>`;
      filtro = (b) => b.y < y0;
    }
    if (tplKey === "d1") extra += filasDescripcion(ctx, p.id);
    // Sin contrato: se quita la palabra "Contrato" y la línea gris que la separa
    if (p.rol === "portada" && !String(ctx.v.contrato || "").trim()) {
      filtro = (b) => !(b.f && b.f.includes("{contrato}"));
      extra += `<div style="position:absolute;${rect([384.5, 533, 394.5, 608], "background:#333333")}"></div>`;
    }
    // Sin la página de la Ley 57-07: se quita el ROI y lo que menciona la ley; "Para alcanzar tu libertad energética" sube
    let cambios = null;
    if (p.rol === "recupera" && sinLey(ctx) && (tplKey === "c5" || tplKey === "i5")) {
      filtro = (b) => !["p5b3", "p5b4", "p5b5"].includes(b.id);
      cambios = { p5b6: { x: 278.1, y: 349.8, size: 14.13 }, p5b7: { x: 278.1, y: 372.7, size: 23.54 } };
    }
    return `<div class="pp-page" data-id="${esc(p.id)}"><img class="pp-bg" src="${BASE}bg/${pg.bg}" alt="">${extra}${bloquesPagina(tplKey, p.id, ctx, filtro, cambios)}</div>`;
  }

  // Filas de la descripción: ícono + barra naranja + texto, una debajo de otra
  function bloquesFilas(ctx) {
    const F = TPL.filasDesc, T = F.texto;
    let y = F.base[0];
    const out = [];
    ctx.filasDesc.forEach(f => {
      out.push({ k: f.k, y, b: { id: "fila_" + f.k, x: T.x - 2.2, y, w: 380, size: T.size, family: "Montserrat", weight: T.weight, color: T.color, align: "left", lh: T.size * 1.2, text: "", f: "→" + f.t, fa: "l" } });
      if (f.sub) out.push({ b: { id: "sub_" + f.k, x: T.x, y: y + T.sub.dy, w: 70, size: T.sub.size, family: "Montserrat", weight: T.sub.weight, color: T.sub.color, align: "left", lh: T.sub.size * 1.2, text: f.sub } });
      y += F.gap[f.k] || 52;
    });
    return out;
  }
  function filasDescripcion(ctx, pagId) {
    const F = TPL.filasDesc;
    const ed = ctx.doc.edits[pagId] || {};
    return bloquesFilas(ctx).map(x => {
      let h = "";
      if (x.k) { const ic = F.iconos[x.k]; h += `<img src="${BASE}desc/${x.k}.jpg" alt="" style="position:absolute;left:${ic.x}pt;top:${x.y + ic.y}pt;width:${ic.w}pt;height:${ic.h}pt">`; }
      const auto = !!x.b.f, def = auto ? x.b.f : x.b.text;
      const editado = Object.prototype.hasOwnProperty.call(ed, x.b.id);
      return h + htmlBloque(x.b, editado ? ed[x.b.id] : def, auto, editado, pagId);
    }).join("");
  }

  // Pone cada texto en su línea base exacta (como en la plantilla)
  const baseCache = new Map();
  function alinearBases(root) {
    root.querySelectorAll(".pp-t").forEach(el => {
      const key = el.style.fontFamily + el.style.fontWeight + el.style.fontSize + el.style.lineHeight;
      let base = baseCache.get(key);
      if (base === undefined) {
        const m = document.createElement("span");
        m.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
        el.insertBefore(m, el.firstChild);
        base = m.offsetTop / (96 / 72);
        m.remove();
        baseCache.set(key, base);
      }
      el.style.top = (parseFloat(el.dataset.y) - base) + "pt";
    });
  }

  // ---------------------------------------------------------------------
  // Pantalla del generador
  // ---------------------------------------------------------------------
  function crearPantalla() {
    if ($("ppOverlay")) return;
    const css = document.createElement("style");
    css.textContent = `
#ppOverlay{position:fixed;inset:0;z-index:60;background:#e9ecf1;display:flex;flex-direction:column;font-family:Inter,system-ui,sans-serif}
#ppOverlay .pp-top{background:#fff;border-bottom:1px solid #e2e8f0;padding:10px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
#ppOverlay .pp-body{flex:1;display:flex;min-height:0}
#ppSide{width:330px;flex-shrink:0;background:#fff;border-right:1px solid #e2e8f0;overflow-y:auto;padding:14px 16px 40px}
#ppPages{flex:1;overflow:auto;padding:24px 12px 80px}
.pp-wrap{margin:0 auto 22px;position:relative}
.pp-page{position:absolute;left:0;top:0;width:612pt;height:792pt;overflow:hidden;background:#fff;transform-origin:0 0;box-shadow:0 4px 24px rgba(15,23,42,.14)}
.pp-page .pp-bg{position:absolute;left:0;top:0;width:612pt;height:792pt;display:block}
.pp-page .pp-bg[style*="height:80pt"]{height:80pt}
.pp-t{position:absolute;outline:none;border-radius:2px;cursor:text;min-width:4pt;-webkit-font-smoothing:antialiased;font-kerning:normal}
.pp-t:hover{box-shadow:0 0 0 1px rgba(249,115,22,.55)}
.pp-t:focus{box-shadow:0 0 0 1.5px #f97316;background:rgba(255,255,255,.08)}
.pp-t.pp-ed{box-shadow:0 0 0 1px rgba(249,115,22,.0);background-image:linear-gradient(90deg,rgba(249,115,22,.9) 50%,transparent 50%);background-size:6px 1.5px;background-repeat:repeat-x;background-position:0 100%}
.pp-falta{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:14pt}
.pp-sec{border-top:1px solid #f1f5f9;padding-top:12px;margin-top:12px}
.pp-sec h4{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#334155;margin-bottom:8px}
.pp-in{width:100%;padding:6px 9px;font-size:13px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;outline:none}
.pp-in:focus{border-color:#fb923c;background:#fff}
.pp-lab{display:block;font-size:11px;font-weight:500;color:#475569;margin-bottom:8px}
.pp-row{display:flex;align-items:center;gap:8px;padding:5px 6px;border-radius:8px;font-size:12px;color:#334155;cursor:pointer}
.pp-row:hover{background:#f8fafc}
.pp-row input{accent-color:#f97316;width:15px;height:15px;flex-shrink:0}
.pp-row.off{color:#94a3b8}
.pp-nota{font-size:10px;color:#94a3b8;margin-left:auto;text-align:right}
.pp-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;border-radius:9px;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;border:0}
.pp-btn.dark{background:#0f172a;color:#fff}.pp-btn.dark:hover{background:#1e293b}
.pp-btn.orange{background:#f97316;color:#fff}.pp-btn.orange:hover{background:#ea580c}
.pp-btn.light{background:#f1f5f9;color:#334155}.pp-btn.light:hover{background:#e2e8f0}
.pp-link{font-size:11px;font-weight:600;color:#ea580c;cursor:pointer;background:none;border:0;padding:0}
.pp-thumbs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pp-thumb{position:relative;border-radius:8px;overflow:hidden;border:2px solid #e2e8f0;cursor:pointer;aspect-ratio:16/10;background:#f1f5f9}
.pp-thumb.sel{border-color:#f97316}
.pp-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.pp-thumb .ck{position:absolute;top:4px;left:4px;width:18px;height:18px;border-radius:5px;background:#fff;border:1.5px solid #cbd5e1;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff}
.pp-thumb.sel .ck{background:#f97316;border-color:#f97316}
.pp-thumb .del{position:absolute;top:3px;right:5px;color:#fff;font-weight:700;text-shadow:0 0 3px #000;font-size:14px}
#ppTool{position:fixed;z-index:70;display:none;gap:6px;background:#0f172a;color:#fff;border-radius:8px;padding:5px 8px;font-size:11px;box-shadow:0 6px 18px rgba(0,0,0,.2)}
#ppTool button{color:#fff;font-weight:600;background:none;border:0;cursor:pointer;font-size:11px}
#ppTool span{color:#94a3b8}
#ppCargando{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:13px}
@media (max-width:900px){
  #ppOverlay .pp-body{flex-direction:column;overflow-y:auto}
  #ppSide{width:auto;border-right:0;border-bottom:1px solid #e2e8f0;overflow:visible;padding-bottom:16px}
  #ppSide.cerrado .pp-cuerpo{display:none}
  #ppPages{overflow:visible;padding:14px 8px 60px}
}
@media (min-width:901px){ #ppSideToggle{display:none} .pp-sm{display:none} }
@media (max-width:900px){ .pp-lg,#ppSub{display:none} }
@media print{
  @page{size:letter;margin:0}
  body.pp-abierto{background:#fff!important;height:auto!important;overflow:visible!important;min-height:0!important;display:block!important}
  body.pp-abierto>*:not(#ppOverlay){display:none!important}
  body.pp-abierto #ppOverlay{position:static!important;display:block!important;background:#fff!important}
  body.pp-abierto #ppOverlay .pp-top,body.pp-abierto #ppSide,body.pp-abierto #ppTool{display:none!important}
  body.pp-abierto #ppOverlay .pp-body{display:block!important}
  body.pp-abierto #ppPages{padding:0!important;overflow:visible!important}
  body.pp-abierto .pp-wrap{width:612pt!important;height:792pt!important;margin:0!important;overflow:hidden;break-after:page;page-break-after:always}
  body.pp-abierto .pp-wrap:last-child{break-after:auto;page-break-after:auto}
  body.pp-abierto .pp-page{position:relative!important;transform:none!important;box-shadow:none!important}
  body.pp-abierto .pp-t{box-shadow:none!important;background:none!important}
  body.pp-abierto .pp-page,body.pp-abierto .pp-page *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}`;
    document.head.appendChild(css);
    const div = document.createElement("div");
    div.id = "ppOverlay";
    div.style.display = "none";
    div.innerHTML = `
      <div class="pp-top">
        <button type="button" class="pp-btn light" onclick="FEGPropuesta.cerrar()">← Volver</button>
        <div style="min-width:0;flex:1">
          <div id="ppTitulo" style="font-size:14px;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Propuesta</div>
          <div id="ppSub" style="font-size:11px;color:#64748b">Toca cualquier texto de la propuesta para cambiarlo</div>
        </div>
        <button type="button" class="pp-btn orange" onclick="FEGPropuesta.imprimir()">⬇ <span class="pp-lg">Descargar PDF / Imprimir</span><span class="pp-sm">PDF</span></button>
      </div>
      <div class="pp-body">
        <aside id="ppSide" class="cerrado">
          <button type="button" id="ppSideToggle" class="pp-btn light" style="width:100%" onclick="this.parentElement.classList.toggle('cerrado')">⚙ Datos, páginas, fichas y fotos</button>
          <div class="pp-cuerpo" id="ppSideBody"></div>
        </aside>
        <div id="ppPages"></div>
      </div>
      <div id="ppTool"><span>Texto cambiado a mano</span><button type="button" id="ppToolBtn">↺ Volver al automático</button></div>`;
    document.body.appendChild(div);

    // Guardar lo que se escribe en la propuesta
    const pages = $("ppPages");
    pages.addEventListener("focusin", (e) => { const el = e.target.closest(".pp-t"); if (el) { bloqueActivo = el; mostrarTool(el); } });
    pages.addEventListener("input", (e) => { const el = e.target.closest(".pp-t"); if (el) { el.classList.add("pp-ed"); mostrarTool(el); } });
    pages.addEventListener("focusout", (e) => { const el = e.target.closest(".pp-t"); if (el) { guardarBloque(el); setTimeout(() => { if (document.activeElement !== el && !$("ppTool").matches(":hover")) $("ppTool").style.display = "none"; }, 150); } });
    pages.addEventListener("keydown", (e) => { if (e.key === "Escape" && e.target.closest(".pp-t")) e.target.blur(); });
    pages.addEventListener("paste", (e) => {
      const el = e.target.closest(".pp-t"); if (!el) return;
      e.preventDefault();
      const t = (e.clipboardData || window.clipboardData).getData("text/plain");
      document.execCommand("insertText", false, t);
    });
    pages.addEventListener("scroll", () => { if (bloqueActivo && document.activeElement === bloqueActivo) mostrarTool(bloqueActivo); });
    $("ppToolBtn").addEventListener("mousedown", (e) => e.preventDefault());
    $("ppToolBtn").addEventListener("click", () => { if (bloqueActivo) restaurarBloque(bloqueActivo); });
    window.addEventListener("resize", () => { if ($("ppOverlay").style.display !== "none") escalar(); });
    window.addEventListener("beforeprint", () => { if ($("ppOverlay").style.display !== "none") document.querySelectorAll(".pp-t:focus").forEach(el => el.blur()); });
  }

  function mostrarTool(el) {
    const t = $("ppTool");
    if (!el.classList.contains("pp-ed")) { t.style.display = "none"; return; }
    const r = el.getBoundingClientRect();
    t.style.display = "flex";
    t.style.left = Math.max(8, Math.min(window.innerWidth - 260, r.left)) + "px";
    t.style.top = Math.max(8, r.top - 34) + "px";
  }

  function textoDeBloque(el) { return (el.innerText || "").replace(/ /g, " ").replace(/\n$/, ""); }
  function defaultDeBloque(pagId, bId) {
    const ctx = ultimoCtx; if (!ctx) return null;
    let tplKey;
    if (pagId.startsWith("ficha:")) tplKey = "c15";
    else { const p = (ctx.paginas || []).find(x => x.id === pagId); tplKey = p && p.key; }
    let b = tplKey && TPL.paginas[tplKey].blocks.find(x => x.id === bId);
    if (!b && tplKey === "d1") { const x = bloquesFilas(ctx).find(z => z.b.id === bId); b = x && x.b; }
    if (!b) return null;
    return b.f ? textoAuto(b, ctx.v) : b.text;
  }

  // Cambios en la propuesta guardada (opción actual)
  function cambiarDoc(fn) {
    const list = readQuotes();
    const prop = list.find(p => p.id === estado.propId);
    const opt = prop && prop.options.find(o => o.id === estado.optId);
    if (!opt) return;
    opt.doc = Object.assign({ pag: {}, edits: {}, fichas: {}, galeria: null }, opt.doc || {});
    fn(opt.doc, prop);
    opt.updatedAt = new Date().toISOString();
    writeQuotes(list);
  }
  function cambiarDatos(fn) {
    const list = readQuotes();
    const prop = list.find(p => p.id === estado.propId);
    if (!prop) return;
    prop.datos = Object.assign({}, prop.datos || {});
    fn(prop.datos);
    writeQuotes(list);
  }

  function guardarBloque(el) {
    const pagId = el.dataset.pag, bId = el.dataset.b;
    const def = defaultDeBloque(pagId, bId);
    const txt = textoDeBloque(el);
    const igual = def !== null && txt === def;
    el.classList.toggle("pp-ed", !igual);
    cambiarDoc((doc) => {
      doc.edits[pagId] = doc.edits[pagId] || {};
      if (igual) { delete doc.edits[pagId][bId]; if (!Object.keys(doc.edits[pagId]).length) delete doc.edits[pagId]; }
      else doc.edits[pagId][bId] = txt;
    });
    if (ultimoCtx) { ultimoCtx.doc.edits[pagId] = ultimoCtx.doc.edits[pagId] || {}; if (igual) delete ultimoCtx.doc.edits[pagId][bId]; else ultimoCtx.doc.edits[pagId][bId] = txt; }
    contarEditados();
  }
  function restaurarBloque(el) {
    const def = defaultDeBloque(el.dataset.pag, el.dataset.b);
    if (def === null) return;
    el.textContent = def;
    el.classList.remove("pp-ed");
    $("ppTool").style.display = "none";
    guardarBloque(el);
    el.blur();
  }
  function contarEditados() {
    const n = document.querySelectorAll("#ppPages .pp-t.pp-ed").length;
    const box = $("ppEditCount");
    if (box) box.innerHTML = n ? `${n} texto${n === 1 ? "" : "s"} cambiado${n === 1 ? "" : "s"} a mano (subrayado naranja). <button type="button" class="pp-link" onclick="FEGPropuesta.restaurarTodo()">Volver todos al automático</button>` : "Ningún texto cambiado a mano.";
  }

  function escalar() {
    const cont = $("ppPages");
    const W = 612 * 96 / 72, H = 792 * 96 / 72;
    const disp = cont.clientWidth - 24;
    const s = Math.min(1, disp / W);
    cont.querySelectorAll(".pp-wrap").forEach(w => {
      w.style.width = W * s + "px"; w.style.height = H * s + "px";
      const p = w.firstElementChild; if (p) p.style.transform = s < 1 ? `scale(${s})` : "";
    });
  }

  // ---------------------------------------------------------------------
  // Panel lateral
  // ---------------------------------------------------------------------
  function htmlLateral(ctx) {
    const d = ctx.datos;
    const pags = ctx.paginas;
    const filasPag = pags.filter(p => p.rol !== "fichas").map(p => `
      <label class="pp-row ${p.vacia ? "off" : ""}"><input type="checkbox" ${p.on ? "checked" : ""} ${p.vacia ? "disabled" : ""} onchange="FEGPropuesta.togglePagina('${esc(p.id)}', this.checked)">
        <span>${esc(p.nombre)}</span>${p.nota ? `<span class="pp-nota">${esc(p.nota)}</span>` : ""}</label>`).join("");
    const fichas = biblio().fichas.slice().sort((a, b) => (a.cat || 6) - (b.cat || 6));
    const filasFicha = fichas.map(f => {
      const on = fichaElegida(f, ctx), auto = fichaAuto(f, ctx);
      return `<label class="pp-row"><input type="checkbox" ${on ? "checked" : ""} onchange="FEGPropuesta.toggleFicha('${esc(f.id)}', this.checked)">
        <span>${esc(f.nombre)}</span><span class="pp-nota">${auto ? "según equipos" : ""}</span></label>`;
    }).join("");
    const fotosSel = galeriaElegida(ctx);
    const thumbs = settings.galeria.map(g => {
      const sel = fotosSel.includes(g.id);
      const src = esPropia(g) ? "" : `${BASE}galeria/${g.id}.jpg`;
      return `<div class="pp-thumb ${sel ? "sel" : ""}" onclick="FEGPropuesta.toggleFoto('${esc(g.id)}')" title="${esc(g.nombre)}">
        <img data-foto="${esc(g.id)}" ${src ? `src="${src}"` : ""} alt=""><span class="ck">${sel ? "✓" : ""}</span>
        ${esPropia(g) ? `<span class="del" onclick="event.stopPropagation();FEGPropuesta.borrarFoto('${esc(g.id)}')" title="Borrar foto">×</span>` : ""}</div>`;
    }).join("");
    return `
      <div class="pp-sec" style="border:0;margin:0;padding-top:4px">
        <h4>Datos del cliente</h4>
        <label class="pp-lab">Contrato (NIC)<input class="pp-in" value="${esc(d.contrato || "")}" onchange="FEGPropuesta.setDato('contrato', this.value)"></label>
        <label class="pp-lab">Consumo máximo mensual (kWh)<input class="pp-in" inputmode="decimal" value="${esc(d.consumo || "")}" placeholder="Ej. 1773" onchange="FEGPropuesta.setDato('consumo', this.value)"></label>
        <label class="pp-lab">Ubicación<input class="pp-in" value="${esc(d.ubicacion || "")}" placeholder="${esc(ctx.r.province || "")}" onchange="FEGPropuesta.setDato('ubicacion', this.value)"></label>
        <label class="pp-lab">Fecha<input class="pp-in" value="${esc(d.fecha || "")}" placeholder="${hoyTexto()}" onchange="FEGPropuesta.setDato('fecha', this.value)"></label>
        <div class="pp-lab">Factura de luz del cliente
          <div style="display:flex;gap:8px;align-items:center;margin-top:4px">
            <label class="pp-btn light" style="flex:1">${d.facturaId ? "Cambiar factura" : "Subir factura (foto o PDF)"}<input type="file" accept="image/*,application/pdf" style="display:none" onchange="FEGPropuesta.subirFactura(this)"></label>
            ${d.facturaId ? `<button type="button" class="pp-link" onclick="FEGPropuesta.quitarFactura()">Quitar</button>` : ""}
          </div></div>
        <p style="font-size:10.5px;color:#94a3b8;line-height:1.4">Estos datos son del cliente y sirven para todas sus opciones. Los precios, potencias y ahorros salen solos del cotizador.</p>
      </div>
      <div class="pp-sec"><h4>Páginas</h4>${filasPag}</div>
      <div class="pp-sec"><h4>Fichas técnicas</h4>${filasFicha}
        <label class="pp-btn light" style="width:100%;margin-top:8px">+ Agregar otra ficha (PDF o imagen)<input type="file" accept="image/*,application/pdf" style="display:none" onchange="FEGPropuesta.subirFicha(this)"></label>
        <p style="font-size:10.5px;color:#94a3b8;margin-top:6px">En <strong>Precios y Reglas</strong> eliges con qué equipos sale cada ficha sola.</p></div>
      <div class="pp-sec"><h4>Fotos de proyectos</h4>
        <div class="pp-thumbs">${thumbs}</div>
        <label class="pp-btn light" style="width:100%;margin-top:8px">+ Subir fotos de proyectos<input type="file" accept="image/*" multiple style="display:none" onchange="FEGPropuesta.subirFotos(this)"></label>
        <p style="font-size:10.5px;color:#94a3b8;margin-top:6px">Van de 2 en 2 por página, en el orden en que las marques.</p></div>
      <div class="pp-sec"><h4>Textos</h4>
        <p id="ppEditCount" style="font-size:11.5px;color:#475569;line-height:1.5"></p>
        <p style="font-size:10.5px;color:#94a3b8;margin-top:6px;line-height:1.4">Toca cualquier texto de las páginas y escríbelo como quieras. Si después cambias algo en el cotizador, los textos que no tocaste se actualizan solos.</p></div>`;
  }

  async function pintarFotosPropias() {
    for (const img of document.querySelectorAll("#ppSide img[data-foto]:not([src])")) {
      const a = await getArchivo("foto_" + img.dataset.foto);
      if (a && a.paginas && a.paginas[0]) img.src = a.paginas[0];
    }
  }

  // ---------------------------------------------------------------------
  // Dibujar todo
  // ---------------------------------------------------------------------
  let dibujando = 0;
  async function dibujar() {
    const turno = ++dibujando;
    const ctx = construirContexto();
    if (!ctx) { cerrar(); return; }
    ctx.fichaPanel = fichaPanelId(ctx);
    ctx.paginas = listaPaginas(ctx);
    ultimoCtx = ctx;
    const scroll = $("ppSide").scrollTop;
    $("ppSideBody").innerHTML = htmlLateral(ctx);
    $("ppSide").scrollTop = scroll;
    pintarFotosPropias();
    $("ppTitulo").textContent = `Propuesta • ${ctx.prop.clientName || "Cliente"} • ${ctx.opt.name || ""}`;
    const activas = ctx.paginas.filter(p => p.on);
    $("ppSub").textContent = `${activas.length} páginas • Toca cualquier texto para cambiarlo`;
    const html = await Promise.all(activas.map(p => htmlPagina(p, ctx)));
    if (turno !== dibujando) return;
    const cont = $("ppPages");
    const y = cont.scrollTop;
    cont.innerHTML = html.map(h => `<div class="pp-wrap">${h}</div>`).join("");
    escalar();
    try {
      await Promise.all(["300", "400", "600", "700", "900"].map(w => document.fonts.load(`${w} 12pt Montserrat`))
        .concat(["400", "700"].map(w => document.fonts.load(`${w} 12pt "Open Sans"`))));
      await document.fonts.ready;
    } catch (e) { }
    if (turno !== dibujando) return;
    alinearBases(cont);
    cont.scrollTop = y;
    contarEditados();
  }

  // ---------------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------------
  async function abrir() {
    if (typeof flushSave === "function") flushSave();
    if (!currentQuoteId || !currentOptionId) { showToast("Escribe el nombre del cliente para guardar la cotización primero", "error"); return; }
    try { await cargarPlantillas(); } catch (e) { showToast("Falta la carpeta \"propuesta\" en la página (plantillas)", "error"); return; }
    biblio();
    crearPantalla();
    estado = { propId: currentQuoteId, optId: currentOptionId };
    $("ppOverlay").style.display = "flex";
    document.body.style.overflow = "hidden";
    document.body.classList.add("pp-abierto");
    $("ppPages").innerHTML = `<div id="ppCargando">Armando la propuesta…</div>`;
    await dibujar();
  }
  function cerrar() {
    const o = $("ppOverlay"); if (o) o.style.display = "none";
    $("ppTool") && ($("ppTool").style.display = "none");
    document.body.style.overflow = "";
    document.body.classList.remove("pp-abierto");
    estado = null;
  }
  function imprimir() {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    const t = document.title;
    const ctx = ultimoCtx;
    if (ctx) document.title = `Propuesta ${ctx.prop.clientName || ""} - ${ctx.opt.name || ""}`.trim();
    setTimeout(() => { window.print(); setTimeout(() => { document.title = t; }, 500); }, 60);
  }
  function togglePagina(id, on) { cambiarDoc(doc => { doc.pag[id] = !!on; }); dibujar(); }
  function toggleFicha(id, on) { cambiarDoc(doc => { doc.fichas[id] = !!on; }); dibujar(); }
  function toggleFoto(id) {
    const ctx = ultimoCtx; if (!ctx) return;
    const sel = galeriaElegida(ctx).slice();
    const i = sel.indexOf(id);
    if (i >= 0) sel.splice(i, 1); else sel.push(id);
    cambiarDoc(doc => { doc.galeria = sel; });
    dibujar();
  }
  function setDato(k, v) {
    cambiarDatos(d => { d[k] = String(v || "").trim(); });
    const campo = { contrato: "contratoNic", consumo: "consumoMax" }[k];
    if (campo && $(campo)) $(campo).value = String(v || "").trim();
    dibujar();
  }
  function restaurarTodo() {
    if (!confirm("¿Volver todos los textos a como los pone el cotizador? Se pierden los cambios hechos a mano en esta opción.")) return;
    cambiarDoc(doc => { doc.edits = {}; });
    dibujar();
  }
  async function conEspera(msg, fn) {
    showToast(msg, "info");
    try { await fn(); } catch (e) { showToast(String(e.message || e), "error"); }
  }
  function subirFactura(input) {
    const file = input.files && input.files[0]; input.value = "";
    if (!file) return;
    conEspera("Subiendo la factura…", async () => {
      const imgs = await archivoAImagenes(file, 1400, 1);
      const id = "factura_" + estado.propId + "_" + Date.now();
      const viejo = (readQuotes().find(p => p.id === estado.propId) || {}).datos?.facturaId;
      await putArchivo(id, { tipo: "factura", nombre: file.name, paginas: imgs });
      cambiarDatos(d => { d.facturaId = id; });
      cambiarDoc(doc => { delete doc.pag.factura; });
      if (viejo) delArchivo(viejo);
      showToast("Factura agregada", "success");
      await dibujar();
    });
  }
  function quitarFactura() {
    const viejo = (readQuotes().find(p => p.id === estado.propId) || {}).datos?.facturaId;
    cambiarDatos(d => { delete d.facturaId; });
    if (viejo) delArchivo(viejo);
    dibujar();
  }
  async function agregarFicha(file) {
    const imgs = await archivoAImagenes(file, 1275, 6);
    const id = "f" + Date.now();
    await putArchivo("ficha_" + id, { tipo: "ficha", nombre: file.name, paginas: imgs });
    biblio().fichas.push({ id, nombre: file.name.replace(/\.[^.]+$/, ""), cat: 6, paginas: imgs.length, completa: false, siempre: "", equipos: [] });
    saveSettings();
    return id;
  }
  function subirFicha(input) {
    const file = input.files && input.files[0]; input.value = "";
    if (!file) return;
    conEspera("Procesando la ficha…", async () => {
      const id = await agregarFicha(file);
      cambiarDoc(doc => { doc.fichas[id] = true; });
      showToast("Ficha agregada", "success");
      await dibujar();
    });
  }
  async function agregarFotos(files) {
    const ids = [];
    for (const file of files) {
      const imgs = await archivoAImagenes(file, 1400, 1);
      const id = "g" + Date.now() + Math.floor(Math.random() * 1000);
      await putArchivo("foto_" + id, { tipo: "foto", nombre: file.name, paginas: imgs });
      biblio().galeria.push({ id, nombre: file.name.replace(/\.[^.]+$/, "") });
      ids.push(id);
    }
    saveSettings();
    return ids;
  }
  function subirFotos(input) {
    const files = [...(input.files || [])]; input.value = "";
    if (!files.length) return;
    conEspera(files.length > 1 ? `Subiendo ${files.length} fotos…` : "Subiendo la foto…", async () => {
      const ids = await agregarFotos(files);
      const sel = galeriaElegida(ultimoCtx).concat(ids);
      cambiarDoc(doc => { doc.galeria = sel; });
      showToast("Fotos agregadas", "success");
      await dibujar();
    });
  }
  function borrarFoto(id) {
    if (!confirm("¿Borrar esta foto de la biblioteca? Se quita de todas las propuestas.")) return;
    settings.galeria = settings.galeria.filter(g => g.id !== id);
    saveSettings();
    delArchivo("foto_" + id);
    if (estado) dibujar(); else if (typeof renderSettings === "function") renderSettings();
  }

  // Cuando cambia algo en el cotizador con la propuesta abierta
  const refrescar = () => { if (estado && $("ppOverlay").style.display !== "none" && !document.querySelector("#ppPages .pp-t:focus")) dibujar(); };

  // ---------------------------------------------------------------------
  // Tarjeta para "Precios y Reglas": biblioteca de fichas y fotos
  // ---------------------------------------------------------------------
  function htmlAjustes() {
    biblio();
    const equiposOpts = [
      ...settings.inverters.map(i => ({ id: i.id, nombre: i.name, grupo: "Inversores" })),
      ...settings.batteries.map(b => ({ id: b.id, nombre: b.name, grupo: "Baterías" }))
    ];
    const chip = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-orange-50 text-orange-800 border border-orange-200";
    const filas = settings.fichas.slice().sort((a, b) => (a.cat || 6) - (b.cat || 6)).map(f => {
      const idx = settings.fichas.indexOf(f);
      const eq = (f.equipos || []).map(id => { const e = equiposOpts.find(x => x.id === id); return e ? `<span class="${chip}">${esc(e.nombre)}<button type="button" onclick="FEGPropuesta.quitarEquipo(${idx}, '${esc(id)}')" class="font-bold text-orange-400 hover:text-rose-600">&times;</button></span>` : ""; }).join(" ");
      const regla = f.siempre === "todos" ? "Siempre" : f.siempre === "paneles" ? "Siempre que haya paneles" : f.siempre === "panel" ? "panel" : "";
      const inp = "w-16 px-1.5 py-1 text-[11px] text-center bg-white border border-slate-200 rounded-md";
      const panelCfg = f.siempre === "panel" ? `<span class="text-[11px] text-slate-500">marca</span>
          <select onchange="FEGPropuesta.setFichaCampo(${idx}, 'marca', this.value)" class="px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-md">${MARCAS_PANEL.concat((f.marca && !MARCAS_PANEL.includes(f.marca)) ? [f.marca] : []).map(m => `<option ${m === f.marca ? "selected" : ""}>${esc(m)}</option>`).join("")}</select>
          <span class="text-[11px] text-slate-500">de</span><input type="number" value="${f.wMin || 0}" onchange="FEGPropuesta.setFichaCampo(${idx}, 'wMin', this.value)" class="${inp}">
          <span class="text-[11px] text-slate-500">a</span><input type="number" value="${f.wMax || 0}" onchange="FEGPropuesta.setFichaCampo(${idx}, 'wMax', this.value)" class="${inp}"><span class="text-[11px] text-slate-500">W</span>` : "";
      return `<div class="py-2.5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <input type="text" value="${esc(f.nombre)}" onchange="FEGPropuesta.renombrarFicha(${idx}, this.value)" class="flex-1 min-w-0 px-2 py-1 text-xs font-semibold text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-300 rounded-md focus:outline-none" />
          <span class="text-[10px] text-slate-400 whitespace-nowrap">${CATS[f.cat || 6]} • ${f.paginas || 1} pág.</span>
          ${esPropia(f) ? `<button type="button" onclick="FEGPropuesta.borrarFicha(${idx})" title="Borrar ficha" class="text-slate-300 hover:text-rose-600 font-bold px-1">&times;</button>` : ""}
        </div>
        <div class="flex flex-wrap items-center gap-1.5 mt-1.5 pl-2">
          <select onchange="FEGPropuesta.setSiempre(${idx}, this.value)" class="px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-md">
            <option value="" ${!f.siempre ? "selected" : ""}>Sale con estos equipos:</option>
            <option value="paneles" ${f.siempre === "paneles" ? "selected" : ""}>Sale siempre que haya paneles</option>
            <option value="todos" ${f.siempre === "todos" ? "selected" : ""}>Sale siempre</option>
            <option value="panel" ${f.siempre === "panel" ? "selected" : ""}>Es ficha de panel:</option>
          </select>
          ${panelCfg}
          ${regla ? "" : eq}
          ${regla ? "" : `<select onchange="FEGPropuesta.agregarEquipo(${idx}, this.value); this.value=''" class="px-2 py-1 text-[11px] bg-white border border-dashed border-slate-300 rounded-md text-slate-500">
            <option value="">+ equipo</option>
            ${["Inversores", "Baterías"].map(g => `<optgroup label="${g}">${equiposOpts.filter(e => e.grupo === g && !(f.equipos || []).includes(e.id)).map(e => `<option value="${esc(e.id)}">${esc(e.nombre)}</option>`).join("")}</optgroup>`).join("")}
          </select>`}
        </div></div>`;
    }).join("");
    const fotos = settings.galeria.map(g => `<div class="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100" style="aspect-ratio:16/10">
        <img data-foto-aj="${esc(g.id)}" ${esPropia(g) ? "" : `src="${BASE}galeria/${g.id}.jpg"`} alt="" class="w-full h-full object-cover">
        ${esPropia(g) ? `<button type="button" onclick="FEGPropuesta.borrarFoto('${esc(g.id)}')" class="absolute top-1 right-1.5 text-white font-bold" style="text-shadow:0 0 3px #000" title="Borrar">&times;</button>` : ""}
      </div>`).join("");
    return `<div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
      <div class="flex items-center justify-between mb-2 gap-2">
        <div><h3 class="text-xs font-semibold text-slate-900 uppercase tracking-wider">Fichas técnicas de la propuesta</h3>
        <p class="text-[11px] text-slate-500 mt-0.5">Cada ficha sale sola en la propuesta cuando la cotización lleva esos equipos. En cada propuesta igual puedes quitarla o agregar otra.</p></div>
        <label class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 whitespace-nowrap cursor-pointer">+ Ficha (PDF o imagen)<input type="file" accept="image/*,application/pdf" class="hidden" onchange="FEGPropuesta.subirFichaAjustes(this)"></label>
      </div>
      <div class="max-w-2xl">${filas}</div>
    </div>
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
      <div class="flex items-center justify-between mb-3 gap-2">
        <div><h3 class="text-xs font-semibold text-slate-900 uppercase tracking-wider">Fotos de proyectos</h3>
        <p class="text-[11px] text-slate-500 mt-0.5">Fotos para la página de galería. En cada propuesta eliges cuáles van.</p></div>
        <label class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 whitespace-nowrap cursor-pointer">+ Fotos<input type="file" accept="image/*" multiple class="hidden" onchange="FEGPropuesta.subirFotosAjustes(this)"></label>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">${fotos}</div>
    </div>`;
  }
  async function pintarFotosAjustes() {
    for (const img of document.querySelectorAll("img[data-foto-aj]:not([src])")) {
      const a = await getArchivo("foto_" + img.dataset.fotoAj);
      if (a && a.paginas && a.paginas[0]) img.src = a.paginas[0];
    }
  }
  function renderAjustes() {
    const box = $("propuestaAjustes");
    if (!box) return;
    box.innerHTML = htmlAjustes();
    pintarFotosAjustes();
  }
  const trasCambioFicha = () => { saveSettings(); renderAjustes(); };

  window.FEGPropuesta = {
    abrir, cerrar, imprimir, refrescar, renderAjustes,
    togglePagina, toggleFicha, toggleFoto, setDato, restaurarTodo,
    subirFactura, quitarFactura, subirFicha, subirFotos, borrarFoto,
    renombrarFicha(i, v) { settings.fichas[i].nombre = String(v).trim() || settings.fichas[i].nombre; trasCambioFicha(); },
    setFichaCampo(i, k, v) { const f = settings.fichas[i]; f[k] = k === "marca" ? v : (parseFloat(v) || 0); if (k === "marca" && !f.cat) f.cat = 1; trasCambioFicha(); },
    setSiempre(i, v) { const f = settings.fichas[i]; f.siempre = v; if (v === "panel" && !f.marca) { f.marca = MARCAS_PANEL[0]; f.wMin = 0; f.wMax = 9999; f.cat = 1; } trasCambioFicha(); },
    agregarEquipo(i, id) { if (!id) return; const f = settings.fichas[i]; f.equipos = (f.equipos || []).concat(id); trasCambioFicha(); },
    quitarEquipo(i, id) { const f = settings.fichas[i]; f.equipos = (f.equipos || []).filter(x => x !== id); trasCambioFicha(); },
    borrarFicha(i) {
      const f = settings.fichas[i];
      if (!f || !esPropia(f) || !confirm(`¿Borrar la ficha "${f.nombre}"?`)) return;
      settings.fichas.splice(i, 1); delArchivo("ficha_" + f.id); trasCambioFicha();
    },
    subirFichaAjustes(input) {
      const file = input.files && input.files[0]; input.value = "";
      if (!file) return;
      conEspera("Procesando la ficha…", async () => { await agregarFicha(file); renderAjustes(); showToast("Ficha agregada. Elige con qué equipos sale.", "success"); });
    },
    subirFotosAjustes(input) {
      const files = [...(input.files || [])]; input.value = "";
      if (!files.length) return;
      conEspera("Subiendo fotos…", async () => { await agregarFotos(files); renderAjustes(); showToast("Fotos agregadas", "success"); });
    },
    _ctx: () => ultimoCtx
  };
})();
