/* ===================== ACCESO DEL DEPORTISTA: CORREO O ENLACE ===================== */
// El fisio registra el correo del deportista (es su usuario) y le da acceso de dos formas:
//  1) Correo: Supabase le envía un enlace para entrar (con el SMTP configurado).
//  2) Enlace para copiar o mandar por WhatsApp: un token de un solo uso que genera la función "acceso".
//     El enlace abre Ápex y la sesión solo se activa cuando la persona toca "Entrar", así la vista previa
//     de WhatsApp no lo gasta. Al entrar, la app le pide crear su contraseña.
const APP_URL = location.origin + location.pathname;
const sbInvite = supabase.createClient(SB_URL, SB_KEY, {auth:{persistSession:false, autoRefreshToken:false, detectSessionInUrl:false, storageKey:'apex-invite'}});
let ACC = {id:null, link:'', busy:'', msg:'', kind:''};

function accRowHTML(){
  if(!curId || isExample) return '<p class="small" style="margin:0">Guarda el paciente para darle acceso a su portal.</p>';
  const email=(st.email||'').trim();
  if(!email) return '<p class="small" style="margin:0">Escribe su correo: será su usuario para entrar y crear su contraseña.</p>';
  const a = ACC.id===curId ? ACC : {link:'', busy:'', msg:'', kind:''};
  return `<div class="accbox">
    <div class="acc-h">Acceso de ${esc(st.nombre||'el deportista')}</div>
    <div class="actions" style="margin:0">
      <button type="button" id="accMail"${a.busy?' disabled':''}>${a.busy==='mail'?'Enviando…':'Enviar correo de acceso'}</button>
      <button type="button" class="dark" id="accLink"${a.busy?' disabled':''}>${a.busy==='link'?'Generando…':(a.link?'Generar otro enlace':'Crear enlace para enviar')}</button>
    </div>
    ${a.link?`<label class="f" style="margin-top:8px">Enlace de acceso (un solo uso)<input type="text" id="accUrl" readonly value="${esc(a.link)}"></label>
      <div class="actions" style="margin-top:6px"><button type="button" id="accCopy">Copiar enlace</button><button type="button" id="accWa">Enviar por WhatsApp</button>${navigator.share?'<button type="button" id="accShare">Compartir…</button>':''}</div>
      <p class="small" style="margin:6px 0 0">Funciona una sola vez y vence en el tiempo configurado en Supabase (por defecto 1 hora). Al entrar, crea su contraseña y desde ahí entra con su correo y contraseña.</p>`:''}
    ${a.msg?`<p class="lgmsg ${a.kind||''}" style="margin:6px 0 0">${a.msg}</p>`:''}
  </div>`;
}
let accOpen=false;
function accRender(){
  // botón "Dar acceso" junto a Publicar (visible también en el celular, donde la ficha va plegada)
  const acts=document.querySelector('#out .phead .actions');
  if(acts && !$('#bAcc')){ const b=document.createElement('button'); b.type='button'; b.id='bAcc'; b.textContent='Dar acceso'; const pub=$('#bPub'); pub?pub.after(b):acts.append(b); }
  const bA=$('#bAcc'); if(bA){ bA.setAttribute('aria-expanded', String(accOpen)); bA.classList.toggle('dark', accOpen); }
  let card=$('#accCard');
  if(accOpen && !isExample){
    if(!card){ card=document.createElement('section'); card.className='card'; card.id='accCard'; const ph=document.querySelector('#out .phead'); if(ph) ph.after(card); }
    if(card) card.innerHTML=accRowHTML();
  } else if(card) card.remove();
  const hint=$('#accRow'); if(hint) hint.innerHTML = curId && !isExample ? '<p class="small" style="margin:0">Para enviarle el acceso usa <b>Acceso</b>, junto a Publicar.</p>' : '';
}
// redibujar el bloque de acceso cada vez que la ficha se dibuja
if(typeof render==='function'){ const _r=render; render=function(){ const out=_r.apply(this, arguments); accRender(); return out; }; }

function accMsgText(name){
  return `Hola${name?' '+name.split(' ')[0]:''}, este es tu acceso a Ápex para ver tu plan de entrenamiento: ${ACC.link}\n\nÁbrelo, toca "Entrar" y crea tu contraseña. Tu usuario es este correo: ${(st.email||'').trim().toLowerCase()}`;
}
async function accSendMail(){
  const email=(st.email||'').trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ ACC={...ACC,id:curId,msg:'El correo no es válido.',kind:'err'}; return accRender(); }
  if(/sin guardar/i.test($('#saveState').textContent||'')) await save(true);   // que el correo quede guardado antes de enviar
  ACC={...ACC,id:curId,busy:'mail',msg:'',kind:''}; accRender();
  const {error}=await sbInvite.auth.signInWithOtp({email, options:{emailRedirectTo: APP_URL, shouldCreateUser:true}});
  ACC.busy='';
  if(error){
    const m=error.message||'';
    ACC.msg = /seconds|after/i.test(m) ? 'Ya se envió un correo hace poco. Espera un minuto antes de reenviarlo.'
      : /rate|many/i.test(m) ? 'Se alcanzó el límite de correos por hora. Usa el enlace para enviar por WhatsApp.'
      : 'No se pudo enviar el correo. Usa el enlace para enviar por WhatsApp.';
    ACC.kind='err';
  } else { ACC.msg=`Correo enviado a <b>${esc(email)}</b>. Si en 2 minutos no le llega, que revise Spam o Correo no deseado, o envíale el enlace por WhatsApp.`; ACC.kind='ok'; }
  accRender();
}
async function accMakeLink(){
  if(/sin guardar/i.test($('#saveState').textContent||'')) await save(true);
  ACC={id:curId,link:'',busy:'link',msg:'',kind:''}; accRender();
  let res;
  try{ res=await sb.functions.invoke('acceso', {body:{paciente_id:curId}}); }catch(e){ res={error:e}; }
  ACC.busy='';
  const data=res.data, err=res.error;
  if(err || !data || !data.token){
    let txt='No se pudo crear el enlace. Revisa la conexión e inténtalo de nuevo.';
    try{ const b=err && err.context && await err.context.json(); if(b && b.error) txt=b.error; }catch(e){}
    ACC.msg=esc(txt); ACC.kind='err'; return accRender();
  }
  ACC.link=`${APP_URL}#acceso=${encodeURIComponent(data.token)}&t=${encodeURIComponent(data.tipo||'magiclink')}`;
  ACC.msg=''; accRender();
  const inp=$('#accUrl'); if(inp){ inp.focus(); inp.select(); }
}
async function accCopy(){
  try{ await navigator.clipboard.writeText(ACC.link); toast('Enlace copiado'); }
  catch(e){ const inp=$('#accUrl'); if(inp){ inp.focus(); inp.select(); try{ document.execCommand('copy'); toast('Enlace copiado'); }catch(_){ toast('Mantén presionado el enlace para copiarlo'); } } }
}
document.addEventListener('click', e=>{
  const q=s=>e.target.closest(s);
  if(q('#bAcc')){ accOpen=!accOpen; if(!accOpen) ACC={id:null,link:'',busy:'',msg:'',kind:''}; accRender(); if(accOpen) $('#accCard')?.scrollIntoView({block:'nearest', behavior:'smooth'}); return; }
  if(q('#accMail')) return accSendMail();
  if(q('#accLink')) return accMakeLink();
  if(q('#accCopy')) return accCopy();
  if(q('#accWa')) return window.open('https://wa.me/?text='+encodeURIComponent(accMsgText(st.nombre||'')), '_blank', 'noopener');
  if(q('#accShare')) return navigator.share({title:'Acceso a Ápex', text:accMsgText(st.nombre||'')}).catch(()=>{});
});
// si cambian el correo, el enlace anterior ya no aplica
$('#form').addEventListener('input', e=>{ if(e.target.id==='pemail'){ ACC={id:null,link:'',busy:'',msg:'',kind:''}; accRender(); } });

/* ---------- Al abrir un enlace de acceso ---------- */
function accParse(){
  const h=location.hash.replace(/^#/,''); if(!/(^|&)acceso=/.test(h)) return null;
  const p=new URLSearchParams(h); const token=p.get('acceso'); if(!token) return null;
  return {token, tipo:p.get('t')||'magiclink'};
}
function accClearHash(){ try{ history.replaceState(null, '', location.pathname + location.search); }catch(e){ location.hash=''; } }
function accScreen(p, bootFn){
  $('#login').hidden=false; $('#fisioApp').hidden=true; $('#athleteApp').hidden=true;
  $('#loginForm').hidden=true; $('#pwdForm').hidden=true;
  let box=$('#accForm'); if(!box){ box=document.createElement('div'); box.id='accForm'; box.className='lgform'; $('#pwdForm').after(box); }
  box.hidden=false;
  box.innerHTML=`<div class="lghead"><h2>Bienvenido a Ápex</h2><p>Tu fisioterapeuta te envió este acceso para ver tu plan. Toca <b>Entrar</b> y luego crea tu contraseña: después entras siempre con tu correo y esa contraseña.</p></div>
    <button class="primary big" id="accGo" type="button">Entrar</button>
    <button type="button" class="linkbtn" id="accOther">Ya tengo contraseña</button>
    <p class="lgmsg" id="accMsg" role="status" aria-live="polite"></p>`;
  const leave=()=>{ box.hidden=true; accClearHash(); bootFn(); };
  $('#accOther').onclick=leave;
  $('#accGo').onclick=async()=>{
    const btn=$('#accGo'); btn.disabled=true; btn.classList.add('busy'); $('#accMsg').textContent='Entrando…'; $('#accMsg').className='lgmsg';
    try{ await sb.auth.signOut({scope:'local'}); }catch(e){}
    const {error}=await sb.auth.verifyOtp({token_hash:p.token, type:p.tipo});
    btn.disabled=false; btn.classList.remove('busy');
    if(error){
      $('#accMsg').innerHTML='Este enlace ya se usó o venció. Pídele uno nuevo a tu fisioterapeuta, o entra con tu correo y contraseña si ya la creaste.';
      $('#accMsg').className='lgmsg err';
      $('#accGo').hidden=true; $('#accOther').textContent='Ir a entrar con correo';
      return;
    }
    LS.set('apex_setpwd','1');   // que cree su contraseña de una vez
    box.hidden=true; accClearHash(); bootFn();
  };
}
if(typeof boot==='function'){
  const _boot=boot;
  boot=async function(){ const p=accParse(); if(p) return accScreen(p, _boot); return _boot(); };
}
