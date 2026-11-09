/* ===================== CAMBIO DE CUENTA FISIO ↔ USUARIO (nov 2026) =====================
   Solo para el administrador (Manuel), que tiene dos cuentas: la de fisio y su propio usuario.
   - En el panel: Cuenta → "Cambiar a mi cuenta de usuario". En la app del usuario: Mi fisio → "Volver a mi panel de fisio".
   - La primera vez pide la contraseña de la otra cuenta; después el celular guarda las dos sesiones y cambiar es un toque.
   - Es la cuenta real: lo que se registre en modo usuario queda guardado en su perfil de usuario.
   - Solo el admin ve el botón; el regreso solo aparece en un celular donde el admin ya hizo el cambio.
   - No toca la base de datos ni sus reglas: cada cuenta entra con su propia sesión y ve solo lo suyo.
   - Al cerrar sesión se borran las sesiones guardadas de las dos cuentas en este celular. */
const CM_KEY = 'apex_cc', CM_TOK = e => 'apex_cc_tok_' + e;
function cmGet(){ try{ return JSON.parse(LS.get(CM_KEY) || 'null') || {}; }catch(e){ return {}; } }
function cmSet(o){ LS.set(CM_KEY, JSON.stringify(o)); }
function cmTok(email){ try{ return JSON.parse(LS.get(CM_TOK(email)) || 'null'); }catch(e){ return null; } }
function cmLimpiar(){ try{ Object.keys(localStorage).filter(k => k === CM_KEY || k.indexOf('apex_cc_tok_') === 0).forEach(k => localStorage.removeItem(k)); }catch(e){} }
/* El regreso al panel solo existe si en este celular el admin ya conectó las dos cuentas */
function cmPuedeVolver(){ const c = cmGet(); return !!(c.fisio && c.usuario && me && me.email === c.usuario); }

/* Guarda la sesión actual para poder volver a ella sin contraseña */
async function cmGuardarActual(){
  const {data: {session}} = await sb.auth.getSession();
  if(!session) return false;
  LS.set(CM_TOK(me.email), JSON.stringify({access_token: session.access_token, refresh_token: session.refresh_token}));
  return true;
}
function cmEntrar(rol){ LS.set('apex_role', rol); location.reload(); }

/* destino: 'usuario' | 'fisio' */
async function cmCambiar(destino){
  if(!navigator.onLine){ toast('Para cambiar de cuenta necesitas internet.'); return; }
  if(me.role === 'deportista' && typeof obGet === 'function' && obGet().length){ toast('Tienes registros sin enviar. Espera a que se envíen y vuelve a intentarlo.'); return; }
  const c = cmGet(), email = destino === 'usuario' ? c.usuario : c.fisio, tok = email && cmTok(email);
  if(!tok){ cmDialogo(destino); return; }
  cmOcupado(true);
  if(!await cmGuardarActual()){ cmOcupado(false); toast('No se pudo leer tu sesión. Vuelve a entrar.'); return; }
  const actual = cmTok(me.email);
  await pushOff();
  const {data, error} = await sb.auth.setSession(tok);
  if(error || !data?.session || (data.session.user.email || '').toLowerCase() !== email){
    // La sesión guardada venció: volvemos a la actual y pedimos la contraseña una vez
    LS.set(CM_TOK(email), null);
    if(actual) await sb.auth.setSession(actual).catch(() => {});
    cmOcupado(false); cmDialogo(destino); return;
  }
  cmEntrar(destino === 'usuario' ? 'deportista' : 'fisio');
}
function cmOcupado(on){ document.querySelectorAll('[data-cm]').forEach(b => { b.disabled = on; b.classList.toggle('busy', on); }); }

/* Primera vez (o sesión vencida): correo y contraseña de la otra cuenta */
function cmDialogo(destino){
  const c = cmGet(), fijo = destino === 'fisio' ? c.fisio : '';
  let d = $('#cmDlg');
  if(!d){ d = document.createElement('div'); d.id = 'cmDlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'cmDlgT'); document.body.append(d); }
  d.hidden = false;
  d.innerHTML = `<form class="md-card cm-card" id="cmForm" novalidate>
    <h2 id="cmDlgT">${destino === 'usuario' ? 'Tu cuenta de usuario' : 'Tu panel de fisio'}</h2>
    <p class="cm-sub">${destino === 'usuario' ? 'Escribe el correo y la contraseña de tu cuenta de usuario. Solo te la pedimos esta vez: después cambias con un toque.' : 'Tu sesión de fisio venció en este celular. Escribe tu contraseña para volver.'}</p>
    <label class="f">Correo<input id="cmE" type="email" autocomplete="username" inputmode="email" value="${esc(fijo || c.usuario || '')}" ${fijo ? 'readonly' : ''} required></label>
    <label class="f">Contraseña<input id="cmP" type="password" autocomplete="current-password" required></label>
    <p class="cm-msg" id="cmMsg" role="status" aria-live="polite"></p>
    <div class="cm-acts"><button type="submit" class="primary" id="cmOk">Entrar</button><button type="button" id="cmNo">Cancelar</button></div>
  </form>`;
  const cerrar = () => { d.hidden = true; d.innerHTML = ''; };
  $('#cmNo').onclick = cerrar;
  d.onclick = e => { if(e.target === d) cerrar(); };
  d.onkeydown = e => { if(e.key === 'Escape') cerrar(); };
  setTimeout(() => (fijo || $('#cmE').value ? $('#cmP') : $('#cmE')).focus(), 30);
  $('#cmForm').onsubmit = async e => {
    e.preventDefault();
    const email = ($('#cmE').value || '').trim().toLowerCase(), pass = $('#cmP').value, msg = $('#cmMsg'), ok = $('#cmOk');
    const err = t => { msg.textContent = t; msg.className = 'cm-msg err'; ok.disabled = false; ok.classList.remove('busy'); };
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err('Escribe un correo válido.');
    if(email === me.email) return err('Ese es el correo con el que ya estás. Escribe el de tu otra cuenta.');
    if(!pass) return err('Escribe la contraseña.');
    ok.disabled = true; ok.classList.add('busy'); msg.textContent = ''; msg.className = 'cm-msg';
    if(!await cmGuardarActual()) return err('No se pudo leer tu sesión actual. Vuelve a entrar.');
    const yo = me.email, actual = cmTok(yo);
    await pushOff();
    const {data, error} = await sb.auth.signInWithPassword({email, password: pass});
    if(error || !data?.session){ if(actual) await sb.auth.setSession(actual).catch(() => {}); return err(/invalid/i.test(error?.message || '') ? 'Correo o contraseña incorrectos.' : 'No se pudo entrar. Revisa la conexión.'); }
    // ¿La cuenta nueva es del tipo que se pidió?
    const {data: f} = await sb.from('fisios').select('email').maybeSingle();
    const esFisio = !!f;
    if((destino === 'usuario') === esFisio){
      if(actual) await sb.auth.setSession(actual).catch(() => {});
      return err(destino === 'usuario' ? 'Ese correo es de fisioterapeuta. Usa el de tu cuenta de usuario.' : 'Ese correo no es de fisioterapeuta.');
    }
    cmSet(destino === 'usuario' ? {fisio: yo, usuario: email} : {fisio: email, usuario: yo});
    cmEntrar(destino === 'usuario' ? 'deportista' : 'fisio');
  };
}

/* Cerrar sesión borra también las sesiones guardadas de las dos cuentas */
const _hardSignOutCm = hardSignOut;
hardSignOut = async function(){ cmLimpiar(); return _hardSignOutCm.apply(this, arguments); };

/* ---------- Botón en el panel: Cuenta (solo administrador) ---------- */
function cmFisioSec(){
  const c = cmGet(), listo = c.usuario && cmTok(c.usuario);
  return `<section class="fx-sec fx-cm"><h2>Tu cuenta de usuario</h2><div class="fx-list">
    <button type="button" class="fx-rb" data-cm="usuario"><span class="fx-ic sq">${FX_I.pacientes}</span><span class="fx-rt"><b>Cambiar a mi cuenta de usuario</b><span>${listo ? `Entras como ${esc(c.usuario)}` : 'Ves y usas Ápex como lo ven tus usuarios'}</span></span>${FX_I.chev}</button>
  </div></section>`;
}
const _renderHomeCm = renderHome;
renderHome = function(){
  const r = _renderHomeCm.apply(this, arguments);
  if(typeof FX !== 'undefined' && FX.tab === 'cuenta' && fxAdmin && !document.querySelector('#home .fx-cm')){
    // Justo debajo de la tarjeta con tu nombre: es lo primero que se busca en Cuenta
    const page = document.querySelector('#home .fx-page'), yo = page && page.querySelector('.fx-me');
    yo ? yo.insertAdjacentHTML('afterend', cmFisioSec()) : page?.insertAdjacentHTML('beforeend', cmFisioSec());
  }
  return r;
};

/* ---------- Botón en la app del usuario: junto a Cerrar sesión ---------- */
const _renderAthleteCm = renderAthlete;
renderAthlete = function(){
  const r = _renderAthleteCm.apply(this, arguments);
  if(cmPuedeVolver() && !$('#cmVolver')){
    const out = $('#athleteApp #aOut');
    if(out) out.insertAdjacentHTML('beforebegin', `<button type="button" class="ap-row cm-volver" id="cmVolver" data-cm="fisio"><span class="ap-l"><b>Volver a mi panel de fisio</b><span>${esc(cmGet().fisio || '')}</span></span><span class="cm-chev" aria-hidden="true">›</span></button>`);
  }
  return r;
};

document.addEventListener('click', e => {
  const b = e.target.closest('[data-cm]'); if(!b || b.disabled) return;
  e.preventDefault(); e.stopPropagation();
  if(b.dataset.cm === 'usuario' && !(me.role === 'fisio' && fxAdmin)) return;   // solo el administrador
  if(b.dataset.cm === 'fisio' && !cmPuedeVolver()) return;
  cmCambiar(b.dataset.cm);
}, true);
