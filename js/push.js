/* ===================== NOTIFICACIONES PUSH =====================
   Cada dispositivo se suscribe una vez (botón "Activar notificaciones").
   El envío lo hace la función "push" de Supabase:
   - fisio: alertas de dolor alto o "peor a las 24 h".
   - deportista: plan publicado, "¿cómo amaneció tu rodilla?" (7:30 a. m.) y aviso tras 3 días sin registrar (6 p. m.). */
const VAPID_PUB = 'BMxTozeEMap6-8QMeks0NTouzttz9wgP56TIjTdsQJBHI_s84KT5LfOvsI4clJFlgTUAqALUBB62rrdqA3d0YLs';
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
function b64u(s){ const p='='.repeat((4-s.length%4)%4), b=atob((s+p).replace(/-/g,'+').replace(/_/g,'/')); return Uint8Array.from(b, c=>c.charCodeAt(0)); }

let SW_REG = null; // registro listo de antemano: en iPhone la suscripción tiene que ocurrir pegada al toque
if('serviceWorker' in navigator){ navigator.serviceWorker.ready.then(r => { SW_REG = r; }).catch(() => {}); }
async function swReg(){
  if(SW_REG) return SW_REG;
  if(!('serviceWorker' in navigator)) return null;
  try{ SW_REG = await navigator.serviceWorker.getRegistration() || await navigator.serviceWorker.register('sw.js'); return SW_REG; }catch(e){ return null; }
}
/* Estado en este dispositivo: on | off | denied | install | unsupported */
async function pushState(){
  if(isIOS && !isStandalone()) return 'install';
  if(!pushSupported()) return 'unsupported';
  if(Notification.permission === 'denied') return 'denied';
  const reg = await swReg(); const sub = reg && await reg.pushManager.getSubscription().catch(()=>null);
  return (sub && Notification.permission === 'granted') ? 'on' : 'off';
}
async function saveSub(sub, rol){
  const j = sub.toJSON();
  const {error} = await sb.rpc('registrar_push', {p_endpoint:j.endpoint, p_p256dh:j.keys.p256dh, p_auth:j.keys.auth, p_rol:rol});
  return !error;
}
/* Se llama directo desde el toque. Sin esperas antes de pedir permiso y suscribir:
   Safari en iPhone bloquea la suscripción si el toque "se enfría". */
async function enablePush(rol){
  if(isIOS && !isStandalone()){ toast('En iPhone primero instala la app: Compartir → Agregar a inicio, y ábrela desde el ícono.'); return false; }
  if(!pushSupported()){ toast('Este navegador no permite notificaciones. Prueba con Chrome o con la app instalada.'); return false; }
  if(Notification.permission === 'denied'){ toast('Las notificaciones están bloqueadas para Ápex. Actívalas en Ajustes → Notificaciones → Ápex.'); return false; }
  const regNow = SW_REG;   // ya preparado al abrir la app
  let sub = null, err = null;
  try{
    const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if(perm !== 'granted'){ toast('Sin permiso no podemos avisarte.'); return false; }
    const reg = regNow || await swReg();
    if(!reg){ toast('No se pudo preparar el dispositivo. Cierra la app y ábrela de nuevo.'); return false; }
    sub = await reg.pushManager.getSubscription();
    if(!sub) sub = await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:b64u(VAPID_PUB)});
  }catch(e){ err = e; }
  if(!sub){
    console.error('push subscribe', err);
    toast(err && /NotAllowed|gesture|user/i.test(String(err.name || err.message)) ? 'El celular no dejó activarlas. Toca el botón otra vez.' : 'No se pudo activar en este dispositivo. Cierra la app, ábrela y toca de nuevo.');
    return false;
  }
  if(!(await saveSub(sub, rol))){ toast('No se pudo guardar. Revisa tu conexión.'); return false; }
  sb.rpc('probar_push').then(()=>{}, ()=>{});
  toast('Notificaciones activadas. Te llegará una de prueba.');
  return true;
}
/* Al entrar: si este dispositivo ya está suscrito, lo registra a nombre de quien entró */
async function syncPush(rol){
  try{ if(!pushSupported() || Notification.permission !== 'granted') return;
    const reg = await swReg(); const sub = reg && await reg.pushManager.getSubscription(); if(sub) await saveSub(sub, rol); }catch(e){}
}
/* Al salir: esta cuenta deja de recibir avisos en este dispositivo, pero el celular conserva la suscripción
   (en iPhone volver a suscribirse exige otro toque); al entrar de nuevo, syncPush la reasigna sola. */
async function pushOff(){
  const run = (async () => { try{ const reg = await swReg(); const sub = reg && await reg.pushManager.getSubscription();
    if(sub) await sb.rpc('quitar_push', {p_endpoint: sub.endpoint}); }catch(e){} })();
  await Promise.race([run, new Promise(r => setTimeout(r, 3000))]);   // nunca bloquea el cierre de sesión
}

/* Tarjeta en el portal del deportista */
let A_PUSH = null; // estado cacheado para pintar sin esperar
function pushCard(){
  if(A_PUSH === null){ pushState().then(s=>{ A_PUSH=s; if(me.role==='deportista') renderAthlete(); }); return ''; }
  if(A_PUSH === 'on' || A_PUSH === 'unsupported' || LS.get('apex_push_hide')==='1') return '';
  const txt = A_PUSH === 'install'
    ? 'En iPhone, para recibir avisos agrega Ápex a tu pantalla de inicio: en Safari toca <b>Compartir</b> (cuadro con flecha) → <b>Agregar a inicio</b>. Luego ábrela desde el ícono y vuelve aquí.'
    : A_PUSH === 'denied' ? 'Bloqueaste las notificaciones de Ápex. Para recibir avisos, actívalas en los ajustes del navegador.'
    : 'Te avisamos cuando tu fisioterapeuta publique tu plan y te recordamos registrar cómo amaneciste. Nada más.';
  return `<section class="card pushc"><div class="rowhead"><h3 class="sec" style="margin:0">Avisos en tu celular</h3><button class="linkbtn" id="pushHide" style="min-height:0;padding:0">Ahora no</button></div>
    <p class="small" style="margin:6px 0 10px">${txt}</p>${A_PUSH==='off'?'<button class="primary" id="pushOn">Activar notificaciones</button>':''}</section>`;
}
/* Sección "Notificaciones" en Mi fisio: el deportista prende o apaga cada tipo de aviso.
   Se guarda en pacientes.avisos ({tipo:false} = apagado; sin dato = prendido). La función push lo respeta. */
const AV_TIPOS = [
  ['mensaje', 'Mensajes de tu fisioterapeuta', 'Cuando tu fisioterapeuta te escribe.', 'mensajes'],
  ['plan', 'Plan nuevo', 'Cuando tu fisioterapeuta publica tu plan.', 'plan nuevo'],
  ['chequeo', 'Recordatorio del chequeo', 'En la mañana, si no has hecho el chequeo del día.', 'recordatorio del chequeo'],
  ['d24', '¿Cómo amaneciste?', 'La mañana después de entrenar, para contar cómo amaneció la zona.', '“¿cómo amaneciste?”'],
  ['agenda', 'Recordatorio de tu sesión', '30 minutos antes de la hora que elegiste para entrenar.', 'recordatorio de tu sesión'],
  ['inactivo', 'Días sin entrenar', 'Si llevas 3 días sin registrar sesión.', 'días sin entrenar']
];
function avisoOn(t){ return A.p?.avisos?.[t] !== false; }
function avisosSec(){
  if(A_PUSH === null){ pushCard(); return ''; }
  const dev = A_PUSH === 'on', ok = dev || A_PUSH === 'off' || A_PUSH === 'install';
  const mod = A.plan?.contenido?.modulo || 'rodilla';
  const tipos = AV_TIPOS.filter(([t]) => t !== 'd24' || mod === 'rodilla' || mod === 'lumbar' || A.plan?.contenido?.rehab?.zona);
  const nota = A_PUSH === 'install' ? 'En iPhone primero instala la app: toca Compartir y luego Agregar a inicio. Ábrela desde el ícono.'
    : A_PUSH === 'denied' ? 'Las notificaciones están bloqueadas en este celular. Actívalas en los ajustes del navegador.'
    : A_PUSH === 'unsupported' ? 'Este navegador no permite notificaciones. Prueba con Chrome o con la app instalada.'
    : 'Elige de qué te avisamos. Lo que apagues sigue apareciendo aquí en la app.';
  const pasos = A_PUSH === 'install' ? `<div class="ap-card av-inst"><p><b>Para recibir avisos en iPhone, Ápex tiene que estar en tu pantalla de inicio:</b></p>
    <ol><li>En Safari, toca <b>Compartir</b> <span aria-hidden="true">(el cuadro con la flecha hacia arriba)</span>.</li><li>Elige <b>Agregar a inicio</b> y luego <b>Agregar</b>.</li><li>Cierra Safari y abre <b>Ápex desde el ícono</b> nuevo.</li><li>Vuelve aquí y activa los avisos.</li></ol></div>` : '';
  return `<section class="ap-sec" id="avSec"><div class="ap-head"><h2>Notificaciones</h2></div>${pasos}${A_PUSH === 'install' ? '' : `<p class="ap-note av-note">${nota}</p>`}<div class="ap-list">${tipos.map(([t, tit, txt]) =>
    `<label class="ap-row ap-swrow"><span class="ap-l"><b>${tit}</b><span>${txt}</span></span>
      <input type="checkbox" class="ap-sw" data-av="${t}" role="switch" ${dev && avisoOn(t) ? 'checked' : ''} ${ok ? '' : 'disabled'}></label>`).join('')}</div></section>`;
}
async function setAviso(t, v){
  if(!A.p?.id) return false;
  const {data, error} = await sb.rpc('set_aviso', {pid:A.p.id, p_tipo:t, p_on:v});
  if(error){ toast('No se pudo guardar. Revisa tu conexión.'); return false; }
  A.p.avisos = data || Object.assign({}, A.p.avisos, {[t]:v}); return true;
}
$('#athleteApp').addEventListener('change', async e=>{
  const sw = e.target.closest('[data-av]'); if(!sw) return;
  const t = sw.dataset.av, want = sw.checked, nom = (AV_TIPOS.find(x => x[0] === t) || [])[3] || 'avisos'; sw.disabled = true;
  if(want && A_PUSH === 'install'){ sw.checked = false; sw.disabled = false; toast('Primero agrega Ápex a tu pantalla de inicio y ábrela desde el ícono.'); document.querySelector('#avSec .av-inst')?.scrollIntoView({behavior: 'smooth', block: 'center'}); return; }
  if(want && A_PUSH !== 'on'){
    if(await enablePush('deportista')){ A_PUSH = 'on';
    } else { renderAthlete(); return; }
  }
  if(await setAviso(t, want)) toast(want ? `Avisos de ${nom} activados.` : `Avisos de ${nom} desactivados.`);
  renderAthlete();
});
$('#athleteApp').addEventListener('click', async e=>{
  if(e.target.closest('#pushOn')){ if(await enablePush('deportista')){ A_PUSH='on'; renderAthlete(); } return; }
  if(e.target.closest('#pushHide')){ LS.set('apex_push_hide','1'); renderAthlete(); }
});
