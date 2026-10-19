const $ = id => document.getElementById(id);
const t = k => chrome.i18n.getMessage(k) || k;
const LANG = (chrome.i18n.getUILanguage() || 'es').slice(0, 2);

let modo = 'Amigable';
let historial = [];
let procesando = false;

/* ---------- i18n ---------- */
function cargarTextos() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('.mode-btn').forEach(b => {
    b.textContent = t('mode' + b.dataset.mode);
  });
  $('userInput').placeholder = t('placeholder');
}

/* ---------- Utilidades ---------- */
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function renderMarkdown(txt) {
  let h = esc(txt);
  h = h.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  h = h.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  h = h.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
  h = h.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<i>$2</i>');
  h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  h = h.replace(/(^|[\s>])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  h = h.replace(/\n/g, '<br>');
  return h;
}

function agregarMensaje(texto, tipo, esHTML = false) {
  const div = document.createElement('div');
  div.className = 'message ' + tipo;
  div.innerHTML = esHTML ? texto : renderMarkdown(texto);
  $('chat').appendChild(div);
  $('chat').scrollTop = $('chat').scrollHeight;
  historial.push({ tipo, contenido: texto, esHTML });
  guardarHistorial();
}

function guardarHistorial() {
  chrome.storage.local.set({ historial: historial.slice(-100) });
}

/* ---------- Matemáticas (parser seguro) ---------- */
function calcularSeguro(expr) {
  const s = expr.replace(/,/g, '.').replace(/×/g, '*').replace(/÷/g, '/').toLowerCase();
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) { let n = ''; while (i < s.length && /[0-9.]/.test(s[i])) n += s[i++]; tokens.push({ tipo: 'num', val: parseFloat(n) }); continue; }
    if ('+-*/%^()'.includes(c)) { tokens.push({ tipo: c }); i++; continue; }
    const funcs = ['sqrt','sin','cos','tan','log','ln','abs','round','floor','ceil','exp'];
    let matched = false;
    for (const f of funcs) {
      if (s.substr(i, f.length) === f) { tokens.push({ tipo: 'func', val: f }); i += f.length; matched = true; break; }
    }
    if (matched) continue;
    if (s.substr(i, 2) === 'pi') { tokens.push({ tipo: 'num', val: Math.PI }); i += 2; continue; }
    throw new Error('carácter inválido: ' + c);
  }
  let pos = 0;
  const peek = () => tokens[pos], next = () => tokens[pos++];
  function expr() { let l = term(); while (peek() && ['+','-'].includes(peek().tipo)) { const op = next().tipo; const r = term(); l = op === '+' ? l + r : l - r; } return l; }
  function term() { let l = factor(); while (peek() && ['*','/','%'].includes(peek().tipo)) { const op = next().tipo; const r = factor(); l = op === '*' ? l * r : op === '/' ? l / r : l % r; } return l; }
  function factor() { let b = unary(); if (peek() && peek().tipo === '^') { next(); b = Math.pow(b, factor()); } return b; }
  function unary() { if (peek() && peek().tipo === '-') { next(); return -unary(); } return primary(); }
  function primary() {
    const tk = peek(); if (!tk) throw new Error('incompleto');
    if (tk.tipo === '(') { next(); const v = expr(); if (!peek() || peek().tipo !== ')') throw new Error('falta )'); next(); return v; }
    if (tk.tipo === 'func') { const f = next().val; if (!peek() || peek().tipo !== '(') throw new Error('falta ('); next(); const v = expr(); if (!peek() || peek().tipo !== ')') throw new Error('falta )'); next();
      const m = { sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan, log: Math.log, ln: Math.log, abs: Math.abs, round: Math.round, floor: Math.floor, ceil: Math.ceil, exp: Math.exp };
      return m[f](v);
    }
    if (tk.tipo === 'num') { next(); return tk.val; }
    throw new Error('token inesperado');
  }
  const r = expr();
  if (pos !== tokens.length) throw new Error('sobran símbolos');
  if (!isFinite(r)) throw new Error('resultado inválido');
  return Math.round(r * 1e10) / 1e10;
}

/* ---------- Biología ---------- */
const BIOLOGIA = {
  'celula': {
    es: 'La **célula** es la unidad básica de la vida. Hay dos tipos: **procariotas** (sin núcleo, como bacterias) y **eucariotas** (con núcleo, como células animales y vegetales).',
    en: 'The **cell** is the basic unit of life. Two types: **prokaryotes** (no nucleus, like bacteria) and **eukaryotes** (with nucleus, like animal/plant cells).',
    pt: 'A **célula** é a unidade básica da vida. Dois tipos: **procariontes** (sem núcleo, como bactérias) e **eucariontes** (com núcleo, como células animais/vegetais).'
  },
  'adn': {
    es: 'El **ADN** (ácido desoxirribonucleico) contiene la información genética. Es una **doble hélice** formada por nucleótidos (A, T, C, G).',
    en: '**DNA** (deoxyribonucleic acid) holds genetic information. It is a **double helix** made of nucleotides (A, T, C, G).',
    pt: 'O **DNA** (ácido desoxirribonucleico) contém a informação genética. É uma **dupla hélice** formada por nucleotídeos (A, T, C, G).'
  },
  'fotosintesis': {
    es: 'La **fotosíntesis** convierte luz solar, CO₂ y agua en glucosa y oxígeno. Ocurre en los **cloroplastos** de las plantas.',
    en: '**Photosynthesis** turns sunlight, CO₂ and water into glucose and oxygen. It happens in plant **chloroplasts**.',
    pt: 'A **fotossíntese** transforma luz solar, CO₂ e água em glicose e oxigênio. Ocorre nos **cloroplastos** das plantas.'
  },
  'mitosis': {
    es: 'La **mitosis** es la división celular que produce dos células hijas idénticas. Fases: profase, metafase, anafase y telofase.',
    en: '**Mitosis** is cell division producing two identical daughter cells. Phases: prophase, metaphase, anaphase, telophase.',
    pt: 'A **mitose** é a divisão celular que produz duas células-filhas idênticas. Fases: prófase, metáfase, anáfase, telófase.'
  },
  'evolucion': {
    es: 'La **evolución** es el cambio en las poblaciones a lo largo del tiempo. **Darwin** propuso la **selección natural** como mecanismo.',
    en: '**Evolution** is change in populations over time. **Darwin** proposed **natural selection** as the mechanism.',
    pt: 'A **evolução** é a mudança nas populações ao longo do tempo. **Darwin** propôs a **seleção natural** como mecanismo.'
  },
  'respiracion': {
    es: 'La **respiración celular** convierte glucosa y oxígeno en ATP, CO₂ y agua. Ocurre en las **mitocondrias**.',
    en: '**Cellular respiration** turns glucose and oxygen into ATP, CO₂ and water. It happens in **mitochondria**.',
    pt: 'A **respiração celular** transforma glicose e oxigênio em ATP, CO₂ e água. Ocorre nas **mitocôndrias**.'
  },
  'proteina': {
    es: 'Las **proteínas** están formadas por aminoácidos. Cumplen funciones estructurales, enzimáticas y de transporte.',
    en: '**Proteins** are made of amino acids. They perform structural, enzymatic and transport functions.',
    pt: 'As **proteínas** são formadas por aminoácidos. Têm funções estruturais, enzimáticas e de transporte.'
  },
  'sistema nervioso': {
    es: 'El **sistema nervioso** coordina el cuerpo. Se divide en **central** (cerebro y médula) y **periférico** (nervios).',
    en: 'The **nervous system** coordinates the body. Divided into **central** (brain, spinal cord) and **peripheral** (nerves).',
    pt: 'O **sistema nervoso** coordena o corpo. Divide-se em **central** (cérebro, medula) e **periférico** (nervos).'
  }
};

function responderBiologia(texto) {
  const tN = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [k, v] of Object.entries(BIOLOGIA)) {
    if (tN.includes(k)) return v[LANG] || v.es;
  }
  return null;
}

/* ---------- Chistes ---------- */
const CHISTES = {
  es: ["¿Por qué los pájaros no usan Facebook? Porque ya tienen Twitter. 🐦", "¿Qué le dijo un semáforo a otro? No me mires, me estoy cambiando. 🚦"],
  en: ["Why don't birds use Facebook? They already have Twitter. 🐦", "What did one traffic light say to the other? Stop looking, I'm changing! 🚦"],
  pt: ["Por que os pássaros não usam Facebook? Porque já têm Twitter. 🐦", "O que um semáforo disse ao outro? Pare de olhar, estou mudando! 🚦"]
};

/* ---------- Comandos locales ---------- */
function ejecutarComandoLocal(texto) {
  const tN = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (tN.includes('hora') && !tN.includes('en ')) return `⏰ Son las **${new Date().toLocaleTimeString(LANG, { hour: '2-digit', minute: '2-digit' })}**.`;
  if (tN.includes('fecha') || tN.includes('que dia')) return `📅 Hoy es **${new Date().toLocaleDateString(LANG, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**.`;

  if (/^(mate:|mate |\d)/.test(tN) || /^[\d\s+\-*/%^().]+$/.test(tN)) {
    const expr = tN.replace(/^mate:\s*/, '').replace(/^mate\s+/, '');
    try { return `🧮 \`${expr}\` = **${calcularSeguro(expr)}**`; } catch (e) { /* sigue */ }
  }

  const m = texto.match(/porcentaje\s+([\d.,]+)\s*(?:%|por ciento)?\s*de\s+([\d.,]+)/i);
  if (m) return `📊 El **${m[1]}%** de **${m[2]}** = **${(parseFloat(m[1].replace(',', '.')) * parseFloat(m[2].replace(',', '.'))) / 100}**`;

  if (tN.includes('dado')) return `🎲 Salió **${Math.floor(Math.random() * 6) + 1}**.`;
  if (tN.includes('moneda')) return `🪙 Salió **${Math.random() < 0.5 ? 'cara' : 'cruz'}**.`;
  if (tN.includes('contrasena')) return `🔑 \`${Array.from(crypto.getRandomValues(new Uint8Array(16))).map(n => 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*'[n % 68]).join('')}\``;
  if (tN.includes('uuid')) return `🆔 \`${crypto.randomUUID()}\``;
  if (tN.includes('chiste')) return CHISTES[LANG]?.[Math.floor(Math.random() * CHISTES[LANG].length)] || CHISTES.es[0];
  if (tN.includes('ayuda') || tN === '?') return ayudaTexto();

  const bio = responderBiologia(texto);
  if (bio) return bio;

  if (tN.includes('abrir youtube')) { window.open('https://youtube.com', '_blank'); return '📺 Abriendo YouTube.'; }
  if (tN.includes('abrir google')) { window.open('https://google.com', '_blank'); return '🔎 Abriendo Google.'; }

  return null;
}

function ayudaTexto() {
  if (LANG === 'en') return `**Help**\n- ⏰ \`hora\` / 📅 \`fecha\`\n- 🧮 \`mate: 45*12+8\` (or any operation)\n- 🧬 \`biologia ¿qué es la célula?\`\n- 📺 \`resumir video\` + paste YouTube URL\n- 🎲 \`dado\`, \`moneda\`, \`uuid\`, \`contraseña 16\`\n- 😂 \`chiste\`\n- 💡 For *any* other question, add your Gemini API key in ⚙️ settings.`;
  if (LANG === 'pt') return `**Ajuda**\n- ⏰ \`hora\` / 📅 \`data\`\n- 🧮 \`mate: 45*12+8\` (ou qualquer operação)\n- 🧬 \`biologia o que é a célula?\`\n- 📺 \`resumir vídeo\` + cole URL do YouTube\n- 🎲 \`dado\`, \`moeda\`, \`uuid\`, \`senha 16\`\n- 😂 \`piada\`\n- 💡 Para qualquer outra pergunta, adicione sua API Key Gemini em ⚙️.`;
  return `**Ayuda**\n- ⏰ \`hora\` / 📅 \`fecha\`\n- 🧮 \`mate: 45*12+8\` (o cualquier operación)\n- 🧬 \`biologia ¿qué es la célula?\`\n- 📺 \`resumir video\` + pega URL de YouTube\n- 🎲 \`dado\`, \`moneda\`, \`uuid\`, \`contraseña 16\`\n- 😂 \`chiste\`\n- 💡 Para cualquier otra pregunta, agrega tu API Key de Gemini en ⚙️.`;
}

/* ---------- YouTube ---------- */
async function resumirVideoActual() {
  if (procesando) return;
  procesando = true;
  $('sendBtn').disabled = true;
  agregarMensaje(t('summarizing'), 'ai');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.url || !/youtube\.com\/watch|youtu\.be\//.test(tab.url)) {
      agregarMensaje(LANG === 'en' ? 'Open a YouTube video first.' : LANG === 'pt' ? 'Abra um vídeo do YouTube primeiro.' : 'Abre un video de YouTube primero.', 'ai');
      return;
    }
    const resp = await chrome.runtime.sendMessage({ action: 'summarizeYouTube', url: tab.url });
    if (resp.error) {
      agregarMensaje('❌ ' + resp.error, 'ai');
    } else {
      agregarMensaje('📺 **' + (LANG === 'en' ? 'Summary' : LANG === 'pt' ? 'Resumo' : 'Resumen') + ':**\n\n' + resp.resumen, 'ai');
    }
  } catch (e) {
    agregarMensaje('❌ ' + e.message, 'ai');
  } finally {
    procesando = false;
    $('sendBtn').disabled = false;
  }
}

/* ---------- Envío ---------- */
async function enviar() {
  if (procesando) return;
  const txt = $('userInput').value.trim();
  if (!txt) return;
  $('userInput').value = '';
  agregarMensaje(txt, 'user');
  procesando = true;
  $('sendBtn').disabled = true;

  try {
    // 1. Comandos locales (rápidos, sin red)
    const local = ejecutarComandoLocal(txt);
    if (local) { agregarMensaje(local, 'ai'); return; }

    // 2. API Key configurada → IA real
    const { apiKey } = await chrome.storage.local.get('apiKey');
    if (apiKey) {
      const resp = await chrome.runtime.sendMessage({ action: 'aiChat', messages: historial.slice(-10).map(m => ({ role: m.tipo === 'user' ? 'user' : 'assistant', content: m.contenido })), apiKey, lang: LANG });
      if (resp.error) agregarMensaje('❌ ' + resp.error, 'ai');
      else agregarMensaje(resp.text, 'ai');
      return;
    }

    // 3. Fallback por modo
    if (modo === 'Meme') { agregarMensaje('¡Jajaja qué buena onda! 😎📦 Pero para *eso* necesito que agregues tu API Key en ⚙️, o pídeme algo de mi lista (hora, mate, biología, resumir video).', 'ai'); return; }
    if (modo === 'Mate') { agregarMensaje('🧮 Modo Mate: escribe la operación directa, ej. `mate: 45*12+8`.', 'ai'); return; }
    agregarMensaje(ayudaTexto(), 'ai');
  } catch (e) {
    agregarMensaje('❌ ' + e.message, 'ai');
  } finally {
    procesando = false;
    $('sendBtn').disabled = false;
    $('userInput').focus();
  }
}

/* ---------- Settings ---------- */
function toggleSettings() { $('settingsPanel').classList.toggle('open'); }

async function guardarSettings() {
  const apiKey = $('apiKeyInput').value.trim();
  await chrome.storage.local.set({ apiKey });
  $('settingsPanel').classList.remove('open');
}

function toggleTema() {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  const nuevo = cur === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', nuevo);
  chrome.storage.local.set({ tema: nuevo });
  $('themeBtn').textContent = nuevo === 'light' ? '☀️' : '🌙';
}

async function limpiarChat() {
  historial = [];
  await chrome.storage.local.remove('historial');
  $('chat').innerHTML = '';
  agregarMensaje(t('greeting'), 'ai');
}

function expandir() {
  chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
}

/* ---------- Init ---------- */
async function init() {
  cargarTextos();

  const { historial: h, tema, apiKey, modoGuardado } = await chrome.storage.local.get(['historial', 'tema', 'apiKey', 'modoGuardado']);
  if (tema) { document.documentElement.setAttribute('data-theme', tema); $('themeBtn').textContent = tema === 'light' ? '☀️' : '🌙'; }
  if (apiKey) $('apiKeyInput').value = apiKey;
  if (modoGuardado) { modo = modoGuardado; document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === modo)); }

  if (h && h.length) {
    historial = h;
    h.forEach(m => {
      const div = document.createElement('div');
      div.className = 'message ' + m.tipo;
      div.innerHTML = m.esHTML ? m.contenido : renderMarkdown(m.contenido);
      $('chat').appendChild(div);
    });
    $('chat').scrollTop = $('chat').scrollHeight;
  } else {
    agregarMensaje(t('greeting'), 'ai');
  }

  // Modos
  document.querySelectorAll('.mode-btn').forEach(b => {
    b.addEventListener('click', () => {
      modo = b.dataset.mode;
      chrome.storage.local.set({ modoGuardado: modo });
      document.querySelectorAll('.mode-btn').forEach(x => x.classList.toggle('active', x === b));
    });
  });

  // Chips
  document.querySelectorAll('.chips [data-prompt]').forEach(b => {
    b.addEventListener('click', () => { $('userInput').value = b.dataset.prompt; enviar(); });
  });

  $('summarizeBtn').addEventListener('click', resumirVideoActual);
  $('sendBtn').addEventListener('click', enviar);
  $('userInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); enviar(); } });
  $('settingsBtn').addEventListener('click', toggleSettings);
  $('themeBtn').addEventListener('click', toggleTema);
  $('expandBtn').addEventListener('click', expandir);
  $('saveSettings').addEventListener('click', guardarSettings);
  $('clearChat').addEventListener('click', limpiarChat);
}

init();