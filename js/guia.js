/* ===================== GUÍA DE ÁPEX PARA FISIOS (nov 2026) =====================
   Cuenta → Herramientas → "Guía de Ápex". Explica todas las funciones del panel y de la app del usuario.
   REGLA: cada cambio en la app actualiza esta guía en el mismo cambio (ver CLAUDE.md) y la fecha GUIA_FECHA.
   Se carga de último: su envoltorio de renderHome reemplaza la página de Cuenta mientras la guía está abierta. */
const GUIA_FECHA = '9 de noviembre de 2026';
const GUIA = [
  {t: 'Primeros pasos', h: `
    <p>Ápex tiene dos caras: tu <b>panel de fisio</b>, donde creas y ajustas los planes, y la <b>app del usuario</b>, donde cada persona ve su plan, hace su chequeo diario y registra sus sesiones.</p>
    <h4>Entrar</h4>
    <ul><li>Entras con tu correo y contraseña. La primera vez, o si olvidas la contraseña, toca "Entrar con el código de tu correo": te llega un código de 6 números y luego creas tu contraseña.</li>
    <li>La app reconoce sola si el correo es de fisio o de usuario y abre lo que corresponde.</li>
    <li>Se puede instalar en el celular (en iPhone: Compartir → Agregar a inicio) y la sesión queda guardada.</li></ul>
    <h4>Pestañas del panel</h4>
    <p><b>Inicio</b> (lo de hoy y lo que requiere atención), <b>Usuarios</b> (tu lista), <b>En vivo</b> (para cuando la persona está contigo) y <b>Cuenta</b> (herramientas y ajustes). En el celular van abajo; en el computador, a la izquierda.</p>
    <p>El panel sigue el tema de tu celular: claro u oscuro.</p>`},
  {t: 'Inicio', h: `
    <ul><li><b>Cómo llegan hoy:</b> el color del chequeo de cada persona (verde, amarillo o rojo).</li>
    <li><b>Requiere atención:</b> alertas de dolor, chequeos en rojo, solicitudes de cambio, videos de técnica por revisar, mensajes sin leer, adherencia baja (menos de 60 % en 2 semanas, con los motivos que dio la persona) y planes que están por vencer.</li>
    <li><b>Próximo torneo</b> y accesos rápidos a Bienestar en vivo e Intervalos.</li>
    <li>Cuando alguien cumple su semana te aparece el aviso para que le mandes un mensaje corto de refuerzo.</li></ul>
    <div class="gu-tip">La campana te muestra las alertas de dolor en tiempo real. Si activas las notificaciones en Cuenta, también te llegan al celular.</div>`},
  {t: 'Usuarios y la ficha', h: `
    <h4>Lista de usuarios</h4>
    <ul><li>Ordenada por la última vez que abriste cada ficha, en todos tus dispositivos. Tiene buscador y filtros.</li>
    <li>El color de cada tarjeta indica rojo (alerta de dolor sin revisar o chequeo en rojo), amarillo o verde según el chequeo del día, y blanco si no hizo chequeo o no tiene acceso a la app. Se actualiza cada 3 minutos.</li>
    <li>"Nuevo usuario" crea una ficha vacía.</li></ul>
    <h4>Cabecera de la ficha</h4>
    <ul><li>El punto en la foto es el estado del chequeo de hoy. Debajo del nombre van etiquetas cortas con la condición.</li>
    <li>A la vista quedan <b>Publicar</b>, <b>Mensaje</b> y <b>Bienestar</b>. <b>Solicitudes</b> solo aparece si hay pendientes.</li>
    <li>En el menú <b>⋯</b>: Guardar, Enviar acceso a la app, Duración del plan, Restablecer plan base (pide confirmación) y otras acciones. La ficha se guarda sola.</li>
    <li>Etiquetas como "Visto" te dicen si la persona ya vio la última versión de su plan.</li></ul>
    <h4>Secciones (pestañas de la ficha)</h4>
    <p><b>Resumen</b>, <b>Plan</b>, <b>Sesiones</b> y <b>Torneos</b>. Con el lápiz junto al nombre abres <b>Datos</b>, donde están la historia clínica, la evaluación y el consentimiento.</p>`},
  {t: 'Datos, historia y evaluación', h: `
    <ul><li><b>Datos:</b> nombre, correo (su usuario para entrar), módulo, condición, lado, días por semana (1 a 6), fecha de inicio, deporte y nivel. La semana del plan se calcula sola con la fecha de inicio.</li>
    <li><b>Deporte:</b> una sola lista con los deportes más comunes, y puedes añadir otro. Uno nuevo se entrena "parecido a" un perfil existente.</li>
    <li><b>Historia clínica:</b> motivo, mecanismo, fecha de la lesión, diagnóstico, cirugía y antecedentes.</li>
    <li><b>Perfil de evaluación:</b> antecedentes, banderas rojas y amarillas, dolor por zonas y pruebas físicas con su historial (por ejemplo sentarse y pararse en 30 s, TUG, prensión, velocidad de marcha y pruebas de tobillo). Se guarda en la ficha.</li>
    <li><b>Consentimiento informado:</b> su estado, PDF para enviar por WhatsApp o imprimir, mensaje listo para WhatsApp y registro de la aceptación (por WhatsApp o firmada en persona). Si la persona tiene acceso a la app, se lo pide al entrar.</li></ul>`},
  {t: 'Módulos y cómo se arma el plan', h: `
    <h4>Módulos</h4>
    <ul><li><b>Rehabilitación:</b> rodilla (LCA, menisco, tendinopatías, pre y posoperatorio), lumbar (5 condiciones), hombro (dolor relacionado con el manguito rotador) y tobillo (esguince agudo e inestabilidad crónica). Cada uno tiene fases por criterios y su evidencia.</li>
    <li><b>Deporte:</b> fuerza, potencia y preventivos según el perfil del deporte, siguiendo el calendario de torneos (incluye descarga antes de competir).</li>
    <li><b>Deportista en rehabilitación:</b> para cuando la persona no puede dejar de entrenar (procesos de selección o temporada). Sigue los torneos y mete la terapia en Activación y Neuro. Hoy incluye fascitis plantar.</li>
    <li><b>Salud:</b> para personas sin un objetivo deportivo. Usa micro rutinas de Activación, Neuro y Fuerza con el material de Brainbox. Con "Dónde entrena: Domicilio" arma sesiones con lo que haya en la casa, con versiones por nivel.</li></ul>
    <h4>La semana es un borrador</h4>
    <ul><li>La app propone la semana y <b>tú la editas</b>. Manda lo que escribes: tus series se respetan aunque sea semana de descarga.</li>
    <li>Cada día tiene tres bloques: <b>Activación</b>, <b>Neuro</b> y <b>Central</b>. Formatos: series, intermitente, AMRAP, EMOM e intervalos.</li>
    <li>Las sesiones apuntan a 45–75 min. Es solo un estimado: la app avisa si un día queda muy por fuera, pero nunca quita ejercicios.</li>
    <li>La terapia (isometría, TKE y ejercicios marcados como terapia) nunca se recorta: ni por tiempo, ni en descarga, ni en día rojo.</li></ul>`},
  {t: 'Editar el plan, plantillas e historial', h: `
    <ul><li><b>Editar ejercicios:</b> el nombre y la nota crecen hacia abajo y nunca se cortan. Al escribir el nombre salen sugerencias del banco. Puedes insertar micro rutinas en cualquier bloque.</li>
    <li><b>Guardar</b> en un día editado actualiza el plan en la app del usuario sin tener que publicar ni enviarle una notificación.</li>
    <li><b>Publicar</b> cuenta como semana nueva y le avisa a la persona. La primera vez siempre hay que publicar.</li>
    <li><b>Plantillas:</b> guarda la semana actual como plantilla. Luego puedes "Agregar como día" (suma un día sin tocar la semana) o "Reemplazar semana". Si la marcas como compartida, la ven los otros fisios (solo la plantilla, nunca los datos de la persona).</li>
    <li><b>Historial:</b> cada guardado deja una versión (las últimas 10, y los guardados seguidos en menos de 10 min se juntan). Restauras una con un toque.</li>
    <li><b>Duración del plan:</b> eliges cuántas semanas dura. Un día antes de que termine te llega el aviso, y en Inicio aparece en "por actualizar".</li>
    <li><b>Restablecer plan base</b> borra los cambios de la fase, pero la versión actual queda en el historial.</li></ul>`},
  {t: 'Sesiones, racha y torneos', h: `
    <ul><li><b>Sesiones:</b> lo que registró la persona (RPE de la sesión, y si quiso: pesos, RPE por ejercicio, dolor y duración), con gráficas de carga, dolor y bienestar.</li>
    <li><b>Racha:</b> cuenta semanas cumplidas (una semana cuenta si hizo todas sus sesiones). La semana en curso no rompe la cuenta y los días de descanso no castigan. Si entrenó y no lo registró, marca ese día en la tarjeta Racha. Cuenta para la racha, pero no entra en la carga ni en las gráficas.</li>
    <li><b>Torneos:</b> calendario del mes y "Añadir al calendario" para el celular. El módulo Deporte se planifica con estas fechas.</li></ul>`},
  {t: 'Trabajo en casa y PDF', h: `
    <ul><li><b>En casa</b> (usuarios de rehabilitación): se genera según el módulo y la fase. Todo es editable. "Enviar a su app" lo pone en su plan, y también viaja con cada publicación.</li>
    <li><b>PDF del plan</b> y <b>PDF de casa</b> con el estilo de Ápex: portada y una página por día o por bloque.</li></ul>`},
  {t: 'Chequeo diario y ajuste automático', h: `
    <ul><li>Antes de ver el plan de cada día, la persona responde su chequeo: sueño, estrés, fatiga y dolor muscular (de 1 a 5), y si le duele algo (zona, lado y 0–10).</li>
    <li>Sale un semáforo que ven los dos, y el plan del día se ajusta solo:
      <ul><li><b>Verde:</b> plan completo.</li>
      <li><b>Amarillo:</b> RPE un punto menos, sin subir carga, y marca lo que carga la zona que duele.</li>
      <li><b>Rojo:</b> cerca de 1/3 menos series, RPE 2 puntos menos, sin saltos ni potencia, y fuera lo que carga la zona dolorosa si duele 4/10 o más. Te llega una alerta.</li></ul></li>
    <li>La terapia nunca se quita en día rojo.</li></ul>`},
  {t: 'Mensajes, solicitudes y videos', h: `
    <ul><li><b>Mensaje:</b> chat con cada persona, con respuestas rápidas. Le llega como notificación si las tiene activadas.</li>
    <li><b>Solicitudes:</b> la persona pide un cambio ("este ejercicio me duele") y tú lo apruebas o rechazas con una respuesta.</li>
    <li><b>Videos de técnica:</b> la persona sube su video y tú lo revisas desde Inicio.</li></ul>`},
  {t: 'En vivo', h: `
    <ul><li><b>Bienestar en vivo:</b> para quien entrenas en persona (por ejemplo adultos mayores). Le pasas el celular, responde 6 preguntas sin necesidad de cuenta y te dice cuánto exigir hoy. Si marca síntomas cardiovasculares, indica no hacer ejercicio y pedir valoración médica.</li>
    <li><b>Intervalos:</b> cronómetro tipo Tabata y circuitos con silbato, campana, pitidos 3-2-1 y vibración. También lo usa la persona desde su app.</li></ul>`},
  {t: 'Cuenta', h: `
    <ul><li><b>Banco de ejercicios:</b> los básicos y los que más usas. Puedes crear, editar y eliminar (con deshacer y restaurar desde "Eliminados"), con etiquetas para el generador, indicación y video.</li>
    <li><b>Tabla de usuarios:</b> fase, adherencia y dolor de todos en una sola tabla.</li>
    <li><b>Notificaciones:</b> actívalas para recibir alertas de dolor y mensajes.</li>
    <li><b>Conectar con Claude:</b> Claude propone semanas que llegan a la ficha como pendientes. Tú las aceptas o rechazas, y nada se publica solo. En el Plan de cada ficha también está <b>Planificar con Claude</b>: copias las instrucciones y pegas la respuesta.</li>
    <li><b>Fisioterapeutas</b> (solo administrador): agregar o quitar fisios. Cada fisio tiene su propio panel y no ve los usuarios de los demás.</li>
    <li><b>Cambiar a mi cuenta de usuario</b> (solo administrador): pasas a tu propia cuenta de usuario con un toque y vuelves desde "Mi fisio → Volver a mi panel de fisio". La primera vez pide la contraseña de esa cuenta. Lo que registres ahí queda guardado de verdad en tu perfil de usuario. Al cerrar sesión, el celular olvida las dos sesiones.</li></ul>`},
  {t: 'Lo que ve el usuario', h: `
    <ul><li><b>Al entrar la primera vez:</b> consentimiento, luego crea su contraseña y entra.</li>
    <li><b>Inicio:</b> estado del día con su sesión y el botón para entrenar, semana, torneo o fase, récord, racha, su meta personal, mensaje sin leer y la lección del día.</li>
    <li><b>Hoy:</b> franja del color del chequeo que explica qué cambió en el plan, y la sesión con un solo botón.</li>
    <li><b>Modo en vivo:</b> ejercicio por ejercicio, series con un toque, descanso automático, relojes de AMRAP y EMOM, y RPE al final. Puedes desactivarlo por persona.</li>
    <li><b>Mi plan</b>, <b>Progreso</b> (hitos, gráficas, récords y logros), <b>Aprende</b> (sus ejercicios con video y lecciones cortas) y <b>Mi fisio</b> (chat, solicitudes y videos).</li>
    <li><b>Agenda:</b> elige días, hora y lugar, y le llega un recordatorio 30 min antes. Si se salta un día agendado, se le pregunta el motivo con un toque.</li>
    <li><b>Mascota:</b> Pesi (pesa rusa) o Nutria. Celebra la meta del día y gana accesorios con la racha.</li>
    <li><b>Sin internet:</b> su app abre igual y lo que registre se envía al volver la conexión. Tu panel sí necesita internet.</li>
    <li><b>Notificaciones:</b> la persona puede activar o desactivar cada tipo (mensajes, plan nuevo, recordatorio del chequeo, inactividad).</li></ul>`}
];
FX.guia = false;
function guiaPage(){
  return `<div class="fx-page gu-page">
    <button type="button" class="gu-back" data-gu="cerrar">‹ Cuenta</button>
    <header class="fx-hd"><div><span class="fx-eye">Para fisioterapeutas</span><h1>Guía de Ápex</h1></div></header>
    <p class="gu-intro">Todo lo que hace Ápex, organizado por pantalla. Toca un tema para abrirlo.</p>
    ${GUIA.map(s => `<details class="gu-sec"><summary>${s.t}</summary><div class="gu-b">${s.h}</div></details>`).join('')}
    <p class="gu-foot">Actualizada el ${GUIA_FECHA}. Se actualiza con cada cambio de la app.</p>
  </div>`;
}
/* Fila en Cuenta → Herramientas */
const _renderHomeGu = renderHome;
renderHome = function(){
  const r = _renderHomeGu.apply(this, arguments);
  if(typeof FX === 'undefined' || FX.tab !== 'cuenta') return r;
  const el = $('#home');
  if(FX.guia){ el.innerHTML = guiaPage(); return r; }
  const herr = [...el.querySelectorAll('.fx-sec')].find(s => /Herramientas/.test(s.querySelector('h2')?.textContent || ''));
  const list = herr && herr.querySelector('.fx-list');
  if(list && !list.querySelector('[data-gu]')) list.insertAdjacentHTML('afterbegin', `<button type="button" class="fx-rb" data-gu="abrir"><span class="fx-ic sq">${FX_I.req}</span><span class="fx-rt"><b>Guía de Ápex</b><span>Todas las funciones, explicadas</span></span>${FX_I.chev}</button>`);
  return r;
};
document.addEventListener('click', e => {
  const t = e.target.closest('[data-fxtab],[data-fxtab2]'); if(t && FX.guia) FX.guia = false;
  const b = e.target.closest('[data-gu]'); if(!b) return;
  FX.guia = b.dataset.gu === 'abrir'; renderHome(); window.scrollTo(0, 0);
  if(FX.guia) setTimeout(() => $('#home .gu-back')?.focus(), 30);
}, true);
