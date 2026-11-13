/* ===================== ENLACE DE REGISTRO SIN CORREO (nov 2026) =====================
   El fisio ya no necesita el correo de la persona para darle acceso.
   - Fisio: en "Enviar acceso", si la ficha no tiene correo, el botón principal es "Crear enlace de registro"
     (copiar / WhatsApp / compartir). Escribir el correo uno mismo queda como alternativa debajo.
     El enlace sirve para esa ficha, una sola vez, y vence en 7 días. Crear otro anula el anterior.
   - Persona: abre el enlace → "Hola, Paola" → escribe su correo → Continuar. La función "invitacion"
     une ese correo a su ficha y abre la sesión; luego sigue lo de siempre: consentimiento → contraseña → plan.
   - La vista previa de WhatsApp no gasta el enlace: solo se usa al tocar Continuar. */
const INV = {id: null, link: '', busy: false, msg: '', kind: '', alt: false};

async function invCall(body){
  let res; try{ res = await sb.functions.invoke('invitacion', {body}); }catch(e){ res = {error: e}; }
  if(res.error || !res.data || res.data.error){
    let txt = res.data?.error || 'No hay conexión. Revisa el internet e inténtalo de nuevo.';
    try{ const b = res.error?.context && await res.error.context.json(); if(b?.error) txt = b.error; }catch(e){}
    return {error: txt};
  }
  return res.data;
}

/* ---------- Panel del fisio: tarjeta de acceso cuando no hay correo ---------- */
const _accRowHTMLInv = accRowHTML;
accRowHTML = function(){
  if(!curId || isExample || (st.email || '').trim() || (INV.alt && INV.id === curId)) {
    const h = _accRowHTMLInv.apply(this, arguments);
    if(INV.alt && INV.id === curId && !(st.email || '').trim()) return h + '<p class="small" style="margin:8px 0 0"><button type="button" class="linkbtn" id="invBack">Mejor crear un enlace de registro sin correo</button></p>';
    return h;
  }
  const a = INV.id === curId ? INV : {link: '', busy: false, msg: '', kind: ''};
  const nom = esc((st.nombre || 'la persona').split(' ')[0]);
  return `<div class="accbox">
    <div class="acc-h">Acceso de ${esc(st.nombre || 'la persona')}</div>
    <p class="small" style="margin:2px 0 8px">Envíale un enlace y ${nom} crea su cuenta con su propio correo. No necesitas saberlo.</p>
    <div class="actions" style="margin:0"><button type="button" class="dark" id="invMake"${a.busy ? ' disabled' : ''}>${a.busy ? 'Creando…' : (a.link ? 'Crear otro enlace' : 'Crear enlace de registro')}</button></div>
    ${a.link ? `<label class="f" style="margin-top:8px">Enlace de registro<input type="text" id="invUrl" readonly value="${esc(a.link)}"></label>
      <div class="actions" style="margin-top:6px"><button type="button" id="invCopy">Copiar enlace</button><button type="button" id="invWa">Enviar por WhatsApp</button>${navigator.share ? '<button type="button" id="invShare">Compartir…</button>' : ''}</div>
      <p class="small" style="margin:6px 0 0">Sirve una sola vez y vence en 7 días. Si creas otro, este deja de servir. Envíaselo solo a ${nom}, no a un grupo.</p>` : ''}
    ${a.msg ? `<p class="lgmsg ${a.kind || ''}" style="margin:6px 0 0" role="status">${a.msg}</p>` : ''}
    <p class="small" style="margin:10px 0 0"><button type="button" class="linkbtn" id="invAlt">Ya tengo su correo: escribirlo yo</button></p>
  </div>`;
};
function invMsg(){
  const n = (st.nombre || '').trim().split(/\s+/)[0];
  return `Hola${n ? ' ' + n : ''}, este es tu enlace para crear tu cuenta en Ápex y ver tu plan de entrenamiento: ${INV.link}\n\nÁbrelo, escribe tu correo y sigue los pasos. Sirve una sola vez y vence en 7 días.`;
}
async function invMake(){
  if(/sin guardar/i.test($('#saveState')?.textContent || '')) await save(true);
  INV.id = curId; INV.busy = true; INV.msg = ''; INV.link = ''; accRender();
  const r = await invCall({accion: 'crear', paciente_id: curId});
  INV.busy = false;
  if(r.error){ INV.msg = esc(r.error); INV.kind = 'err'; return accRender(); }
  INV.link = `${APP_URL}#invita=${encodeURIComponent(r.token)}`; INV.msg = ''; accRender();
  const inp = $('#invUrl'); if(inp){ inp.focus(); inp.select(); }
}
document.addEventListener('click', async e => {
  const q = s => e.target.closest(s);
  if(q('#invMake')) return invMake();
  if(q('#invCopy')){ try{ await navigator.clipboard.writeText(INV.link); toast('Enlace copiado'); }catch(_){ const i = $('#invUrl'); if(i){ i.focus(); i.select(); try{ document.execCommand('copy'); toast('Enlace copiado'); }catch(__){ toast('Mantén presionado el enlace para copiarlo'); } } } return; }
  if(q('#invWa')) return window.open('https://wa.me/?text=' + encodeURIComponent(invMsg()), '_blank', 'noopener');
  if(q('#invShare')) return navigator.share({title: 'Tu cuenta en Ápex', text: invMsg()}).catch(() => {});
  if(q('#invAlt')){ INV.id = curId; INV.alt = true; accRender(); setTimeout(() => $('#accEmail')?.focus(), 30); return; }
  if(q('#invBack')){ INV.alt = false; accRender(); return; }
});

/* ---------- La persona abre el enlace ---------- */
function invParse(){ const h = location.hash.replace(/^#/, ''); if(!/(^|&)invita=/.test(h)) return null; return new URLSearchParams(h).get('invita') || null; }
async function invScreen(token, bootFn){
  $('#login').hidden = false; $('#fisioApp').hidden = true; $('#athleteApp').hidden = true;
  ['loginForm', 'pwdForm', 'otpForm', 'lgOk'].forEach(id => { const el = document.getElementById(id); if(el) el.hidden = true; });
  let box = $('#invForm'); if(!box){ box = document.createElement('form'); box.id = 'invForm'; box.className = 'lgform'; box.noValidate = true; $('#pwdForm').after(box); }
  box.hidden = false;
  const leave = () => { box.hidden = true; accClearHash(); bootFn(); };
  box.innerHTML = '<p class="lgmsg" role="status" aria-live="polite">Revisando tu enlace…</p>';
  const info = await invCall({accion: 'info', token});
  if(info.error){
    box.innerHTML = `<div class="lghead"><h2>Enlace no disponible</h2><p>${esc(info.error)}</p></div>
      <button type="button" class="lgbtn" id="invLeave"><span>Ir a entrar</span></button>`;
    $('#invLeave').onclick = leave; return;
  }
  box.innerHTML = `<div class="lghead"><h2>Hola${info.nombre ? ', ' + esc(info.nombre) : ''}</h2>
      <p>Tu fisioterapeuta te invitó a Ápex para ver tu plan. Escribe tu correo: será tu usuario para entrar. Luego aceptas el consentimiento y creas tu contraseña.</p></div>
    <div class="lggroup">
      <label class="lgrow"><span>Correo</span><input type="email" id="invEmail" autocomplete="email" inputmode="email" placeholder="tu@correo.com" required></label>
      <div class="lgsep"></div>
      <label class="lgrow"><span>Repítelo</span><input type="email" id="invEmail2" autocomplete="off" inputmode="email" placeholder="tu@correo.com" required></label>
    </div>
    <button class="lgbtn" id="invGo" type="submit"><span>Continuar</span></button>
    <p class="lgmsg" id="invMsg" role="status" aria-live="polite"></p>
    <button type="button" class="lglink" id="invHave">Ya tengo cuenta: entrar</button>`;
  $('#invHave').onclick = leave;
  setTimeout(() => $('#invEmail')?.focus(), 30);
  const msg = (t, k) => { const m = $('#invMsg'); m.innerHTML = t; m.className = 'lgmsg ' + (k || ''); };
  box.onsubmit = async ev => {
    ev.preventDefault();
    const a = $('#invEmail').value.trim().toLowerCase(), b = $('#invEmail2').value.trim().toLowerCase();
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a)){ msg('Ese correo no es válido. Revísalo.', 'err'); shake($('#invEmail')); $('#invEmail').focus(); return; }
    if(a !== b){ msg('Los dos correos no coinciden.', 'err'); shake($('#invEmail2')); $('#invEmail2').focus(); return; }
    const btn = $('#invGo'); btn.disabled = true; btn.classList.add('busy'); msg('Creando tu cuenta…');
    const r = await invCall({accion: 'usar', token, email: a});
    if(r.error){ btn.disabled = false; btn.classList.remove('busy'); msg(esc(r.error), 'err'); return; }
    try{ await sb.auth.signOut({scope: 'local'}); }catch(e){}
    const {error} = await sb.auth.verifyOtp({token_hash: r.token, type: r.tipo || 'magiclink'});
    btn.disabled = false; btn.classList.remove('busy');
    if(error){ msg('Tu cuenta quedó creada, pero no se pudo abrir la sesión. Toca "Ya tengo cuenta: entrar" y usa "Entrar con el código de tu correo".', 'err'); return; }
    LS.set('apex_setpwd', '1');   // después del consentimiento, crea su contraseña
    box.hidden = true; accClearHash(); bootFn();
  };
}
if(typeof boot === 'function'){
  const _bootInv = boot;
  boot = async function(){ const t = invParse(); if(t) return invScreen(t, _bootInv); return _bootInv(); };
}
