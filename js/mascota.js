/* ===================== MASCOTA Y META DIARIA (oct 2026) =====================
   Meta del día del deportista: hacer su chequeo diario (en los días de entrenamiento, además, la
   sesión suma). Al cumplirla por primera vez en el día aparece una celebración discreta de media
   pantalla con su mascota, los días seguidos y la semana.
   Mascotas: Pesi (pesa rusa) y Nutria. Por defecto según el sexo que el fisio marcó en la evaluación
   (Pesi hombres, Nutria mujeres); si no hay dato, la persona elige la primera vez, y puede cambiarla
   cuando quiera en Mi fisio. */

const MASC = {
  pesi: {n: 'Pesi', svg: feliz => `<svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Pesi, la pesa rusa">
    <path d="M68 74 Q66 30 100 30 Q134 30 132 74" stroke="var(--mk-ink)" stroke-width="17" fill="none" stroke-linecap="round"/>
    <circle cx="100" cy="120" r="58" fill="var(--mk-ink)"/><rect x="64" y="164" width="72" height="14" rx="7" fill="var(--mk-ink)"/>
    <path d="M44 106 Q100 88 156 106 L158 120 Q100 102 42 120 Z" fill="#E5202E"/><path d="M154 108 L176 98 L172 112 Z" fill="#E5202E"/><path d="M155 114 L178 120 L168 128 Z" fill="#E5202E"/>
    ${feliz ? `<path d="M72 140 Q82 128 92 140" stroke="var(--mk-eye)" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M108 140 Q118 128 128 140" stroke="var(--mk-eye)" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M86 154 Q100 170 114 154 Z" fill="var(--mk-eye)"/>`
      : `<ellipse cx="82" cy="138" rx="11" ry="12" fill="var(--mk-eye)"/><ellipse cx="118" cy="138" rx="11" ry="12" fill="var(--mk-eye)"/><circle cx="84" cy="140" r="5.5" fill="var(--mk-ink)"/><circle cx="120" cy="140" r="5.5" fill="var(--mk-ink)"/><path d="M92 158 Q100 165 108 158" stroke="var(--mk-eye)" stroke-width="4" fill="none" stroke-linecap="round"/>`}
  </svg>`},
  nutria: {n: 'Nutria', svg: feliz => `<svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Nutria con su pelota roja">
    <path d="M140 160 Q182 162 176 128 Q170 150 140 148 Z" fill="#7A4E33"/><ellipse cx="100" cy="136" rx="50" ry="46" fill="#8A5A3B"/><ellipse cx="100" cy="146" rx="32" ry="30" fill="#F1D9C0"/>
    <circle cx="68" cy="52" r="11" fill="#7A4E33"/><circle cx="132" cy="52" r="11" fill="#7A4E33"/><circle cx="100" cy="82" r="42" fill="#8A5A3B"/>
    <ellipse cx="100" cy="96" rx="24" ry="17" fill="#F1D9C0"/><ellipse cx="100" cy="88" rx="7" ry="5" fill="#1D1D1F"/>
    ${feliz ? `<path d="M79 76 Q85 68 91 76" stroke="#1D1D1F" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M109 76 Q115 68 121 76" stroke="#1D1D1F" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M92 99 Q100 110 108 99 Z" fill="#1D1D1F"/>`
      : `<circle cx="85" cy="74" r="5.5" fill="#1D1D1F"/><circle cx="115" cy="74" r="5.5" fill="#1D1D1F"/><path d="M93 100 Q100 106 107 100" stroke="#1D1D1F" stroke-width="3" fill="none" stroke-linecap="round"/>`}
    <path d="M78 96 L60 92 M78 100 L60 102 M122 96 L140 92 M122 100 L140 102" stroke="#5A3A26" stroke-width="2" stroke-linecap="round"/>
    <circle cx="100" cy="140" r="17" fill="#E5202E"/><path d="M86 132 Q100 140 114 132" stroke="#FFFFFF" stroke-width="2.5" fill="none"/>
    <ellipse cx="80" cy="140" rx="10" ry="8" fill="#7A4E33"/><ellipse cx="120" cy="140" rx="10" ry="8" fill="#7A4E33"/>
  </svg>`}
};
const mkKey = () => 'apex_mascota_' + (A.p?.id || '');
function mascotaDe(){
  const own = LS.get(mkKey()); if(MASC[own]) return own;
  const c = A.plan?.contenido?.mascota; return MASC[c] ? c : null;
}
function mkRacha(){
  const days = new Set((wellness || []).map(w => w.fecha)); let n = 0, d = todayISO();
  const add = (iso, k) => { const x = new Date(iso + 'T12:00:00'); x.setDate(x.getDate() + k); return x.toISOString().slice(0, 10); };
  if(!days.has(d)) d = add(d, -1);
  while(days.has(d)){ n++; d = add(d, -1); }
  return n;
}
function mkSemana(){
  const days = new Set((wellness || []).map(w => w.fecha)), hoy = new Date(todayISO() + 'T12:00:00'), lun = new Date(hoy); lun.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  return ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((l, i) => { const x = new Date(lun); x.setDate(lun.getDate() + i); const iso = x.toISOString().slice(0, 10); return {l, ok: days.has(iso), hoy: iso === todayISO()}; });
}
function celHTML(elegir){
  const m = mascotaDe(), n = mkRacha(), sem = mkSemana();
  const ses = (sessions || []).some(s => s.fecha === todayISO() && s.autor === 'deportista');
  if(elegir || !m) return `<div class="cel-sheet" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="celT"><span class="cel-grab" aria-hidden="true"></span>
    <h2 id="celT" class="cel-t">Elige tu compañero</h2><p class="cel-s">Te acompaña cada día que cumples tu meta. Lo puedes cambiar en Mi fisio.</p>
    <div class="cel-pick">${Object.entries(MASC).map(([k, v]) => `<button type="button" data-celpick="${k}"><span class="cel-mini">${v.svg(false)}</span><b>${v.n}</b></button>`).join('')}</div></div>`;
  return `<div class="cel-sheet" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="celT"><span class="cel-grab" aria-hidden="true"></span>
    <div class="cel-mk">${MASC[m].svg(true)}</div>
    <span class="cel-s" id="celT">Meta de hoy cumplida</span>
    <b class="cel-n" data-to="${n}">${Math.max(0, n - 1)}</b>
    <span class="cel-d">${n === 1 ? 'día seguido' : 'días seguidos'}</span>
    ${ses ? '<span class="cel-x">Y ya registraste tu sesión de hoy.</span>' : ''}
    <div class="cel-week" aria-label="Días con chequeo esta semana">${sem.map(d => `<span class="${d.hoy ? 'hoy' : ''}">${d.l}<i class="${d.ok ? 'ok' : ''}"></i></span>`).join('')}</div>
    <button type="button" class="cel-btn" data-celok>Seguir</button></div>`;
}
function celShow(elegir){
  let el = $('#celeb');
  if(!el){ el = document.createElement('div'); el.id = 'celeb'; document.body.appendChild(el);
    el.addEventListener('click', e => {
      const p = e.target.closest('[data-celpick]');
      if(p){ LS.set(mkKey(), p.dataset.celpick); return celShow(false); }
      if(e.target.closest('[data-celok]') || e.target === el) celHide();
    }); }
  el.innerHTML = celHTML(elegir); el.hidden = false; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
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
