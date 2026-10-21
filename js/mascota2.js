/* ===================== PESI Y NUTRIA, MÁS PRESENTES (oct 2026) =====================
   Aparecen cuando la persona hace algo: inicio, chequeo, fin de la sesión en vivo, hitos de racha,
   cambio de fase, pantallas vacías y sin conexión. En el panel del fisio, junto a cada paciente con su racha. */
const mkMini = (m, mood, acc, cls) => `<span class="${cls || 'mk-mini'}" aria-hidden="true">${MASC[m].svg(mood, acc)}</span>`;
const mkVars = 'mk-vars';
const MOOD_K = {n: 'normal', g: 'feliz', y: 'serio', r: 'curita'};

/* 1 y 2 · Inicio: la mascota saluda con el plan del día y pone la cara del chequeo */
function mkSaludo(c){
  const m = mascotaDe(); if(!m) return null;
  const hasW = wellness.some(x => x.fecha === todayISO()), k = hasW ? (todayLight()?.c || 'g') : 'n';
  const n = (c.dias || []).length, done = hDoneWeek(), di = hTodayIdx(c), d = c.dias[di];
  const hoy = d && sessions.some(s => s.fecha === todayISO() && s.dia === d.name);
  const semana = n && c.dias.every(x => done.has(x.name));
  let t;
  if(k === 'n') t = semana ? 'Ya cumpliste la semana. Hoy descansas, pero el chequeo igual cuenta.' : `Te falta el chequeo de hoy.${d ? ` Después: ${d.name}.` : ''}`;
  else if(hoy) t = 'Sesión de hoy lista. ¡Así se hace!';
  else if(semana) t = 'Semana cumplida. Hoy descansas.';
  else t = `Hoy toca ${d ? d.name : 'entrenar'}.` + (k === 'y' ? ' Sin subir peso.' : k === 'r' ? ' Hoy bajamos la carga.' : '');
  return {m, mood: MOOD_K[k], t};
}
/* 6 · El chequeo lo pregunta la mascota (solo la primera pregunta) */
function mkAsk(){
  const f = document.querySelector('#athleteApp #wf-aw'); const m = mascotaDe();
  if(!f || !m || f.querySelector('.mk-ask')) return;
  f.insertAdjacentHTML('afterbegin', `<div class="mk-ask ${mkVars}">${mkMini(m, 'normal', mkAcc(mkRacha()))}<p>¿Cómo dormiste y cómo amaneces? Empecemos por ahí.</p></div>`);
}
/* 5 · Cambio de fase */
function mkFase(c){
  const m = mascotaDe(); if(!m || !c.fase || !A.p?.id) return;
  const key = 'apex_mkfase_' + A.p.id, prev = LS.get(key), cur = c.fase.split(' · ')[0];
  if(prev === cur) return; LS.set(key, cur); if(!prev) return;
  setTimeout(() => celShow({html: `<div class="cel-sheet hito" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="celT"><span class="cel-grab" aria-hidden="true"></span>
    <div class="cel-mk">${MASC[m].svg('feliz', mkAcc(mkRacha()))}</div><span class="cel-s">Tu fisioterapeuta te subió de fase</span>
    <h2 class="cel-t" id="celT" style="text-align:center">${esc(hCap(hPhase(c)) || cur)}</h2><span class="cel-x">Lo que hiciste hasta aquí funcionó. Ahora, un paso más.</span>
    <button type="button" class="cel-btn" data-celok>Vamos</button></div>`}), 500);
}
const _renderAthleteMk2 = renderAthlete;
renderAthlete = function(){
  _renderAthleteMk2.apply(this, arguments);
  const app = $('#athleteApp'); if(!app) return;
  const c = A.plan?.contenido;
  // Inicio
  const hero = app.querySelector('.po-hero');
  if(hero && c && !hero.querySelector('.mk-say')){
    const s = mkSaludo(c);
    if(s){ const dot = hero.querySelector('.po-hs'); dot.classList.add('mk-hs', mkVars);
      dot.innerHTML = `${mkMini(s.m, s.mood, mkAcc(mkRacha()), 'mk-mini mk-hero')}<span class="po-ht mk-say"><b>${esc(s.t)}</b><span>${esc(hero.querySelector('.po-ht span')?.textContent || '')}</span></span>`; }
  }
  mkAsk();
  // 7 · Sin plan todavía
  app.querySelectorAll('.ap-card p, section.card p').forEach(p => {
    if(/aún no (publica|ha publicado) tu plan/i.test(p.textContent) && !p.parentElement.querySelector('.mk-empty')){
      const m = mascotaDe();
      p.insertAdjacentHTML('beforebegin', `<div class="mk-empty ${mkVars}">${m ? mkMini(m, 'normal') : mkMini('pesi', 'normal') + mkMini('nutria', 'normal')}</div>`);
      p.textContent = 'Tu fisioterapeuta está armando tu plan. Cuando lo publique, te avisamos y aparece aquí.';
    }
  });
  if(c) mkFase(c);
};

/* 3 · Fin de la sesión en vivo: misma media pantalla */
if(typeof lvFinish === 'function'){
  const _lvFinishMk = lvFinish;
  lvFinish = async function(){
    const before = sessions.length, info = L ? {min: Math.max(1, Math.round((lvNow() - L.t0) / 60000)), srpe: L.sum?.srpe, day: L.day?.name} : null;
    await _lvFinishMk.apply(this, arguments);
    const m = mascotaDe();
    if(!info || sessions.length <= before || !m) return;
    const lun = adMonday(), hechas = new Set(sessions.filter(s => s.fecha >= lun).map(s => s.dia)).size, plan = Math.max(1, (A.plan?.contenido?.dias || []).length);
    celShow({html: `<div class="cel-sheet" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="celT"><span class="cel-grab" aria-hidden="true"></span>
      <div class="cel-mk">${MASC[m].svg('feliz', mkAcc(mkRacha()))}</div><span class="cel-s" id="celT">Sesión completa · ${esc(info.day || '')}</span>
      <b class="cel-n" data-to="${info.min}">${Math.max(0, info.min - 1)}</b><span class="cel-d">minutos entrenando</span>
      <span class="cel-x">${info.srpe != null ? `RPE ${info.srpe} · ` : ''}${hechas} de ${plan} sesiones esta semana</span>
      <button type="button" class="cel-btn" data-celok>Seguir</button></div>`});
  };
}

/* 7 · Sin conexión: la mascota acompaña el aviso */
if(typeof netBadge === 'function'){
  const _netBadgeMk = netBadge;
  netBadge = function(){ _netBadgeMk.apply(this, arguments); const el = $('#netState'); const m = typeof me !== 'undefined' && me?.role === 'deportista' ? mascotaDe() : null;
    if(el && !el.hidden && m && el.classList.contains('off')) el.insertAdjacentHTML('afterbegin', `<span class="mk-net ${mkVars}">${MASC[m].svg('serio')}</span>`); };
}

/* 8 · Panel del fisio: mascota y racha de chequeos junto a cada paciente */
function mkRachaDe(p){
  const ses = (typeof allSes !== 'undefined' ? allSes : []).filter(x => x.paciente_id === p.id).map(x => x.fecha);
  const act = new Set([...(wellBy[p.id] || []).map(w => w.fecha), ...ses]);
  return rachaCalc(act, ses, nDias(p.st || {})).n;
}
const _renderHomeMk = renderHome;
renderHome = function(){
  const r = _renderHomeMk.apply(this, arguments);
  document.querySelectorAll('#home .fx-pat[data-fxopen]').forEach(b => {
    if(b.querySelector('.mk-pr')) return;
    const p = patients.find(x => x.id === b.dataset.fxopen); if(!p) return;
    const n = mkRachaDe(p); if(!n) return;
    const sx = p.st?.pf?.sexo, m = sx === 'm' ? 'nutria' : sx === 'h' ? 'pesi' : null;
    const tgt = b.querySelector('.fx-bdg, .fx-when');
    const html = `<span class="mk-pr ${mkVars}" title="Racha: ${n} ${n === 1 ? 'día' : 'días'} con chequeo o sesión (los descansos no la rompen)">${m ? MASC[m].svg(n >= 3 ? 'feliz' : 'normal') : ''}<b>${n}</b></span>`;
    tgt ? tgt.insertAdjacentHTML('beforebegin', html) : b.insertAdjacentHTML('beforeend', html);
  });
  return r;
};
