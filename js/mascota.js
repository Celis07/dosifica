/* ===================== MASCOTA Y META DIARIA (oct 2026) =====================
   Meta del día del deportista: hacer su chequeo diario (en los días de entrenamiento, además, la
   sesión suma). Al cumplirla por primera vez en el día aparece una celebración discreta de media
   pantalla con su mascota, los días seguidos y la semana.
   Mascotas: Pesi (pesa rusa) y Nutria. Por defecto según el sexo que el fisio marcó en la evaluación
   (Pesi hombres, Nutria mujeres); si no hay dato, la persona elige la primera vez, y puede cambiarla
   cuando quiera en Mi fisio. */

/* svg(ánimo, accesorio): ánimo 'feliz' | 'normal' | 'serio' | 'curita' (true = feliz, false = normal);
   accesorio '' | 'gorra' (7 días) | 'medalla' (30) | 'gorro' (100, gorro de rugby subacuático). */
const mkMood = m => m === true ? 'feliz' : (m === false || !m) ? 'normal' : m;
const CURITA = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-17" y="-7" width="34" height="14" rx="7" fill="#F2C9A0"/><rect x="-6" y="-7" width="12" height="14" fill="#E3B286"/><circle cx="-2" cy="-2" r="1.2" fill="#C9956A"/><circle cx="2" cy="2" r="1.2" fill="#C9956A"/></g>`;
const MASC = {
  pesi: {n: 'Pesi', svg: (m, acc) => { m = mkMood(m); return `<svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Pesi, la pesa rusa">
    <path d="M68 74 Q66 30 100 30 Q134 30 132 74" stroke="var(--mk-ink)" stroke-width="17" fill="none" stroke-linecap="round"/>
    <circle cx="100" cy="120" r="58" fill="var(--mk-ink)"/><rect x="64" y="164" width="72" height="14" rx="7" fill="var(--mk-ink)"/>
    ${acc === 'gorro' ? `<path d="M46 112 Q48 60 100 60 Q152 60 154 112 Z" fill="#F5F5F7" stroke="#C7C7CC" stroke-width="2"/><circle cx="46" cy="118" r="13" fill="#F5F5F7" stroke="#C7C7CC" stroke-width="2"/><circle cx="154" cy="118" r="13" fill="#F5F5F7" stroke="#C7C7CC" stroke-width="2"/>`
      : `<path d="M44 106 Q100 88 156 106 L158 120 Q100 102 42 120 Z" fill="#E5202E"/><path d="M154 108 L176 98 L172 112 Z" fill="#E5202E"/><path d="M155 114 L178 120 L168 128 Z" fill="#E5202E"/>`}
    ${acc === 'gorra' ? `<path d="M70 82 Q72 58 100 58 Q128 58 130 82 Z" fill="#E5202E"/><path d="M126 80 L158 84 Q150 90 124 88 Z" fill="#B3121F"/>` : ''}
    ${m === 'feliz' ? `<path d="M72 140 Q82 128 92 140" stroke="var(--mk-eye)" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M108 140 Q118 128 128 140" stroke="var(--mk-eye)" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M86 154 Q100 170 114 154 Z" fill="var(--mk-eye)"/>`
      : `<ellipse cx="82" cy="138" rx="11" ry="${m === 'serio' ? 8 : 12}" fill="var(--mk-eye)"/><ellipse cx="118" cy="138" rx="11" ry="${m === 'serio' ? 8 : 12}" fill="var(--mk-eye)"/><circle cx="84" cy="140" r="5.5" fill="var(--mk-ink)"/><circle cx="120" cy="140" r="5.5" fill="var(--mk-ink)"/>`
      + (m === 'normal' ? `<path d="M92 158 Q100 165 108 158" stroke="var(--mk-eye)" stroke-width="4" fill="none" stroke-linecap="round"/>` : `<path d="M90 160 L110 160" stroke="var(--mk-eye)" stroke-width="4" stroke-linecap="round"/>`)
      + (m === 'serio' ? `<path d="M70 124 L92 128 M130 124 L108 128" stroke="var(--mk-eye)" stroke-width="4" stroke-linecap="round"/>` : '')
      + (m === 'curita' ? CURITA(132, 160, -25) : '')}
    ${acc === 'medalla' ? `<path d="M88 150 L80 178 M112 150 L120 178" stroke="#E5202E" stroke-width="6"/><circle cx="100" cy="184" r="12" fill="#F2B705" stroke="#C99400" stroke-width="2"/>` : ''}
  </svg>`; }},
  nutria: {n: 'Nutria', svg: (m, acc) => { m = mkMood(m); return `<svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Nutria con su pelota roja">
    <path d="M140 160 Q182 162 176 128 Q170 150 140 148 Z" fill="#7A4E33"/><ellipse cx="100" cy="136" rx="50" ry="46" fill="#8A5A3B"/><ellipse cx="100" cy="146" rx="32" ry="30" fill="#F1D9C0"/>
    <circle cx="68" cy="52" r="11" fill="#7A4E33"/><circle cx="132" cy="52" r="11" fill="#7A4E33"/><circle cx="100" cy="82" r="42" fill="#8A5A3B"/>
    ${acc === 'gorro' ? `<path d="M58 80 Q58 34 100 34 Q142 34 142 80 Z" fill="#F5F5F7" stroke="#C7C7CC" stroke-width="2"/><circle cx="60" cy="84" r="11" fill="#F5F5F7" stroke="#C7C7CC" stroke-width="2"/><circle cx="140" cy="84" r="11" fill="#F5F5F7" stroke="#C7C7CC" stroke-width="2"/>` : ''}
    ${acc === 'gorra' ? `<path d="M64 62 Q66 36 100 36 Q134 36 136 62 Z" fill="#E5202E"/><path d="M132 60 L166 64 Q158 70 130 68 Z" fill="#B3121F"/>` : ''}
    <ellipse cx="100" cy="96" rx="24" ry="17" fill="#F1D9C0"/><ellipse cx="100" cy="88" rx="7" ry="5" fill="#1D1D1F"/>
    ${m === 'feliz' ? `<path d="M79 76 Q85 68 91 76" stroke="#1D1D1F" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M109 76 Q115 68 121 76" stroke="#1D1D1F" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M92 99 Q100 110 108 99 Z" fill="#1D1D1F"/>`
      : `<circle cx="85" cy="74" r="5.5" fill="#1D1D1F"/><circle cx="115" cy="74" r="5.5" fill="#1D1D1F"/>`
      + (m === 'normal' ? `<path d="M93 100 Q100 106 107 100" stroke="#1D1D1F" stroke-width="3" fill="none" stroke-linecap="round"/>` : `<path d="M93 102 L107 102" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>`)
      + (m === 'serio' ? `<path d="M77 64 L91 67 M123 64 L109 67" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>` : '')
      + (m === 'curita' ? CURITA(124, 58, 30) : '')}
    <path d="M78 96 L60 92 M78 100 L60 102 M122 96 L140 92 M122 100 L140 102" stroke="#5A3A26" stroke-width="2" stroke-linecap="round"/>
    <circle cx="100" cy="140" r="17" fill="#E5202E"/><path d="M86 132 Q100 140 114 132" stroke="#FFFFFF" stroke-width="2.5" fill="none"/>
    <ellipse cx="80" cy="140" rx="10" ry="8" fill="#7A4E33"/><ellipse cx="120" cy="140" rx="10" ry="8" fill="#7A4E33"/>
    ${acc === 'medalla' ? `<path d="M88 118 L80 160 M112 118 L120 160" stroke="#E5202E" stroke-width="5"/><circle cx="100" cy="170" r="11" fill="#F2B705" stroke="#C99400" stroke-width="2"/>` : ''}
  </svg>`; }}
};
const mkKey = () => 'apex_mascota_' + (A.p?.id || '');
function mascotaDe(){
  const own = LS.get(mkKey()); if(MASC[own]) return own;
  const c = A.plan?.contenido?.mascota; return MASC[c] ? c : null;
}
/* Racha (oct 2026): cuenta los días con chequeo o sesión. Un día sin registro es descanso y NO rompe la racha si
   (a) esa semana (lunes a domingo) ya cumplió las sesiones programadas, o
   (b) el hueco no supera el descanso normal entre sesiones: techo((7 − días de entrenamiento) / días de entrenamiento)
       → 3 días/semana: hasta 2 días seguidos sin registro; 4: 1; 2: 3.
   El día de hoy sin registro todavía no cuenta como hueco. */
function rachaCalc(act, ses, nDiasPlan, hoy){
  const okD = f => typeof f === 'string' && /^\d{4}-\d\d-\d\d$/.test(f);
  act = new Set([...act].filter(okD)); ses = ses.filter(okD);
  const n = Math.max(1, Math.min(7, +nDiasPlan || 3)), gapMax = Math.ceil((7 - n) / n);
  const add = (iso, k) => { const x = new Date(iso + 'T12:00:00'); x.setDate(x.getDate() + k); return x.toISOString().slice(0, 10); };
  const lun = iso => { const x = new Date(iso + 'T12:00:00'); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x.toISOString().slice(0, 10); };
  const porSem = {}; ses.forEach(f => { const l = lun(f); (porSem[l] ||= new Set()).add(f); });
  const semHecha = d => (porSem[lun(d)]?.size || 0) >= n;
  const primero = [...act].sort()[0]; if(!primero) return {n: 0, gap: 0, gapMax, riesgo: false};
  let d = hoy || todayISO(); if(!act.has(d)) d = add(d, -1);
  let racha = 0, gap = 0, gapAct = null;
  while(d >= primero){
    if(act.has(d)){ if(gapAct == null) gapAct = gap; racha++; gap = 0; }
    else if(!semHecha(d)){ gap++; if(gap > gapMax) break; }
    d = add(d, -1);
  }
  if(gapAct == null) gapAct = gap;
  const h = hoy || todayISO();
  return {n: racha, gap: gapAct, gapMax, riesgo: racha > 0 && !act.has(h) && !semHecha(h) && gapAct + 1 > gapMax};
}
function mkRachaInfo(){
  const ses = (sessions || []).map(s => s.fecha), act = new Set([...(wellness || []).map(w => w.fecha), ...ses]);
  return rachaCalc(act, ses, (A.plan?.contenido?.dias || []).length || 3);
}
function mkRacha(){ return mkRachaInfo().n; }
function mkSemana(){
  const days = new Set([...(wellness || []).map(w => w.fecha), ...(sessions || []).map(s => s.fecha)]), hoy = new Date(todayISO() + 'T12:00:00'), lun = new Date(hoy); lun.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  return ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((l, i) => { const x = new Date(lun); x.setDate(lun.getDate() + i); const iso = x.toISOString().slice(0, 10); return {l, ok: days.has(iso), hoy: iso === todayISO()}; });
}
function celHTML(elegir){
  const m = mascotaDe(), n = mkRacha(), sem = mkSemana();
  const ses = (sessions || []).some(s => s.fecha === todayISO() && s.autor === 'deportista');
  if(elegir || !m) return `<div class="cel-sheet" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="celT"><span class="cel-grab" aria-hidden="true"></span>
    <h2 id="celT" class="cel-t">Elige tu compañero</h2><p class="cel-s">Te acompaña cada día que cumples tu meta. Lo puedes cambiar en Mi fisio.</p>
    <div class="cel-pick">${Object.entries(MASC).map(([k, v]) => `<button type="button" data-celpick="${k}"><span class="cel-mini">${v.svg(false)}</span><b>${v.n}</b></button>`).join('')}</div></div>`;
  const k = (typeof todayLight === 'function' && todayLight()?.c) || 'g', hito = MK_HITOS.find(h => h.n === n);
  const mood = hito ? 'feliz' : {g: 'feliz', y: 'serio', r: 'curita'}[k] || 'feliz';
  const tit = hito ? `¡Ganaste ${hito.t}!` : {g: 'Meta de hoy cumplida', y: 'Meta cumplida · hoy sin subir carga', r: 'Meta cumplida · hoy bajamos la carga'}[k];
  return `<div class="cel-sheet${hito ? ' hito' : ''}" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="celT"><span class="cel-grab" aria-hidden="true"></span>
    <div class="cel-mk">${MASC[m].svg(mood, mkAcc(n))}</div>
    <span class="cel-s" id="celT">${tit}</span>
    <b class="cel-n" data-to="${n}">${Math.max(0, n - 1)}</b>
    <span class="cel-d">${n === 1 ? 'día de racha' : 'días de racha'}</span>
    ${ses ? '<span class="cel-x">Y ya registraste tu sesión de hoy.</span>' : ''}
    <div class="cel-week" aria-label="Días con chequeo o sesión esta semana">${sem.map(d => `<span class="${d.hoy ? 'hoy' : ''}">${d.l}<i class="${d.ok ? 'ok' : ''}"></i></span>`).join('')}</div>
    <button type="button" class="cel-btn" data-celok>Seguir</button></div>`;
}
const MK_HITOS = [{n: 7, a: 'gorra', t: 'la gorra'}, {n: 30, a: 'medalla', t: 'la medalla'}, {n: 100, a: 'gorro', t: 'el gorro de rugby subacuático'}];
const mkBestKey = () => 'apex_mkbest_' + (A.p?.id || '');
function mkAcc(n){ const best = Math.max(+LS.get(mkBestKey()) || 0, n || 0); if(n > (+LS.get(mkBestKey()) || 0)) LS.set(mkBestKey(), String(n)); const h = MK_HITOS.filter(x => best >= x.n).pop(); return h ? h.a : ''; }
function celShow(elegir){
  let el = $('#celeb');
  if(!el){ el = document.createElement('div'); el.id = 'celeb'; document.body.appendChild(el);
    el.addEventListener('click', e => {
      const p = e.target.closest('[data-celpick]');
      if(p){ LS.set(mkKey(), p.dataset.celpick); if(typeof renderAthlete === 'function') renderAthlete(); return celShow(false); }
      if(e.target.closest('[data-celok]') || e.target === el) celHide();
    }); }
  el.innerHTML = typeof elegir === 'object' && elegir ? elegir.html : celHTML(elegir); el.hidden = false; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  const num = el.querySelector('.cel-n');
  if(num){ const to = +num.dataset.to; setTimeout(() => { num.textContent = to; num.classList.add('up'); }, 450); }
  el.querySelector('.cel-sheet')?.focus({preventScroll: true});
}
function celHide(){ const el = $('#celeb'); if(!el) return; el.classList.remove('on'); setTimeout(() => { el.hidden = true; el.innerHTML = ''; }, 250); }
document.addEventListener('keydown', e => { if(e.key === 'Escape' && $('#celeb') && !$('#celeb').hidden) celHide(); });

// Al guardar el chequeo del día por primera vez: celebración
const _saveWellMk = saveWell;
saveWell = async function(pid, pfx, extra){
  const habia = (wellness || []).some(x => x.fecha === todayISO());
  const ok = await _saveWellMk.apply(this, arguments);
  if(ok && pfx === 'aw' && typeof me !== 'undefined' && me.role === 'deportista' && !habia && LS.get('apex_cel_' + (A.p?.id || '')) !== todayISO()){
    LS.set('apex_cel_' + (A.p?.id || ''), todayISO());
    setTimeout(() => celShow(false), 400);
  }
  return ok;
};

// Mi fisio: cambiar de mascota
const _renderAthleteMk = renderAthlete;
renderAthlete = function(){
  _renderAthleteMk.apply(this, arguments);
  if(A.tab !== 'fisio') return;
  const body = document.querySelector('#athleteApp .ap-body'); if(!body || body.querySelector('.mk-sec')) return;
  const m = mascotaDe();
  body.insertAdjacentHTML('beforeend', `<section class="ap-sec mk-sec"><div class="ap-head"><h2>Tu compañero</h2></div>
    <div class="mk-row">${Object.entries(MASC).map(([k, v]) => `<button type="button" data-mkset="${k}" aria-pressed="${m === k}"><span class="cel-mini">${v.svg(false)}</span><b>${v.n}</b></button>`).join('')}</div>
    <p class="ap-muted" style="margin:6px 0 0">Aparece cuando cumples tu meta del día.</p></section>`);
};
document.addEventListener('click', e => { const b = e.target.closest('[data-mkset]'); if(b){ LS.set(mkKey(), b.dataset.mkset); renderAthlete(); } });
