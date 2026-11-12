/* ===================== PROGRESO, RESPALDO Y PLANES SIN ABRIR (nov 2026) =====================
   - Ficha → Resumen: "Progreso por semana" (últimas 8 semanas): sesiones, carga (sRPE × minutos),
     dolor promedio y volumen levantado (kg × reps × series que el usuario marcó en vivo).
   - Cuenta → Herramientas: "Descargar respaldo" (todas las fichas, planes, sesiones, chequeos y evaluaciones
     en un archivo .json). En Inicio aparece un recordatorio si pasaron 7 días desde el último.
   - Inicio: "Sin abrir su plan nuevo" lista a quien no ha abierto el plan 48 h después de publicarlo o cambiarlo.
     El aviso al celular del fisio lo manda el servidor (push tipo "sinver"). */

/* ---------- Progreso por semana ---------- */
const PG_N = 8;
function pgLunes(iso){ const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toISOString().slice(0, 10); }
function pgSemanas(ses){
  const hoy = pgLunes(todayISO()), out = [];
  for(let i = PG_N - 1; i >= 0; i--){ const d = new Date(hoy + 'T12:00:00'); d.setDate(d.getDate() - 7 * i); out.push({k: d.toISOString().slice(0, 10), n: 0, carga: 0, dol: [], vol: 0}); }
  const by = Object.fromEntries(out.map(w => [w.k, w]));
  (ses || []).forEach(s => {
    if(!s.fecha) return; const w = by[pgLunes(s.fecha)]; if(!w) return;
    w.n++;
    if(s.srpe != null && s.min != null) w.carga += +s.srpe * +s.min;
    if(s.dolor != null) w.dol.push(+s.dolor);
    (s.ex || []).forEach(x => { if(x.kg > 0 && x.reps > 0) w.vol += +x.kg * +x.reps * (+x.sets || 1); });
  });
  out.forEach(w => { w.dolor = w.dol.length ? Math.round(w.dol.reduce((a, b) => a + b, 0) / w.dol.length * 10) / 10 : null; w.carga = Math.round(w.carga); w.vol = Math.round(w.vol); });
  return out;
}
const pgFmt = v => v == null ? '—' : v >= 10000 ? (Math.round(v / 100) / 10).toLocaleString('es-CO') + ' mil' : String(v).replace('.', ',');
function pgFila(sem, key, nombre, unidad, max, tipo){
  const vals = sem.map(w => w[key]), hay = vals.some(v => v != null && v > 0);
  const m = max || Math.max(1, ...vals.map(v => v || 0)), last = vals[vals.length - 1], prev = vals[vals.length - 2], prev2 = vals[vals.length - 3];
  // La semana en curso está incompleta: la comparación es entre la semana pasada y la anterior
  const tr = prev != null && prev2 != null && prev2 > 0 ? Math.round((prev - prev2) / prev2 * 100) : null;
  const cls = tipo === 'dolor' ? (tr > 0 ? 'bad' : tr < 0 ? 'ok' : '') : tipo === 'carga' && tr > 30 ? 'bad' : '';
  const trTxt = prev == null ? '' : `Semana pasada ${pgFmt(prev)}${tr ? ` (${tr > 0 ? '+' : ''}${tr}\u00a0%)` : ''}`;
  const aria = `${nombre}, últimas ${PG_N} semanas: ${vals.map(v => pgFmt(v)).join(', ')}${unidad ? ' ' + unidad : ''}`;
  return `<div class="pg-f${hay ? '' : ' vacio'}"><div class="pg-l"><span>${esc(nombre)}</span><b>${pgFmt(last)}${last != null && unidad ? ` <small>${esc(unidad)}</small>` : ''}</b>${trTxt ? `<em class="${cls}">${esc(trTxt)}</em>` : ''}</div>
    <div class="pg-b" role="img" aria-label="${esc(aria)}">${vals.map((v, i) => `<i class="${i === vals.length - 1 ? 'now' : ''}" style="height:${v ? Math.max(6, Math.round(v / m * 100)) : 0}%" title="${esc(fmtD(sem[i].k))}: ${esc(pgFmt(v))}"></i>`).join('')}</div></div>`;
}
function pgCard(){
  const sem = pgSemanas(sessions);
  if(!sem.some(w => w.n)) return `<section class="fx-w pg-card"><h3 class="pg-h">Progreso por semana</h3><p class="pg-n">Aparece cuando registre sesiones desde la app.</p></section>`;
  const conVol = sem.some(w => w.vol > 0);
  return `<section class="fx-w pg-card"><h3 class="pg-h">Progreso por semana</h3><p class="pg-n">Últimas ${PG_N} semanas. El número grande y la barra resaltada son esta semana (va en curso).</p>
    ${pgFila(sem, 'n', 'Sesiones', '', Math.max(nDias(st) || 3, ...sem.map(w => w.n)))}
    ${pgFila(sem, 'carga', 'Carga', 'UA', 0, 'carga')}
    ${pgFila(sem, 'dolor', 'Dolor promedio', '/10', 10, 'dolor')}
    ${conVol ? pgFila(sem, 'vol', 'Volumen levantado', 'kg') : '<p class="pg-n">El volumen aparece cuando marque series con peso en el modo en vivo.</p>'}
    <p class="pg-n">Carga = RPE de la sesión × minutos. Si la carga sube más del 30 % de una semana a otra, se marca en naranja: revisa cómo responde.</p></section>`;
}
const _renderPg = render;
render = function(){
  const r = _renderPg.apply(this, arguments);
  try{ const res = view === 'resumen' && curId && !isExample && $('#out .fx-res'); if(res && !res.querySelector('.pg-card')) res.querySelector('.fx-rgrid')?.insertAdjacentHTML('afterend', pgCard()); }catch(e){ console.error('progreso', e); }
  return r;
};

/* ---------- Respaldo ---------- */
const RSP_K = 'apex_resp_t';
const rspDias = () => { const t = +(LS.get(RSP_K) || 0); return t ? Math.floor((Date.now() - t) / 864e5) : null; };
async function rspDescargar(btn){
  if(!navigator.onLine){ toast('Para descargar el respaldo necesitas internet.'); return; }
  const t0 = btn?.innerHTML; if(btn){ btn.disabled = true; btn.querySelector('b') && (btn.querySelector('b').textContent = 'Preparando respaldo…'); }
  try{
    const ids = patients.map(p => p.id);
    const q = async (t, col) => { if(!ids.length) return []; const {data, error} = await sb.from(t).select('*').in(col || 'paciente_id', ids); if(error) throw error; return data || []; };
    const [pac, planes, ses, bien, evs] = await Promise.all([q('pacientes', 'id'), q('planes'), q('sesiones'), q('bienestar'), q('evaluaciones')]);
    const data = {app: 'Ápex', creado: new Date().toISOString(), fisio: me.email, usuarios: pac.length, pacientes: pac, planes, sesiones: ses, bienestar: bien, evaluaciones: evs, biblioteca: myLib || []};
    const blob = new Blob([JSON.stringify(data, null, 1)], {type: 'application/json'}), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `apex-respaldo-${todayISO()}.json`; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    LS.set(RSP_K, String(Date.now()));
    toast(`Respaldo descargado: ${pac.length} ${pac.length === 1 ? 'ficha' : 'fichas'}, ${ses.length} sesiones. Guárdalo en tu Drive o computador.`);
  }catch(e){ console.error('respaldo', e); toast('No se pudo crear el respaldo. Intenta de nuevo.'); }
  finally{ if(btn){ btn.disabled = false; btn.innerHTML = t0; } if(typeof FX !== 'undefined' && homeVisible()) renderHome(); }
}
const _renderHomeRsp = renderHome;
renderHome = function(){
  const r = _renderHomeRsp.apply(this, arguments);
  try{
    if(typeof FX === 'undefined' || FX.guia || !patients.length) return r;
    const home = $('#home'), d = rspDias();
    const sub = d == null ? 'Nunca has descargado uno' : d === 0 ? 'Último: hoy' : `Último: hace ${d} ${d === 1 ? 'día' : 'días'}`;
    if(FX.tab === 'cuenta'){
      const herr = [...home.querySelectorAll('.fx-sec')].find(s => /Herramientas/.test(s.querySelector('h2')?.textContent || ''));
      const list = herr?.querySelector('.fx-list');
      if(list && !list.querySelector('[data-rsp]')) list.insertAdjacentHTML('beforeend', `<button type="button" class="fx-rb" data-rsp><span class="fx-ic sq"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/></svg></span><span class="fx-rt"><b>Descargar respaldo</b><span>Todas las fichas, planes y sesiones · ${esc(sub)}</span></span>${FX_I.chev}</button>`);
    }
    if(FX.tab === 'inicio' && (d == null || d >= 7) && !home.querySelector('.rsp-av') && LS.get('apex_resp_omit') !== todayISO()){
      const html = `<section class="fx-w rsp-av" role="status"><span><b>Respaldo semanal</b><span>${esc(sub)}. Descárgalo y guárdalo fuera del celular.</span></span><div><button type="button" class="pri" data-rsp>Descargar</button><button type="button" data-rspomit>Hoy no</button></div></section>`;
      const anchor = home.querySelector('.sg-home') || home.querySelector('.fx-mk') || home.querySelector('.fx-hd');
      anchor ? anchor.insertAdjacentHTML('afterend', html) : home.querySelector('.fx-page')?.insertAdjacentHTML('afterbegin', html);
    }
  }catch(e){ console.error(e); }
  return r;
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-rsp]'); if(b){ rspDescargar(b); return; }
  if(e.target.closest('[data-rspomit]')){ LS.set('apex_resp_omit', todayISO()); $('#home .rsp-av')?.remove(); }
});

/* ---------- Inicio: planes sin abrir 48 h ---------- */
const SV = {act: {}, t: 0};
async function svLoad(){
  if(!navigator.onLine || me.role !== 'fisio' || Date.now() - SV.t < 5 * 60e3) return;
  SV.t = Date.now();
  try{
    const {data} = await sb.from('planes').select('paciente_id,actualizado_at,publicado_at').order('publicado_at', {ascending: false});
    SV.act = {}; (data || []).forEach(r => { if(!SV.act[r.paciente_id]) SV.act[r.paciente_id] = r.actualizado_at || r.publicado_at; });
    if(homeVisible() && FX.tab === 'inicio') renderHome();
  }catch(e){}
}
function svLista(){
  const lim = Date.now() - 48 * 36e5;
  return patients.map(p => ({p, act: SV.act[p.id], vis: (typeof SG !== 'undefined' && SG.vis?.[p.id]?.visto) || null}))
    .filter(x => x.act && new Date(x.act).getTime() < lim && (!x.vis || x.vis < x.act))
    .sort((a, b) => a.act.localeCompare(b.act));
}
const _renderHomeSv = renderHome;
renderHome = function(){
  const r = _renderHomeSv.apply(this, arguments);
  try{
    if(typeof FX === 'undefined' || FX.tab !== 'inicio') return r;
    svLoad();
    const home = $('#home'), lst = svLista(); if(!lst.length || home.querySelector('.sv-home')) return r;
    const html = `<section class="fx-sec sv-home"><h2 class="sg-h">Sin abrir su plan nuevo</h2><div class="fx-list">${lst.map(x => { const h = Math.floor((Date.now() - new Date(x.act).getTime()) / 36e5), dd = Math.floor(h / 24);
      return `<div class="fx-row"><button type="button" class="fx-rb" data-fxopen="${esc(x.p.id)}" data-fxv="resumen"><i class="fx-d y"></i><span class="fx-rt"><b>${esc(x.p.nombre)}</b><span>Publicado hace ${dd} ${dd === 1 ? 'día' : 'días'} · ${x.vis ? 'abrió una versión anterior' : 'aún no lo abre'}</span></span>${FX_I.chev}</button></div>`; }).join('')}</div></section>`;
    const anchor = home.querySelector('.sg-home') || home.querySelector('.fx-mk') || home.querySelector('.fx-hd');
    anchor ? anchor.insertAdjacentHTML('afterend', html) : home.querySelector('.fx-page')?.insertAdjacentHTML('afterbegin', html);
  }catch(e){ console.error(e); }
  return r;
};
