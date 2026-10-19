chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'summarizeYouTube') {
    resumirYouTube(msg.url).then(sendResponse).catch(e => sendResponse({ error: e.message }));
    return true;
  }
  if (msg.action === 'aiChat') {
    llamarGemini(msg.messages, msg.apiKey, msg.lang)
      .then(res => sendResponse(res))
      .catch(e => sendResponse({ error: e.message }));
    return true;
  }
});

/* ---------- YouTube ---------- */
async function resumirYouTube(url) {
  const videoId = extraerId(url);
  if (!videoId) throw new Error('URL de YouTube inválida');
  const transcript = await obtenerTranscripcion(videoId);
  if (!transcript) throw new Error('Este video no tiene subtítulos disponibles');
  const resumen = resumirTexto(transcript, 6);
  return { resumen, transcripcion: transcript.slice(0, 400) + '…' };
}

function extraerId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    return u.searchParams.get('v');
  } catch { return null; }
}

async function obtenerTranscripcion(videoId) {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=es`);
  const html = await res.text();

  const match = html.match(/"captionTracks":\s*(\[[^\]]+\])/);
  if (!match) return null;
  let tracks;
  try { tracks = JSON.parse(match[1]); } catch { return null; }
  if (!tracks.length) return null;

  const track = tracks.find(t => t.languageCode === 'es') ||
                tracks.find(t => t.languageCode === 'en') ||
                tracks[0];

  const capRes = await fetch(track.baseUrl);
  const xml = await capRes.text();

  const texts = [...xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)]
    .map(m => decodificarEntidades(m[1].replace(/<[^>]+>/g, '')).trim())
    .filter(Boolean);

  return texts.join(' ').replace(/\s+/g, ' ').trim();
}

function decodificarEntidades(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)));
}

/* ---------- Resumen extractivo ---------- */
function resumirTexto(texto, n = 6) {
  const oraciones = texto.match(/[^.!?]+[.!?]+/g) || [texto];
  if (oraciones.length <= n) return oraciones.join(' ');

  const stop = new Set(('el la los las un una y o de a en que es por con para del al se su this the a an of to in and or is are it that for on with as by at from be was were has have had do does did will would can could should may might must o a os as um uma de do da dos das em no na nos nas para por com e ou se sua seu').split(' '));
  const freq = {};
  oraciones.forEach(s => s.toLowerCase().split(/\W+/).forEach(w => { if (w.length > 3 && !stop.has(w)) freq[w] = (freq[w] || 0) + 1; }));

  const scored = oraciones.map((s, i) => {
    const palabras = s.toLowerCase().split(/\W+/).filter(Boolean);
    const score = palabras.reduce((a, w) => a + (freq[w] || 0), 0) / Math.sqrt(palabras.length || 1);
    return { s: s.trim(), score, i };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, n).sort((a, b) => a.i - b.i).map(x => x.s).join(' ');
}

/* ---------- Gemini ---------- */
async function llamarGemini(messages, apiKey, lang) {
  const sistema = lang === 'en'
    ? 'You are EZPack AI, a friendly and useful assistant. Answer in English. Be concise, use markdown for code and lists.'
    : lang === 'pt'
    ? 'Você é EZPack AI, um assistente amigável e útil. Responda em português. Seja conciso, use markdown.'
    : 'Eres EZPack AI, un asistente amigable y útil. Responde en español. Sé conciso, usa markdown.';

  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=' + apiKey,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sistema }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
      })
    }
  );

  if (!res.ok) {
    const err = await res.text();
    let msg = err;
    try { const j = JSON.parse(err); msg = j.error?.message || err; } catch {}
    throw new Error('Gemini API (' + res.status + '): ' + msg.slice(0, 200));
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini no devolvió respuesta');
  return { text };
}