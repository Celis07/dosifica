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

async function swReg(){
  if(!('serviceWorker' in navigator)) return null;
  try{ return await navigator.serviceWorker.getRegistration() || await navigator.serviceWorker.register('sw.js'); }catch(e){ return null; }
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
async function enablePush(rol){
  const st0 = await pushState();
  if(st0 === 'install'){ toast('En iPhone primero instala la app: Compartir → Agregar a inicio, y ábrela desde el ícono.'); return false; }
  if(st0 === 'unsupported'){ toast('Este navegador no permite notificaciones. Prueba con Chrome o con la app instalada.'); return false; }
  if(st0 === 'denied'){ toast('Las notificaciones están bloqueadas para Ápex. Actívalas en los ajustes del navegador.'); return false; }
  const perm = await Notification.requestPermission();
  if(perm !== 'granted'){ toast('Sin permiso no podemos avisarte.'); return false; }
  const reg = await swReg(); if(!reg){ toast('No se pudo preparar el dispositivo. Recarga la página.'); return false; }
  await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  try{ if(!sub) sub = await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:b64u(VAPID_PUB)}); }
  catch(e){ toast('No se pudo activar en este dispositivo.'); return false; }
  if(!(await saveSub(sub, rol))){ toast('No se pudo guardar. Revisa tu conexión.'); return false; }
  sb.rpc('probar_push').then(()=>{}, ()=>{});
  toast('Notificaciones activadas. Te llegará una de prueba.');
  return true;
}
/* Al entrar: si ya había permiso, renueva la suscripción a nombre de quien entró */
async function syncPush(rol){
  try{ if(!pushSupported() || Notification.permission !== 'granted') return;
    const reg = await swReg(); const sub = reg && await reg.pushManager.getSubscription(); if(sub) await saveSub(sub, rol); }catch(e){}
}
/* Al salir: este dispositivo deja de recibir avisos de esta cuenta */
async function pushOff(){
  try{ const reg = await swReg(); const sub = reg && await reg.pushManager.getSubscription();
    if(sub){ await sb.rpc('quitar_push', {p_endpoint: sub.endpoint}); await sub.unsubscribe(); } }catch(e){}
}

/* Tarjeta en el portal del deportista */
let A_PUSH = null; // estado cacheado para pintar sin esperar
function pushCard(){
  if(A_PUSH === null){ pushState().then(s=>{ A_PUSH=s; if(me.role==='deportista') renderAthlete(); }); return ''; }
  if(A_PUSH === 'on' || A_PUSH === 'unsupported' || LS.get('apex_push_hide')==='1') return '';
  const txt = A_PUSH === 'install'
    ? 'En iPhone, instala la app para recibir avisos: toca <b>Compartir</b> y luego <b>Agregar a inicio</b>. Ábrela desde el ícono y vuelve aquí.'
    : A_PUSH === 'denied' ? 'Bloqueaste las notificaciones de Ápex. Para recibir avisos, actívalas en los ajustes del navegador.'
    : 'Te avisamos cuando tu fisioterapeuta publique tu plan y te recordamos registrar cómo amaneciste. Nada más.';
  return `<section class="card pushc"><div class="rowhead"><h3 class="sec" style="margin:0">Avisos en tu celular</h3><button class="linkbtn" id="pushHide" style="min-height:0;padding:0">Ahora no</button></div>
    <p class="small" style="margin:6px 0 10px">${txt}</p>${A_PUSH==='off'?'<button class="primary" id="pushOn">Activar notificaciones</button>':''}</section>`;
}
$('#athleteApp').addEventListener('click', async e=>{
  if(e.target.closest('#pushOn')){ if(await enablePush('deportista')){ A_PUSH='on'; renderAthlete(); } return; }
  if(e.target.closest('#pushHide')){ LS.set('apex_push_hide','1'); renderAthlete(); }
});
