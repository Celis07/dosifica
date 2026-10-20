/* ===================== BOTÓN ATRÁS (Android) =====================
   El botón atrás navega dentro de Ápex y nunca saca a nadie de la app ni de su cuenta:
   cierra lo que esté abierto (modo en vivo, ventanas, formularios), vuelve a Inicio y,
   estando en Inicio, se queda ahí. Para salir de la cuenta solo sirve el botón Salir.
   Chrome ignora las entradas de historial creadas sin un toque del usuario, así que la
   "barrera" se vuelve a poner en el siguiente toque después de cada atrás. */
(function(){
  if(!('pushState' in history)) return;
  let armed = false, warned = false;
  const arm = () => { if(armed) return; try{ history.pushState({apex: Date.now()}, '', location.href); armed = true; }catch(e){} };
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, arm, {capture: true, passive: true}));

  const visible = sel => { const el = document.querySelector(sel); return !!(el && !el.hidden && el.offsetParent !== null); };
  function back(){
    // 0) Cronómetro de intervalos: corriendo se pausa; en otra pantalla se cierra
    if(typeof TB !== 'undefined' && TB && visible('#tabata')){ if(TB.screen === 'run'){ if(!TB.paused) document.querySelector('#tabata [data-tb="pause"]')?.click(); } else tbClose(); return true; }
    // 1) Modo en vivo: lo cierra guardando el avance, igual que la X
    if(typeof L !== 'undefined' && L && visible('#live')){ const x = document.querySelector('#live [data-close]'); if(x){ x.click(); return true; } closeLive(true); return true; }
    // 2) Ventanas abiertas
    for(const id of ['#chatDlg', '#msgDlg']){ const d = document.querySelector(id); if(d && !d.hidden){ d.hidden = true; return true; } }
    // 3) Portal del deportista
    if(typeof me !== 'undefined' && me.role === 'deportista' && typeof A !== 'undefined'){
      if(A.wOpen || A.metaOpen || A.open != null || A.reqOpen || A.tecOpen != null){ A.wOpen = false; A.metaOpen = false; A.open = null; A.reqOpen = false; A.tecOpen = null; renderAthlete(); return true; }
      if(A.tab && A.tab !== 'inicio'){ A.tab = 'inicio'; renderAthlete(); window.scrollTo(0, 0); return true; }
      return false;
    }
    // 4) Panel del fisio: de la ficha de un paciente vuelve a Inicio
    if(typeof me !== 'undefined' && me.role === 'fisio'){
      if(typeof editMode !== 'undefined' && editMode){ editMode = false; render(); return true; }
      if(typeof homeVisible === 'function' && !homeVisible()){ showHome(); return true; }
      return false;
    }
    return false;
  }
  window.addEventListener('popstate', () => {
    armed = false;
    const moved = back();
    // vuelve a poner la barrera ya (y otra vez en el próximo toque, por si Chrome la ignora)
    try{ history.pushState({apex: Date.now()}, '', location.href); armed = true; }catch(e){}
    if(!moved && !warned && typeof toast === 'function' && typeof me !== 'undefined' && me.role){ warned = true; toast('Ya estás en Inicio. Para cerrar tu cuenta usa Salir.'); }
    setTimeout(() => { armed = false; }, 0);   // fuerza a re-armar con el próximo toque
  });
})();
