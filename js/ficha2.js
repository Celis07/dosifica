/* ===================== FICHA DEL USUARIO · ORDEN VISUAL (nov 2026) =====================
   Se carga al final: reacomoda la cabecera y la vista Plan que arman panel2, seguimiento, acceso2…
   sin tocar su lógica (los botones originales se mueven, no se recrean, y conservan sus acciones).
   - Cabecera: estado del chequeo como punto en el avatar; condición en etiquetas cortas; Guardar,
     Enviar acceso, Duración y acciones del plan pasan al menú ⋯ (la ficha se guarda sola).
   - Acciones: Publicar + Mensaje y Bienestar con texto (Solicitudes solo si hay pendientes).
   - Secciones en pestañas visibles en vez del desplegable.
   - Plan: fase, semana y "Modificado" en un solo bloque con la línea de semanas; los días van
     primero y lo demás queda abajo en "Detalles del plan". Restablecer pide confirmación. */

const F2 = {menu: false};
const F2_I = {
  more: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>',
  save: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  cal: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  tpl: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  blank: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>',
  ai: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></svg>',
  reset: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>'
};
const f2Txt = el => (el && el.textContent || '').trim();
function f2Label(btn, txt, icon){
  if(!btn) return btn;
  const badge = btn.querySelector('.px-badge, .fx-bdot, .fx-pb');
  const svg = btn.querySelector('svg');
  btn.innerHTML = '';
  btn.insertAdjacentHTML('beforeend', svg ? svg.outerHTML : (icon || ''));
  btn.insertAdjacentHTML('beforeend', `<span class="f2-lt">${esc(txt)}</span>`);
  if(badge) btn.appendChild(badge);
  btn.removeAttribute('title');
  return btn;
}

function f2Head(out){
  const hd = out.querySelector(':scope > .fx-fhead'); if(!hd || hd.dataset.f2) return null;
  const who = hd.querySelector('.fx-who'); if(!who) return null;   // Banco o Tabla: no aplica
  hd.dataset.f2 = '1'; hd.classList.add('f2-head');
  const bar = hd.querySelector('.fx-fbar'), tags = hd.querySelector('.fx-tags'), acts = hd.querySelector('.fx-acts');
  const items = [];   // botones que van al menú ⋯

  // Guardar: la ficha se guarda sola; queda en el menú como "Guardar ahora"
  const sv = hd.querySelector('#bSave');
  if(sv){ sv.className = 'f2-mi'; f2Label(sv, 'Guardar ahora', F2_I.save); items.push(sv); }

  // Estado del chequeo: punto en el avatar
  const av = who.querySelector('.fx-av'), st0 = tags && tags.querySelector('.fx-tag[class*="st-"]');
  if(av){
    const k = st0 ? ((st0.className.match(/st-([a-z])/) || [])[1] || 'n') : null;
    const wrap = document.createElement('span'); wrap.className = 'f2-avw'; av.replaceWith(wrap); wrap.appendChild(av);
    if(k){ wrap.insertAdjacentHTML('beforeend', `<i class="f2-dot ${k}" role="img" aria-label="${esc(f2Txt(st0))}" title="${esc(f2Txt(st0))}"></i>`); st0.remove(); }
  }
  // Condición: etiquetas cortas (el texto completo queda como descripción accesible)
  const cond = who.querySelector('.fx-cond');
  if(cond && typeof fxCorto === 'function'){
    const parts = fxCorto(st).split(' · ').map(s => s.trim()).filter(Boolean);
    if(parts.length){ cond.title = f2Txt(cond); cond.classList.add('f2-cond'); cond.innerHTML = `<span class="sr">${esc(f2Txt(cond))}</span>` + parts.map(p => `<span class="f2-chip" aria-hidden="true">${esc(p.charAt(0).toUpperCase() + p.slice(1))}</span>`).join(''); }
  }
  // Lápiz: más discreto y con el nombre tocable
  const name = who.querySelector('.client'), pen = name && name.querySelector('.fx-pen');
  if(pen) pen.classList.add('f2-pen');

  if(tags){
    // La semana se muestra en el bloque de contexto del Plan
    [...tags.querySelectorAll('.fx-tag')].forEach(t => { if(/^Semana \d/.test(f2Txt(t))) t.remove(); });
    // Duración: si no tiene fecha va al menú; si la tiene, se queda visible
    const dur = tags.querySelector('.sg-dur.vacia');
    if(dur){ dur.className = 'f2-mi sg-dur'; f2Label(dur, 'Duración del plan', F2_I.cal); items.push(dur); }
  }
  // "Visto / Sin ver" como línea pequeña bajo Publicar
  const vis = tags && tags.querySelector('.sg-vis');
  let visLine = '';
  if(vis){ const ok = vis.classList.contains('ok'); visLine = `<p class="f2-vis${ok ? ' ok' : ''}">${ok ? esc(f2Txt(vis)) : 'Publicado · aún no lo ha visto'}</p>`; vis.remove(); }
  if(tags && !tags.children.length) tags.remove();

  if(acts){
    const msg = acts.querySelector('#bMsg'); if(msg){ msg.classList.add('f2-lb'); f2Label(msg, 'Mensaje'); }
    const rc = acts.querySelector('[data-fx="rcpp"]'); if(rc){ rc.classList.add('f2-lb'); f2Label(rc, 'Bienestar'); rc.setAttribute('aria-label', 'Bienestar en vivo'); }
    const bell = acts.querySelector('.fx-bell'), nr = (typeof pendingBy !== 'undefined' && pendingBy[curId]) || 0;
    if(bell){ if(nr){ bell.classList.add('f2-lb'); f2Label(bell, 'Solicitudes'); } else { bell.className = 'f2-mi'; f2Label(bell, 'Solicitudes'); items.push(bell); } }
    const acc = acts.querySelector('[data-fxacc]'); if(acc){ acc.className = 'f2-mi'; f2Label(acc, 'Enviar acceso a la app'); items.push(acc); }
    if(visLine) acts.insertAdjacentHTML('afterend', visLine);
  }

  // Menú ⋯
  if(bar && curId && !isExample){
    const box = document.createElement('div'); box.className = 'f2-more';
    box.innerHTML = `<button type="button" class="f2-mb" data-f2more aria-haspopup="true" aria-expanded="${F2.menu}" aria-label="Más acciones">${F2_I.more}</button><div class="f2-menu" role="menu" aria-label="Más acciones"${F2.menu ? '' : ' hidden'}></div>`;
    bar.appendChild(box);
    const m = box.querySelector('.f2-menu');
    items.forEach(b => { b.setAttribute('role', 'menuitem'); m.appendChild(b); });
  }
  return hd;
}

/* Pestañas visibles en lugar del desplegable "Sección" */
function f2Tabs(out){
  const nav = out.querySelector(':scope > .fx-secsel'); if(!nav || nav.dataset.f2) return;
  nav.dataset.f2 = '1'; nav.classList.add('f2-tabs');
  const badge = k => { const n = k === 'req' ? (pendingBy[curId] || 0) : k === 'ses' ? (tecPendBy[curId] || 0) : 0; return n ? `<span class="fx-pb" aria-label="${n} pendiente${n > 1 ? 's' : ''}">${n}</span>` : ''; };
  nav.setAttribute('role', 'tablist'); nav.setAttribute('aria-label', 'Secciones de la ficha');
  nav.innerHTML = FX_SECS.map(([k, l]) => `<button type="button" role="tab" data-view="${k}" aria-selected="${k === view}">${esc(l)}${badge(k)}</button>`).join('');
  nav.querySelector('[aria-selected="true"]')?.scrollIntoView?.({block: 'nearest', inline: 'nearest'});
}

/* Vista Plan: bloque de contexto, días primero y detalles abajo */
function f2Plan(out, hd){
  if(view !== 'plan') return;
  const ph = out.querySelector(':scope > .fx-phase'); if(!ph || ph.dataset.f2) return;
  ph.dataset.f2 = '1';
  const P0 = P[pkey(st)], phs = P0.phases[phaseIdx(st)], m = mesoWeek(st), w = num(st.semPlan) || 1;
  const edited = out.querySelector(':scope > .edited');
  const menu = hd && hd.querySelector('.f2-menu');
  // Acciones del plan (Planificar con Claude, Mis plantillas, Empezar en blanco) → menú
  const planBtns = [...ph.querySelectorAll('.actions > button')];
  if(menu && planBtns.length){
    menu.insertAdjacentHTML('beforeend', '<div class="f2-msep" role="separator"></div><p class="f2-mh">Plan de esta semana</p>');
    planBtns.forEach(b => {
      const ic = b.matches('[data-cp]') ? F2_I.ai : b.matches('[data-tplopen]') ? F2_I.tpl : b.matches('[data-blank]') ? F2_I.blank : '';
      b.className = 'f2-mi'; b.setAttribute('role', 'menuitem'); f2Label(b, f2Txt(b), ic); menu.appendChild(b);
    });
  }
  const reset = edited && edited.querySelector('#bReset');
  if(menu && reset){
    menu.insertAdjacentHTML('beforeend', '<div class="f2-msep" role="separator"></div>');
    reset.className = 'f2-mi f2-danger'; reset.setAttribute('role', 'menuitem'); f2Label(reset, 'Restablecer plan base', F2_I.reset);
    reset.insertAdjacentHTML('beforeend', '<small>Borra tus cambios de esta fase</small>');
    menu.appendChild(reset);
  }
  // Línea de semanas (de la tarjeta "Semanas")
  const semCard = [...out.querySelectorAll(':scope > section.fx-cc')].find(c => /^Semanas$/.test(f2Txt(c.querySelector('.fx-ch span'))));
  const tl = semCard && semCard.querySelector('.tl');
  // El objetivo de la fase pasa a Detalles
  const goal = `<section class="card fx-cc fx-closed f2-goal"><button type="button" class="fx-ch" data-fxcc="plan:Objetivo de la fase" aria-expanded="false"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg><span>Objetivo de la fase</span></button><p class="f2-gp"><b>${esc(phs.name)}.</b> ${esc(phs.goal)}</p><p class="f2-gp small">${esc(phs.when)}</p></section>`;
  ph.className = 'f2-ctx';
  ph.innerHTML = `<span class="f2-ce">${esc(phs.name)}</span>
    <div class="f2-cw"><b>Semana ${esc(w)} · ${esc(m.l)}</b>${edited ? '<span class="f2-mod" title="Cambiaste el plan base de esta fase">Modificado</span>' : ''}</div>`;
  if(tl){ tl.classList.add('f2-tl'); tl.setAttribute('aria-label', 'Semanas del plan'); ph.appendChild(tl); semCard.remove(); }
  if(edited) edited.remove();
  requestAnimationFrame(() => { const now = ph.querySelector('.tw.now'); if(now && tl) tl.scrollLeft = Math.max(0, now.offsetLeft - tl.offsetLeft - 12); });

  // Días primero; el resto de tarjetas va a "Detalles del plan"
  const days = out.querySelectorAll(':scope > section.card.day'); if(!days.length) return;
  const last = days[days.length - 1];
  const skip = c => c.classList.contains('tplcard') || c.classList.contains('cp-card') || c.classList.contains('cc-prop') || c.id === 'sgHist' || c.id === 'accCard';
  const rest = [...out.querySelectorAll(':scope > section.fx-cc')].filter(c => !skip(c) && !c.classList.contains('day'));
  const h = document.createElement('h2'); h.className = 'f2-dh'; h.textContent = 'Detalles del plan';
  last.after(h);
  let at = h;
  at.insertAdjacentHTML('afterend', goal); at = at.nextElementSibling;
  if(FX.open.has('plan:Objetivo de la fase')){ at.classList.remove('fx-closed'); at.querySelector('.fx-ch').setAttribute('aria-expanded', 'true'); }
  rest.forEach(c => { c.classList.add('f2-det'); at.after(c); at = c; });
  // Las referencias sueltas van con los detalles
  const refs = [...out.querySelectorAll(':scope > details, :scope > section.refs, :scope > .refs')];
  refs.forEach(r => { at.after(r); at = r; });
}

function f2Apply(){
  const app = $('#fisioApp'); if(!app || app.hidden || homeVisible()) return;
  const out = $('#out'); if(!out) return;
  const hd = f2Head(out);
  if(!hd) return;
  f2Tabs(out);
  try{ f2Plan(out, hd); }catch(e){ console.error(e); }
  out.classList.add('f2');
}
const _renderF2 = render;
render = function(){ const r = _renderF2.apply(this, arguments); try{ f2Apply(); }catch(e){ console.error(e); } return r; };
if(typeof accRender === 'function'){   // acceso repinta solo su tarjeta: el botón ya está en el menú
  const _accF2 = accRender;
  accRender = function(){ const r = _accF2.apply(this, arguments); F2.menu = false; f2Close(); return r; };
}

function f2Close(){
  const m = document.querySelector('#out .f2-menu'); if(!m) return;
  m.hidden = true; document.querySelector('#out [data-f2more]')?.setAttribute('aria-expanded', 'false');
}
// Restablecer: confirmación antes de borrar los cambios (fase de captura: va antes que vistas.js)
$('#out').addEventListener('click', e => {
  if(!e.target.closest('#out .f2-head #bReset')) return;
  if(!confirm('¿Restablecer el plan base? Se borran los cambios que hiciste en esta fase. La versión actual queda en el historial.')){ e.stopImmediatePropagation(); e.preventDefault(); return; }
  F2.menu = false;
}, true);
$('#out').addEventListener('click', e => {
  const mb = e.target.closest('[data-f2more]');
  if(mb){ const m = mb.nextElementSibling; F2.menu = m.hidden; m.hidden = !m.hidden; mb.setAttribute('aria-expanded', String(!m.hidden)); if(!m.hidden) m.querySelector('button')?.focus(); return; }
  const it = e.target.closest('.f2-menu .f2-mi');
  if(it && !it.matches('[data-blank]')){ F2.menu = false; f2Close(); }
});
document.addEventListener('click', e => { if(!e.target.closest('.f2-more')){ F2.menu = false; f2Close(); } });
document.addEventListener('keydown', e => {
  if(e.key !== 'Escape') return;
  const m = document.querySelector('#out .f2-menu:not([hidden])'); if(!m) return;
  F2.menu = false; f2Close(); document.querySelector('#out [data-f2more]')?.focus();
});
