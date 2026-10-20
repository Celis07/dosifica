/* ===================== TABATA / INTERVALOS (oct 2026) =====================
   Cronómetro de intervalos estilo iOS, para deportista y fisio.
   Configura: preparación, trabajo, descanso, número de ejercicios, número de series y
   descanso entre series (más los nombres de los ejercicios, opcionales).
   Corre a pantalla completa con el color de la fase, anillo de progreso, cuenta regresiva grande,
   pitidos (3-2-1, inicio de trabajo y de descanso, final), voz opcional y vibración en Android.
   El tiempo se calcula con la hora real, así que no se desfasa aunque el celular vaya lento.
   Se abre desde Inicio (Tabata), desde un bloque Intermitente del plan y desde el panel del fisio. */

const TB_KEY = 'apex_tabata';
const TB_DEF = {prep:10, work:20, rest:10, ex:8, sets:1, srest:60, sound:true, voice:false, vib:true, names:[]};
const TB_PRESETS = [
  ['Tabata 20/10', {work:20, rest:10, ex:8, sets:1}],
  ['30/30', {work:30, rest:30, ex:6, sets:2}],
  ['40/20', {work:40, rest:20, ex:5, sets:3}],
  ['45/15', {work:45, rest:15, ex:6, sets:2}]
];
const TB_LIM = {prep:[0,60,5], work:[5,600,5], rest:[0,600,5], ex:[1,30,1], sets:[1,20,1], srest:[0,600,15]};
const TB_COL = {prep:'prep', work:'work', rest:'rest', srest:'srest', done:'done'};
let TB = null;   // {cfg, screen:'setup'|'run'|'done', ph:[], i, end, left, paused, ac, wake, lastBeep, source}

function tbLoad(){ try{ return Object.assign({}, TB_DEF, JSON.parse(LS.get(TB_KEY) || '{}')); }catch(e){ return Object.assign({}, TB_DEF); } }
function tbSave(c){ try{ const {names, ...rest} = c; LS.set(TB_KEY, JSON.stringify(rest)); }catch(e){} }
const tbFmt = s => { s = Math.max(0, Math.ceil(s)); const m = Math.floor(s / 60), r = s % 60; return m ? `${m}:${String(r).padStart(2, '0')}` : String(r); };
const tbFmtLong = s => { s = Math.max(0, Math.round(s)); const m = Math.floor(s / 60), r = s % 60; return `${m}:${String(r).padStart(2, '0')}`; };
function tbTotal(c){ return c.prep + c.sets * (c.ex * c.work + (c.ex - 1) * c.rest) + (c.sets - 1) * c.srest; }
function tbName(c, k){ const n = (c.names || [])[k]; return n && n.trim() ? n.trim() : `Ejercicio ${k + 1}`; }
function tbPhases(c){
  const P = [];
  if(c.prep > 0) P.push({k:'prep', d:c.prep, ex:0, set:0});
  for(let s = 0; s < c.sets; s++){
    for(let e = 0; e < c.ex; e++){
      P.push({k:'work', d:c.work, ex:e, set:s});
      if(e < c.ex - 1 && c.rest > 0) P.push({k:'rest', d:c.rest, ex:e + 1, set:s});
    }
    if(s < c.sets - 1 && c.srest > 0) P.push({k:'srest', d:c.srest, ex:0, set:s + 1});
  }
  P.push({k:'done', d:0, ex:0, set:c.sets - 1});
  return P;
}

/* ---------- Sonido, voz y vibración ---------- */
function tbAudio(){
  if(TB.ac) return TB.ac;
  const C = window.AudioContext || window.webkitAudioContext; if(!C) return null;
  try{ if(navigator.audioSession) navigator.audioSession.type = 'playback'; }catch(e){}   // iPhone: que suene aunque esté en silencio
  TB.ac = new C(); return TB.ac;
}
function tbTone(freq, dur, when = 0, vol = .22, type = 'sine'){
  if(!TB || !TB.cfg.sound) return;
  const ac = tbAudio(); if(!ac) return;
  try{ const t0 = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + dur + .02); }catch(e){}
}
function tbVib(p){ if(TB && TB.cfg.vib) try{ navigator.vibrate && navigator.vibrate(p); }catch(e){} }
function tbSay(t){
  if(!TB || !TB.cfg.voice || !('speechSynthesis' in window)) return;
  try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'es-ES'; u.rate = 1.05; speechSynthesis.speak(u); }catch(e){}
}
function tbCue(p){
  // al empezar cada fase
  if(p.k === 'work'){ tbTone(1320, .45, 0, .26, 'triangle'); tbVib([200]); tbSay(tbName(TB.cfg, p.ex)); }
  else if(p.k === 'rest'){ tbTone(660, .4); tbVib([90, 60, 90]); tbSay('Descanso'); }
  else if(p.k === 'srest'){ tbTone(660, .35); tbTone(520, .45, .2); tbVib([90, 60, 90]); tbSay('Descanso entre series'); }
  else if(p.k === 'prep'){ tbSay('Prepárate'); }
  else if(p.k === 'done'){ tbTone(784, .18); tbTone(988, .18, .18); tbTone(1318, .5, .36, .26, 'triangle'); tbVib([200, 80, 200, 80, 400]); tbSay('¡Terminado! Buen trabajo'); }
}

/* ---------- Motor ---------- */
function tbNow(){ return performance.now(); }
function tbGo(i, keepPaused){
  if(TB.screen === 'run' && TB.ph[TB.i] && TB.ph[TB.i].k === 'work' && TB.i !== i){   // suma el trabajo realmente hecho
    const cur = TB.ph[TB.i], left = TB.paused ? TB.left : Math.max(0, TB.end - tbNow());
    TB.workMs = (TB.workMs || 0) + Math.max(0, cur.d * 1000 - left);
  }
  TB.i = Math.max(0, Math.min(TB.ph.length - 1, i));
  const p = TB.ph[TB.i]; TB.lastBeep = null; TB.half = false;
  if(p.k === 'done'){ TB.screen = 'done'; tbStopTick(); tbCue(p); tbWakeOff(); tbRender(); return; }
  if(TB.paused || keepPaused){ TB.left = p.d * 1000; } else { TB.end = tbNow() + p.d * 1000; }
  tbCue(p); tbRender();
}
function tbTick(){
  if(!TB || TB.screen !== 'run' || TB.paused) return;
  const p = TB.ph[TB.i], left = (TB.end - tbNow()) / 1000;
  if(left <= 0){ tbGo(TB.i + 1); return; }
  const s = Math.ceil(left);
  if(s <= 3 && s >= 1 && TB.lastBeep !== s){ TB.lastBeep = s; tbTone(880, .12, 0, .2); }
  if(p.k === 'work' && p.d >= 30 && !TB.half && left <= p.d / 2){ TB.half = true; tbTone(1000, .08, 0, .14); tbTone(1000, .08, .14, .14); }
  tbPaint(left);
}
function tbStartTick(){ tbStopTick(); TB.int = setInterval(tbTick, 100); }
function tbStopTick(){ if(TB && TB.int){ clearInterval(TB.int); TB.int = null; } }
async function tbWakeOn(){ try{ if('wakeLock' in navigator && document.visibilityState === 'visible') TB.wake = await navigator.wakeLock.request('screen'); }catch(e){} }
function tbWakeOff(){ try{ TB && TB.wake && TB.wake.release(); }catch(e){} if(TB) TB.wake = null; }
document.addEventListener('visibilitychange', () => { if(TB && TB.screen === 'run' && document.visibilityState === 'visible'){ tbWakeOn(); tbTick(); } });

/* ---------- Pantallas ---------- */
const TB_I = {
  x: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  play: '<svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>',
  pause: '<svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4.2" height="16" rx="1.2" fill="currentColor"/><rect x="13.8" y="4" width="4.2" height="16" rx="1.2" fill="currentColor"/></svg>',
  prev: '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 5v14L8 12z" fill="currentColor"/><rect x="5" y="5" width="2.6" height="14" rx="1" fill="currentColor"/></svg>',
  next: '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14l10-7z" fill="currentColor"/><rect x="16.4" y="5" width="2.6" height="14" rx="1" fill="currentColor"/></svg>',
  snd: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  mute: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
  minus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12M12 6v12"/></svg>'
};
const TB_ROWS = [
  ['prep', 'Preparación', 's', 'Antes de empezar'],
  ['work', 'Trabajo', 's', 'Tiempo de actividad'],
  ['rest', 'Descanso', 's', 'Entre ejercicios'],
  ['ex', 'Ejercicios', '', 'Por serie'],
  ['sets', 'Series', '', 'Vueltas completas'],
  ['srest', 'Descanso entre series', 's', 'Al terminar cada serie']
];
function tbSetup(){
  const c = TB.cfg, tot = tbTotal(c);
  const val = (k, u) => u === 's' ? (c[k] >= 60 ? tbFmtLong(c[k]) : `${c[k]} s`) : String(c[k]);
  return `<div class="tb-setup">
    <header class="tb-bar"><button type="button" class="tb-txt" data-tb="close">Cerrar</button><h1 id="tbT">Intervalos</h1><span class="tb-sp"></span></header>
    ${TB.source ? `<p class="tb-src">${esc(TB.source)}</p>` : ''}
    <div class="tb-total"><span>Duración total</span><b>${tbFmtLong(tot)}</b><span>${c.sets} serie${c.sets > 1 ? 's' : ''} × ${c.ex} ejercicio${c.ex > 1 ? 's' : ''}</span></div>
    <div class="tb-presets" role="group" aria-label="Plantillas">${TB_PRESETS.map(([l, p], i) => `<button type="button" data-tbp="${i}" aria-pressed="${p.work === c.work && p.rest === c.rest && p.ex === c.ex && p.sets === c.sets}">${l}</button>`).join('')}</div>
    <div class="tb-list">${TB_ROWS.map(([k, l, u, h]) => `<div class="tb-row"><span class="tb-l"><b>${l}</b><span>${h}</span></span>
      <span class="tb-step"><button type="button" data-tbs="${k}|-1" aria-label="Menos ${l}">${TB_I.minus}</button><output aria-live="polite" aria-label="${l}">${val(k, u)}</output><button type="button" data-tbs="${k}|1" aria-label="Más ${l}">${TB_I.plus}</button></span></div>`).join('')}</div>
    <details class="tb-names"${(c.names || []).some(Boolean) ? ' open' : ''}><summary>Nombres de los ejercicios <span>(opcional)</span></summary>
      <div class="tb-nl">${Array.from({length:c.ex}, (_, k) => `<label><span>${k + 1}</span><input type="text" data-tbn="${k}" value="${esc((c.names || [])[k] || '')}" placeholder="Ejercicio ${k + 1}" maxlength="40"></label>`).join('')}</div></details>
    <div class="tb-list">
      <label class="tb-row tb-sw"><span class="tb-l"><b>Sonidos</b><span>Pitidos 3-2-1 y al cambiar de fase</span></span><input type="checkbox" role="switch" data-tbo="sound"${c.sound ? ' checked' : ''}></label>
      <label class="tb-row tb-sw"><span class="tb-l"><b>Voz</b><span>Dice el ejercicio y "descanso"</span></span><input type="checkbox" role="switch" data-tbo="voice"${c.voice ? ' checked' : ''}></label>
      ${'vibrate' in navigator ? `<label class="tb-row tb-sw"><span class="tb-l"><b>Vibración</b><span>Al cambiar de fase</span></span><input type="checkbox" role="switch" data-tbo="vib"${c.vib ? ' checked' : ''}></label>` : ''}
    </div>
    <p class="tb-hint">En iPhone, sube el volumen. La pantalla se mantiene encendida mientras corre.</p>
    <div class="tb-go"><button type="button" class="tb-start" data-tb="start">${TB_I.play}<span>Empezar</span></button></div>
  </div>`;
}
const TB_LBL = {prep:'Prepárate', work:'Trabajo', rest:'Descanso', srest:'Descanso entre series'};
function tbRun(){
  const p = TB.ph[TB.i], c = TB.cfg;
  const nextW = TB.ph.slice(TB.i + (p.k === 'work' ? 1 : 0)).find(x => x.k === 'work');
  const sub = p.k === 'prep' ? `Primero: ${tbName(c, 0)}` : p.k === 'work' ? tbName(c, p.ex) : nextW ? `Sigue: ${tbName(c, nextW.ex)}` : '';
  return `<div class="tb-run ph-${TB_COL[p.k]}${TB.paused ? ' paused' : ''}">
    <header class="tb-bar"><button type="button" class="tb-ic" data-tb="stop" aria-label="Terminar">${TB_I.x}</button><span class="tb-rem" id="tbRem"></span><button type="button" class="tb-ic" data-tb="snd" aria-label="${c.sound ? 'Silenciar' : 'Activar sonido'}">${c.sound ? TB_I.snd : TB_I.mute}</button></header>
    <div class="tb-main">
      <p class="tb-ph">${TB_LBL[p.k]}</p>
      <div class="tb-ring"><svg viewBox="0 0 300 300" aria-hidden="true"><circle class="tr" cx="150" cy="150" r="136"/><circle class="v" id="tbArc" cx="150" cy="150" r="136" transform="rotate(-90 150 150)"/></svg>
        <div class="tb-c"><b id="tbSec" role="timer" aria-live="off"></b><span>${TB.paused ? 'En pausa' : ''}</span></div></div>
      <p class="tb-ex">${esc(sub)}</p>
      <div class="tb-meta"><span><b>${p.k === 'prep' ? '–' : p.ex + 1}<small>/${c.ex}</small></b><i>${p.k === 'work' ? 'ejercicio' : 'siguiente'}</i></span><span><b>${p.set + 1}<small>/${c.sets}</small></b><i>serie</i></span></div>
    </div>
    <div class="tb-ctl"><button type="button" class="tb-ic big" data-tb="prev" aria-label="Fase anterior">${TB_I.prev}</button>
      <button type="button" class="tb-pp" data-tb="pause" aria-label="${TB.paused ? 'Seguir' : 'Pausa'}">${TB.paused ? TB_I.play : TB_I.pause}</button>
      <button type="button" class="tb-ic big" data-tb="next" aria-label="Siguiente fase">${TB_I.next}</button></div>
  </div>`;
}
function tbDone(){
  const c = TB.cfg, work = (TB.workMs || 0) / 1000, real = (tbNow() - TB.t0) / 1000;
  return `<div class="tb-run ph-done"><header class="tb-bar"><span class="tb-sp"></span><span class="tb-rem"></span><span class="tb-sp"></span></header>
    <div class="tb-main"><div class="tb-check" aria-hidden="true"><svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12.5l4 4 8-9"/></svg></div>
      <h2 class="tb-dt">¡Terminado!</h2>
      <div class="tb-sum"><span><b>${tbFmtLong(work)}</b><i>de trabajo</i></span><span><b>${tbFmtLong(real)}</b><i>en total</i></span><span><b>${c.sets * c.ex}</b><i>intervalos</i></span></div></div>
    <div class="tb-ctl col"><button type="button" class="tb-start light" data-tb="again"><span>Repetir</span></button><button type="button" class="tb-txt" data-tb="close">Cerrar</button></div></div>`;
}
function tbRender(){
  let el = $('#tabata');
  if(!el){ el = document.createElement('div'); el.id = 'tabata'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'tbT'); document.body.append(el); }
  el.hidden = false; document.body.classList.add('tbopen');
  el.innerHTML = TB.screen === 'setup' ? tbSetup() : TB.screen === 'run' ? tbRun() : tbDone();
  if(TB.screen === 'run') tbPaint(TB.paused ? TB.left / 1000 : (TB.end - tbNow()) / 1000);
}
function tbPaint(left){
  const p = TB.ph[TB.i]; if(!p || p.k === 'done') return;
  const s = $('#tbSec'), a = $('#tbArc'), r = $('#tbRem'); if(!s) return;
  s.textContent = tbFmt(left);
  const C = 2 * Math.PI * 136, frac = p.d ? Math.max(0, Math.min(1, left / p.d)) : 0;
  a.setAttribute('stroke-dasharray', `${(C * frac).toFixed(1)} ${C.toFixed(1)}`);
  const rest = TB.ph.slice(TB.i + 1).reduce((x, q) => x + q.d, 0) + Math.max(0, left);
  if(r) r.textContent = `Quedan ${tbFmtLong(rest)}`;
}

/* ---------- Abrir, controlar y cerrar ---------- */
function openTabata(pre, source){
  if(TB && TB.screen === 'run') return tbRender();
  const cfg = Object.assign(tbLoad(), pre || {});
  if(!pre || !pre.names) cfg.names = [];
  TB = {cfg, screen:'setup', ph:[], i:0, paused:false, source: source || ''};
  tbRender();
}
function tbClose(){
  tbStopTick(); tbWakeOff(); try{ speechSynthesis.cancel(); }catch(e){}
  const el = $('#tabata'); if(el){ el.hidden = true; el.innerHTML = ''; } document.body.classList.remove('tbopen');
  try{ TB && TB.ac && TB.ac.close(); }catch(e){}
  TB = null;
}
function tbStart(){
  const ac = tbAudio(); try{ ac && ac.resume(); }catch(e){}
  tbTone(1, .01, 0, .0001);   // desbloquea el audio en iPhone (tiene que ser dentro del toque)
  if(TB.cfg.voice && 'speechSynthesis' in window){ try{ speechSynthesis.speak(new SpeechSynthesisUtterance('')); }catch(e){} }
  tbSave(TB.cfg);
  TB.ph = tbPhases(TB.cfg); TB.screen = 'run'; TB.paused = false; TB.t0 = tbNow(); TB.workMs = 0;
  tbWakeOn(); tbGo(0); tbStartTick();
}
document.addEventListener('click', e => {
  const root = e.target.closest('#tabata'); if(!root || !TB) return;
  let b;
  if((b = e.target.closest('[data-tbs]'))){ const [k, d] = b.dataset.tbs.split('|'); const [lo, hi, st] = TB_LIM[k];
    TB.cfg[k] = Math.max(lo, Math.min(hi, TB.cfg[k] + (+d) * st)); tbRender(); return; }
  if((b = e.target.closest('[data-tbp]'))){ Object.assign(TB.cfg, TB_PRESETS[+b.dataset.tbp][1]); tbRender(); return; }
  if(!(b = e.target.closest('[data-tb]'))) return;
  const k = b.dataset.tb;
  if(k === 'close') return tbClose();
  if(k === 'start') return tbStart();
  if(k === 'again'){ TB.screen = 'setup'; return tbRender(); }
  if(k === 'snd'){ TB.cfg.sound = !TB.cfg.sound; tbSave(TB.cfg); return tbRender(); }
  if(k === 'pause'){
    if(TB.paused){ TB.paused = false; TB.end = tbNow() + TB.left; tbStartTick(); tbWakeOn(); }
    else { TB.paused = true; TB.left = Math.max(0, TB.end - tbNow()); tbStopTick(); }
    return tbRender();
  }
  if(k === 'prev'){ const cur = TB.ph[TB.i], gone = TB.paused ? cur.d * 1000 - TB.left : cur.d * 1000 - (TB.end - tbNow());
    return tbGo(gone > 2000 ? TB.i : TB.i - 1, TB.paused); }   // como en música: primero reinicia la fase
  if(k === 'next') return tbGo(TB.i + 1, TB.paused);
  if(k === 'stop'){
    if(!TB.stopAsk){ TB.stopAsk = true; toast('Toca la X otra vez para terminar.'); setTimeout(() => { if(TB) TB.stopAsk = false; }, 3000); return; }
    TB.screen = 'setup'; tbStopTick(); tbWakeOff(); try{ speechSynthesis.cancel(); }catch(e){} return tbRender();
  }
});
document.addEventListener('change', e => {
  if(!TB || !e.target.closest('#tabata')) return;
  const t = e.target;
  if(t.dataset.tbo){ TB.cfg[t.dataset.tbo] = t.checked; tbSave(TB.cfg); if(t.dataset.tbo === 'sound' && t.checked){ tbAudio(); tbTone(880, .12); } }
});
document.addEventListener('input', e => {
  if(!TB || !e.target.closest('#tabata')) return;
  const t = e.target; if(t.dataset.tbn != null){ TB.cfg.names = TB.cfg.names || []; TB.cfg.names[+t.dataset.tbn] = t.value; }
});
document.addEventListener('keydown', e => {
  if(!TB || $('#tabata')?.hidden) return;
  if(e.key === 'Escape'){ if(TB.screen === 'run'){ TB.stopAsk = true; } else tbClose(); }
  if(e.key === ' ' && TB.screen === 'run' && !e.target.closest('input')){ e.preventDefault(); $('#tabata [data-tb="pause"]')?.click(); }
});

/* ---------- Puntos de entrada ---------- */
// 1) Bloques "Intermitente" del plan del deportista: botón para abrirlos en el cronómetro
const TB_REG = {}; let tbRegN = 0;
if(typeof hBlocks === 'function'){
  const _hBlocks = hBlocks;
  hBlocks = function(day, k){
    const html = _hBlocks(day, k), parts = html.split('<details class="ap-blk">');
    for(let i = 1; i < parts.length; i++){
      const sg = day.segs[i - 1]; if(!sg || !sg.fmt || sg.fmt.t !== 'inter') continue;
      const id = 'b' + (++tbRegN);
      TB_REG[id] = {pre:{work:+sg.fmt.a || 40, rest:+sg.fmt.b || 20, sets:+sg.fmt.c || 3, ex:Math.max(1, sg.rows.length), names:sg.rows.map(r => r.e)}, src:`${day.name} · ${SEGS[sg.type] || sg.type}: ${fmtLabel(sg.fmt)}`};
      const btn = `<button type="button" class="ap-btn ap-secondary tb-open" data-tbopen="${id}">Abrir en el cronómetro de intervalos</button>`;
      const j = parts[i].lastIndexOf('</div></details>');
      if(j >= 0) parts[i] = parts[i].slice(0, j) + btn + parts[i].slice(j);
    }
    return parts.join('<details class="ap-blk">');
  };
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-tbopen]'); if(!b) return;
  if(b.dataset.tbopen === 'libre') return openTabata(null, '');
  const r = TB_REG[b.dataset.tbopen]; if(r) openTabata(r.pre, r.src);
});
// 2) Panel del fisio: botón en la barra superior
(function(){
  const bar = document.querySelector('#fisioApp .pbar'); if(!bar || $('#bTabata')) return;
  const b = document.createElement('button'); b.id = 'bTabata'; b.type = 'button'; b.dataset.tbopen = 'libre'; b.className = 'tbbtn';
  b.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6M12 2v3"/></svg>Intervalos';
  const ref = $('#bAlert'); ref ? ref.before(b) : bar.prepend(b);
})();
