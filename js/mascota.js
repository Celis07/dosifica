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
/* Nov 2026 · nuevo diseño: Pesi duotono (cuerpo salvia) y Nutria asomada en el agua. Los colores salen de
   las variables --pz-* y --nt-* (css/tema.css), así cambian solos con el modo oscuro. svg2 es la segunda
   apariencia (Pesi con los brazos arriba, Nutria flotando boca arriba) y se usa solo para recordar el chequeo. */
const GOLD = '<circle r="12" fill="#C9932E" stroke="#9E7220" stroke-width="2"/><path d="M-4 -3 L0 -7 L0 7" stroke="#F3F1EA" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
const PZ_FACE = (m, y = 0) => {
  const t = (x) => `transform="translate(0 ${y + x})"`;
  if(m === 'feliz') return `<g ${t(0)}><path d="M72 138 Q82 126 92 138" stroke="var(--pz-e)" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M108 138 Q118 126 128 138" stroke="var(--pz-e)" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M86 152 Q100 168 114 152 Z" fill="var(--pz-e)"/></g>`;
  const r = m === 'serio' ? 6.5 : 8;
  return `<g ${t(0)}><circle cx="82" cy="134" r="${r}" fill="var(--pz-e)"/><circle cx="118" cy="134" r="${r}" fill="var(--pz-e)"/><circle cx="85" cy="131" r="2.5" fill="var(--pz-eh)"/><circle cx="121" cy="131" r="2.5" fill="var(--pz-eh)"/>`
    + (m === 'serio' ? `<path d="M70 120 L90 125 M130 120 L110 125" stroke="var(--pz-e)" stroke-width="4" stroke-linecap="round"/><path d="M90 156 L110 156" stroke="var(--pz-e)" stroke-width="5" stroke-linecap="round"/>`
                     : `<path d="M88 152 Q100 162 112 152" stroke="var(--pz-e)" stroke-width="5" fill="none" stroke-linecap="round"/>`) + '</g>';
};
const PZ_BODY = `<path d="M68 74 Q66 30 100 30 Q134 30 132 74" stroke="var(--pz-h)" stroke-width="17" fill="none" stroke-linecap="round"/><circle cx="100" cy="120" r="58" fill="var(--pz-b)"/><path d="M58 92 Q100 74 142 92 Q120 84 100 84 Q80 84 58 92 Z" fill="var(--pz-hi)"/><rect x="64" y="164" width="72" height="14" rx="7" fill="var(--pz-h)"/>`;
const PZ_CHEEKS = `<circle cx="68" cy="150" r="7" fill="var(--pz-ck)" opacity=".55"/><circle cx="132" cy="150" r="7" fill="var(--pz-ck)" opacity=".55"/>`;
const PZ_ACC = acc => acc === 'gorro' ? `<path d="M46 110 Q48 62 100 62 Q152 62 154 110 Z" fill="#F3F1EA" stroke="#CFCBBE" stroke-width="2"/><path d="M100 62 V108" stroke="#CFCBBE" stroke-width="2"/><circle cx="46" cy="116" r="13" fill="#F3F1EA" stroke="#CFCBBE" stroke-width="2"/><circle cx="154" cy="116" r="13" fill="#F3F1EA" stroke="#CFCBBE" stroke-width="2"/>`
  : acc === 'gorra' ? `<path d="M64 92 Q66 62 100 62 Q134 62 136 92 Z" fill="var(--pz-h)"/><path d="M132 88 L166 94 Q158 101 130 98 Z" fill="var(--pz-h)"/><circle cx="100" cy="64" r="4" fill="var(--pz-hi)"/>` : '';
const NT_FACE = m => {
  if(m === 'feliz') return `<path d="M72 86 Q78 78 84 86 M116 86 Q122 78 128 86" stroke="var(--nt-k)" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M90 98 h20 q-10 13 -20 0Z" fill="var(--nt-k)"/><path d="M92 114 Q100 126 108 114 Z" fill="var(--nt-k)"/>`;
  return `<circle cx="78" cy="84" r="5.5" fill="var(--nt-k)"/><circle cx="122" cy="84" r="5.5" fill="var(--nt-k)"/><circle cx="80" cy="82" r="1.8" fill="#FFFFFF"/><circle cx="124" cy="82" r="1.8" fill="#FFFFFF"/><path d="M90 98 h20 q-10 13 -20 0Z" fill="var(--nt-k)"/>`
    + (m === 'serio' ? `<path d="M68 72 L86 76 M132 72 L114 76" stroke="var(--nt-k)" stroke-width="3.5" stroke-linecap="round"/><path d="M93 116 L107 116" stroke="var(--nt-k)" stroke-width="2.5" stroke-linecap="round"/>`
                     : `<path d="M100 106 v6 M100 112 q-5 4 -9 1 M100 112 q5 4 9 1" stroke="var(--nt-k)" stroke-width="2" fill="none" stroke-linecap="round"/>`);
};
const NT_WHISK = (x, y, d) => [-4, 0, 4].map(o => `<path d="M${x} ${y + o} q${d * 10} ${o * .6 - 2} ${d * 20} ${o * 1.4}" stroke="var(--nt-k)" stroke-width="1.8" fill="none" stroke-linecap="round"/>`).join('');
const NT_BALL = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="var(--nt-ball)"/><path d="M${x - r + 1} ${y - 4} Q${x} ${y + 6} ${x + r - 1} ${y - 4}" stroke="var(--nt-k)" stroke-width="2.5" fill="none"/>`;
const MASC = {
  pesi: {n: 'Pesi',
    svg: (m, acc) => { m = mkMood(m); return `<svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Pesi, la pesa rusa">${PZ_BODY}${PZ_ACC(acc)}${PZ_FACE(m)}${PZ_CHEEKS}${m === 'curita' ? CURITA(136, 160, -25) : ''}${acc === 'medalla' ? `<path d="M90 164 L96 176 M110 164 L104 176" stroke="var(--pz-h)" stroke-width="5"/><g transform="translate(100 186)">${GOLD}</g>` : ''}</svg>`; },
    svg2: () => `<svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Pesi con los brazos arriba"><path d="M46 124 Q24 118 24 92" stroke="var(--pz-b)" stroke-width="15" fill="none" stroke-linecap="round"/><circle cx="24" cy="86" r="10" fill="var(--pz-b)"/><path d="M154 124 Q176 118 176 92" stroke="var(--pz-b)" stroke-width="15" fill="none" stroke-linecap="round"/><circle cx="176" cy="86" r="10" fill="var(--pz-b)"/>${PZ_BODY}${PZ_FACE('feliz')}${PZ_CHEEKS}<path d="M14 66 l6 6 M34 64 l-5 7 M186 66 l-6 6 M166 64 l5 7" stroke="var(--pz-m)" stroke-width="3" stroke-linecap="round"/></svg>`},
  nutria: {n: 'Nutria',
    svg: (m, acc) => { m = mkMood(m); return `<svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Nutria asomada en el agua con su balón">
    <path d="M62 120 Q58 160 52 176 H148 Q142 160 138 120Z" fill="var(--nt-b)"/><path d="M80 128 Q78 160 76 176 H124 Q122 160 120 128Z" fill="var(--nt-m)"/>
    ${acc === 'medalla' ? `<path d="M86 130 L94 150 M114 130 L106 150" stroke="var(--nt-b2)" stroke-width="5"/><g transform="translate(100 154)">${GOLD}</g>` : ''}
    <circle cx="52" cy="80" r="10" fill="var(--nt-b2)"/><circle cx="148" cy="80" r="10" fill="var(--nt-b2)"/><circle cx="52" cy="80" r="4.5" fill="var(--nt-m)"/><circle cx="148" cy="80" r="4.5" fill="var(--nt-m)"/>
    <ellipse cx="100" cy="94" rx="54" ry="40" fill="var(--nt-b)"/>
    ${acc === 'gorro' ? `<path d="M48 92 Q48 50 100 50 Q152 50 152 92 Z" fill="#F3F1EA" stroke="#CFCBBE" stroke-width="2"/><path d="M100 50 V90" stroke="#CFCBBE" stroke-width="2"/><circle cx="50" cy="86" r="12" fill="#F3F1EA" stroke="#CFCBBE" stroke-width="2"/><circle cx="150" cy="86" r="12" fill="#F3F1EA" stroke="#CFCBBE" stroke-width="2"/>` : ''}
    ${acc === 'gorra' ? `<path d="M62 70 Q64 46 100 46 Q136 46 138 70 Z" fill="var(--nt-b2)"/><path d="M134 66 L168 72 Q160 79 132 76 Z" fill="var(--nt-b2)"/><circle cx="100" cy="48" r="4" fill="var(--nt-ball)"/>` : ''}
    <circle cx="87" cy="111" r="17" fill="var(--nt-m)"/><circle cx="113" cy="111" r="17" fill="var(--nt-m)"/>
    ${NT_FACE(m)}${NT_WHISK(78, 112, -1)}${NT_WHISK(122, 112, 1)}${m === 'curita' ? CURITA(132, 64, 30) : ''}
    <path d="M0 160 q25 -10 50 0 t50 0 t50 0 t50 0 V200 H0Z" fill="var(--nt-w)" opacity=".45"/>${NT_BALL(164, 150, 17)}
  </svg>`; },
    svg2: () => `<svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Nutria flotando boca arriba con su balón">
    <path d="M0 132 q25 -10 50 0 t50 0 t50 0 t50 0 V200 H0Z" fill="var(--nt-w)" opacity=".35"/><path d="M150 118 Q180 116 194 100 Q186 124 152 130Z" fill="var(--nt-b2)"/>
    <ellipse cx="104" cy="120" rx="60" ry="24" fill="var(--nt-b)"/><ellipse cx="108" cy="114" rx="42" ry="13" fill="var(--nt-m)"/>
    <ellipse cx="146" cy="100" rx="9" ry="6" fill="var(--nt-b2)" transform="rotate(-25 146 100)"/><ellipse cx="160" cy="104" rx="9" ry="6" fill="var(--nt-b2)" transform="rotate(-25 160 104)"/>
    ${NT_BALL(104, 94, 15)}<ellipse cx="90" cy="100" rx="7" ry="5" fill="var(--nt-b2)"/><ellipse cx="118" cy="100" rx="7" ry="5" fill="var(--nt-b2)"/>
    <circle cx="28" cy="88" r="6" fill="var(--nt-b2)"/><circle cx="66" cy="88" r="6" fill="var(--nt-b2)"/><ellipse cx="47" cy="104" rx="28" ry="22" fill="var(--nt-b)"/>
    <circle cx="40" cy="113" r="10" fill="var(--nt-m)"/><circle cx="54" cy="113" r="10" fill="var(--nt-m)"/><path d="M41 105 h12 q-6 8 -12 0Z" fill="var(--nt-k)"/>
    <circle cx="36" cy="98" r="3.2" fill="var(--nt-k)"/><circle cx="58" cy="98" r="3.2" fill="var(--nt-k)"/>${NT_WHISK(34, 113, -1)}${NT_WHISK(60, 113, 1)}
  </svg>`}
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
const mkRx = () => (Array.isArray(A.p?.racha_extra) ? A.p.racha_extra : []);   // días que el fisio marcó como entrenados
function mkRachaInfo(){
  const ses = [...(sessions || []).map(s => s.fecha), ...mkRx()], act = new Set([...(wellness || []).map(w => w.fecha), ...ses]);
  return rachaCalc(act, ses, (A.plan?.contenido?.dias || []).length || 3);
}
function mkRacha(){ return mkRachaInfo().n; }
function mkSemana(){
  const days = new Set([...(wellness || []).map(w => w.fecha), ...(sessions || []).map(s => s.fecha), ...mkRx()]), hoy = new Date(todayISO() + 'T12:00:00'), lun = new Date(hoy); lun.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
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
