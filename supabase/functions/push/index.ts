// Ápex · envío de notificaciones push.
// La llaman la base de datos (disparadores y tareas programadas) con la cabecera x-apex-token.
// tipos: alerta (dolor alto → fisio), plan (plan publicado → deportista), bienestar (cada chequeo del deportista → fisio, en verde, amarillo o rojo),
//        manana (¿cómo amaneció? + chequeo del día), tarde (3 días sin registrar), racha (7 p. m., racha de chequeos en peligro), agenda (30 min antes de la hora elegida), semanal (lunes, resumen al fisio), mensaje (chat en ambos sentidos), tecnica (video nuevo → fisio, comentario → deportista), prueba (a un correo).
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const APP = "https://celis07.github.io/dosifica/";
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
let cfg: { pub: string; priv: string; token: string } | null = null;

async function config() {
  if (cfg) return cfg;
  const { data, error } = await db.rpc("push_config");
  if (error) throw error;
  cfg = data;
  webpush.setVapidDetails("mailto:celisone1@gmail.com", cfg!.pub, cfg!.priv);
  return cfg!;
}
const hoyCO = (d = 0) => new Date(Date.now() - 5 * 3600e3 + d * 864e5).toISOString().slice(0, 10);

async function enviar(email: string, msg: { title: string; body: string; url?: string; tag?: string }) {
  const { data: subs } = await db.from("push_subs").select("*").eq("email", email.toLowerCase());
  let ok = 0;
  for (const s of subs || []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ ...msg, url: msg.url || APP }), { TTL: 86400, urgency: "high" });
      ok++; await db.from("push_subs").update({ last_ok: new Date().toISOString() }).eq("endpoint", s.endpoint);
    } catch (e: any) {
      if (e?.statusCode === 404 || e?.statusCode === 410) await db.from("push_subs").delete().eq("endpoint", s.endpoint);
      else console.error("push", e?.statusCode, e?.body || String(e));
    }
  }
  return ok;
}
async function tieneSubs(email?: string | null) {
  if (!email) return false;
  const { count } = await db.from("push_subs").select("endpoint", { count: "exact", head: true }).eq("email", email.toLowerCase());
  return (count || 0) > 0;
}
// El deportista puede apagar cada tipo de aviso desde Mi fisio (pacientes.avisos, {tipo:false} = apagado).
const quiere = (p: any, tipo: string) => p?.avisos?.[tipo] !== false;
async function unaVez(clave: string) {
  const { error } = await db.from("push_log").insert({ clave });
  return !error; // false si ya se envió
}

Deno.serve(async (req) => {
  try {
    const c = await config();
    if (req.headers.get("x-apex-token") !== c.token) return new Response("no", { status: 401 });
    const b = await req.json().catch(() => ({}));
    let n = 0;

    if (b.tipo === "alerta") {
      const { data: s } = await db.from("sesiones").select("id,paciente_id,dolor,d24,dia,fecha").eq("id", b.id).maybeSingle();
      if (s) {
        const { data: p } = await db.from("pacientes").select("nombre,fisio_email").eq("id", s.paciente_id).maybeSingle();
        const por = [s.dolor != null && s.dolor > 5 ? `dolor ${s.dolor}/10` : "", s.d24 === "peor" ? "amaneció peor" : ""].filter(Boolean).join(" · ");
        if (p?.fisio_email) n = await enviar(p.fisio_email, { title: "Alerta de dolor", body: `${p.nombre || "Paciente"}: ${por}${s.dia ? " · " + s.dia : ""}`, tag: "alerta-" + s.id, url: APP + "?alertas=1" });
      }
    }
    if (b.tipo === "plan") {
      const { data: pl } = await db.from("planes").select("paciente_id,semana").eq("id", b.id).maybeSingle();
      const { data: p } = pl ? await db.from("pacientes").select("email,avisos").eq("id", pl.paciente_id).maybeSingle() : { data: null };
      if (p?.email && quiere(p, "plan")) n = await enviar(p.email, { title: "Tu plan está listo", body: `Tu fisioterapeuta publicó tu plan de la semana ${pl!.semana ?? ""}.`, tag: "plan" });
    }
    if (b.tipo === "bienestar") { // cada chequeo diario del deportista → fisio (en rojo con prioridad)
      const { data: w } = await db.from("bienestar").select("paciente_id,sueno,estres,fatiga,dolor,molestias").eq("id", b.id).maybeSingle();
      if (w) {
        const { data: p } = await db.from("pacientes").select("nombre,fisio_email").eq("id", w.paciente_id).maybeSingle();
        const Z: Record<string, string> = { cuello: "cuello", hombro: "hombro", codo: "codo o muñeca", dorsal: "espalda alta", lumbar: "zona lumbar", cadera: "cadera", muslo: "muslo", rodilla: "rodilla", pierna: "pierna", tobillo: "tobillo", otra: "otra zona" };
        const mol = ((w.molestias || []) as any[]);
        const it = [w.sueno, w.estres, w.fatiga, w.dolor].map((x) => +x || 0), max = Math.max(...it, ...mol.map((m) => +m.i >= 6 ? 6 : +m.i >= 4 ? 5 : 0)), sum = it.reduce((a, c) => a + c, 0);
        const rojo = max >= 6 || sum >= 18, amarillo = !rojo && (max >= 5 || sum >= 14);
        const why = [w.sueno >= 5 ? "durmió mal" : "", w.estres >= 5 ? "estrés alto" : "", w.fatiga >= 5 ? "fatiga alta" : "", w.dolor >= 5 ? "dolor muscular alto" : "",
          ...mol.filter((m) => +m.i >= 4).map((m) => `dolor en ${Z[m.z] || m.z} ${m.i}/10`)].filter(Boolean).join(" · ");
        const nom = p?.nombre || "Paciente";
        const msg = rojo ? { title: "Chequeo en rojo", body: `${nom}: ${why || "bienestar muy bajo"}. Su plan de hoy ya salió recortado.` }
          : amarillo ? { title: "Chequeo en amarillo", body: `${nom}: ${why || "bienestar bajo"}. Hoy sin subir carga.` }
          : { title: "Chequeo en verde", body: `${nom} respondió su chequeo: listo para entrenar.` };
        if (p?.fisio_email) n = await enviar(p.fisio_email, { ...msg, tag: "chk-" + w.paciente_id, url: APP });
      }
    }
    const avisados = new Set<string>();
    if (b.tipo === "manana") { // sesiones de ayer sin respuesta de 24 h
      const { data: ss } = await db.from("sesiones").select("id,paciente_id").eq("fecha", hoyCO(-1)).eq("autor", "deportista").or("d24.is.null,d24.eq.");
      for (const s of ss || []) {
        const { data: pl } = await db.from("planes").select("modulo:contenido->>modulo,zona:contenido->rehab->>zona").eq("paciente_id", s.paciente_id).order("publicado_at", { ascending: false }).limit(1);
        const mod = (pl?.[0] as any)?.modulo || "rodilla", zona = (pl?.[0] as any)?.zona || "";
        if (mod !== "rodilla" && mod !== "lumbar" && !zona) continue;
        const parte = mod === "lumbar" ? "tu espalda" : mod === "rodilla" ? "tu rodilla" : `tu ${zona}`;
        const { data: p } = await db.from("pacientes").select("email,avisos").eq("id", s.paciente_id).maybeSingle();
        if (!quiere(p, "d24") || !(await tieneSubs(p?.email)) || !(await unaVez("d24-" + s.id))) continue;
        if (p?.email) { n += await enviar(p.email, { title: `¿Cómo amaneció ${parte}?`, body: (zona === "pie" ? "¿Cómo fueron los primeros pasos? " : "") + "Cuéntaselo a tu fisioterapeuta y haz tu chequeo de hoy: 30 segundos.", tag: "d24" }); avisados.add(s.paciente_id); }
      }
      // chequeo diario: a quien tiene plan, notificaciones activas y no lo ha hecho hoy
      const { data: planes } = await db.from("planes").select("paciente_id").gte("publicado_at", new Date(Date.now() - 60 * 864e5).toISOString());
      for (const pid of [...new Set((planes || []).map((x: any) => x.paciente_id))] as string[]) {
        if (avisados.has(pid)) continue;
        const { count } = await db.from("bienestar").select("id", { count: "exact", head: true }).eq("paciente_id", pid).eq("fecha", hoyCO());
        if ((count || 0) > 0) continue;
        const { data: p } = await db.from("pacientes").select("email,avisos").eq("id", pid).maybeSingle();
        if (!quiere(p, "chequeo") || !(await tieneSubs(p?.email)) || !(await unaVez(`chk-${pid}-${hoyCO()}`))) continue;
        n += await enviar(p!.email, { title: "Chequeo de hoy", body: "¿Cómo dormiste y cómo amaneces? 30 segundos y tu plan de hoy se ajusta solo.", tag: "chk" });
      }
    }
    if (b.tipo === "tarde") { // 3+ días sin registrar, una vez por pausa
      const { data: planes } = await db.from("planes").select("paciente_id,publicado_at").order("publicado_at", { ascending: false });
      const vistos = new Set<string>();
      for (const pl of planes || []) {
        if (vistos.has(pl.paciente_id)) continue; vistos.add(pl.paciente_id);
        const { data: u } = await db.from("sesiones").select("fecha").eq("paciente_id", pl.paciente_id).order("fecha", { ascending: false }).limit(1);
        const ult = u?.[0]?.fecha || String(pl.publicado_at).slice(0, 10);
        if (ult > hoyCO(-3)) continue;
        if (ult < hoyCO(-21)) continue; // pacientes que ya no entrenan: no insistir
        const { data: p } = await db.from("pacientes").select("email,avisos").eq("id", pl.paciente_id).maybeSingle();
        if (!quiere(p, "inactivo") || !(await tieneSubs(p?.email)) || !(await unaVez(`inact-${pl.paciente_id}-${ult}`))) continue;
        if (p?.email) n += await enviar(p.email, { title: "Tu plan te espera", body: "Llevas unos días sin registrar sesión. Abre Ápex y entrena en modo en vivo.", tag: "inact" });
      }
    }
    if (b.tipo === "racha") { // 7 p. m.: solo si la racha se pierde mañana. Los descansos no rompen la racha: un día sin registro
      // no cuenta como hueco si la semana ya cumplió sus sesiones; si no, se permiten techo((7 − días)/días) días seguidos sin registro.
      const { data: planes } = await db.from("planes").select("paciente_id,mascota:contenido->>mascota,dias:contenido->dias,publicado_at").gte("publicado_at", new Date(Date.now() - 60 * 864e5).toISOString()).order("publicado_at", { ascending: false });
      const vistos = new Set<string>();
      const add = (iso: string, k: number) => { const x = new Date(iso + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + k); return x.toISOString().slice(0, 10); };
      const lun = (iso: string) => { const x = new Date(iso + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); return x.toISOString().slice(0, 10); };
      for (const pl of (planes || []) as any[]) {
        if (vistos.has(pl.paciente_id)) continue; vistos.add(pl.paciente_id);
        const desde = hoyCO(-120);
        const { data: ws } = await db.from("bienestar").select("fecha").eq("paciente_id", pl.paciente_id).gte("fecha", desde);
        const { data: ss } = await db.from("sesiones").select("fecha").eq("paciente_id", pl.paciente_id).gte("fecha", desde);
        const ses = (ss || []).map((x: any) => x.fecha as string), act = new Set([...(ws || []).map((w: any) => w.fecha as string), ...ses]);
        const hoy = hoyCO(); if (act.has(hoy)) continue;
        const nd = Math.max(1, Math.min(7, Array.isArray(pl.dias) ? pl.dias.length : 3)), gapMax = Math.ceil((7 - nd) / nd);
        const porSem: Record<string, Set<string>> = {}; ses.forEach((f) => { (porSem[lun(f)] ||= new Set()).add(f); });
        const hecha = (d: string) => (porSem[lun(d)]?.size || 0) >= nd;
        if (hecha(hoy)) continue;
        const primero = [...act].sort()[0]; if (!primero) continue;
        let d = add(hoy, -1), racha = 0, gap = 0, gapAct: number | null = null;
        while (d >= primero) {
          if (act.has(d)) { if (gapAct === null) gapAct = gap; racha++; gap = 0; }
          else if (!hecha(d)) { gap++; if (gap > gapMax) break; }
          d = add(d, -1);
        }
        if (gapAct === null) gapAct = gap;
        if (racha < 2 || gapAct + 1 <= gapMax) continue; // aún puede descansar hoy sin perderla
        const { data: p } = await db.from("pacientes").select("email,avisos").eq("id", pl.paciente_id).maybeSingle();
        if (!quiere(p, "chequeo") || !(await tieneSubs(p?.email)) || !(await unaVez(`racha-${pl.paciente_id}-${hoy}`))) continue;
        const quien = pl.mascota === "pesi" ? "Pesi" : pl.mascota === "nutria" ? "Nutria" : "Tu compañero";
        n += await enviar(p!.email, { title: `${quien} te está esperando`, body: `Llevas ${racha} días de racha. Haz tu chequeo hoy para no perderla: son 30 segundos.`, tag: "racha" });
      }
    }
    if (b.tipo === "agenda") { // cada hora a los :30 → recordatorio 30 min antes de la hora que eligió la persona
      const ahora = new Date(Date.now() - 5 * 3600e3), hora = (ahora.getUTCHours() + 1) % 24, dia = (ahora.getUTCDay() + 6) % 7, hoy = hoyCO();
      const { data: ps } = await db.from("pacientes").select("id,email,avisos,agenda").not("agenda", "is", null);
      for (const p of (ps || []) as any[]) {
        const a = p.agenda || {};
        if (+a.hora !== hora || !(a.dias || []).includes(dia) || !quiere(p, "agenda")) continue;
        const { count } = await db.from("sesiones").select("id", { count: "exact", head: true }).eq("paciente_id", p.id).eq("fecha", hoy);
        if ((count || 0) > 0 || !(await tieneSubs(p.email)) || !(await unaVez(`agenda-${p.id}-${hoy}`))) continue;
        const h = hora % 12 || 12, hh = `${h}:00 ${hora < 12 ? "a. m." : "p. m."}`;
        n += await enviar(p.email, { title: "Tu sesión de hoy", body: `A las ${hh}${a.lugar ? " en " + a.lugar : ""}. Abre Ápex y entrena en modo en vivo.`, tag: "agenda" });
      }
    }
    if (b.tipo === "semanal") { // lunes en la mañana → resumen de la semana anterior para cada fisio
      const lunes = hoyCO(-7), domingo = hoyCO(-1);
      const { data: fs } = await db.from("fisios").select("email");
      for (const f of (fs || []) as any[]) {
        if (!f.email || !(await tieneSubs(f.email)) || !(await unaVez(`semanal-${f.email}-${hoyCO()}`))) continue;
        const { data: ps } = await db.from("pacientes").select("id,nombre").eq("fisio_email", f.email);
        const filas: { nom: string; h: number; e: number }[] = [];
        for (const p of (ps || []) as any[]) {
          const { data: pl } = await db.from("planes").select("dias:contenido->dias,publicado_at").eq("paciente_id", p.id).order("publicado_at", { ascending: false }).limit(1);
          const ult = (pl || [])[0] as any; if (!ult || String(ult.publicado_at).slice(0, 10) > domingo) continue;
          if (String(ult.publicado_at).slice(0, 10) < hoyCO(-60)) continue;
          const e = Math.max(1, Array.isArray(ult.dias) ? ult.dias.length : 3);
          const { data: ss } = await db.from("sesiones").select("fecha").eq("paciente_id", p.id).gte("fecha", lunes).lte("fecha", domingo);
          filas.push({ nom: (p.nombre || "Sin nombre").split(" ")[0], h: new Set((ss || []).map((x: any) => x.fecha)).size, e });
        }
        if (!filas.length) continue;
        const ok = filas.filter((x) => x.h >= x.e).length, bajos = filas.filter((x) => x.h / x.e < 0.6).sort((a, b) => a.h / a.e - b.h / b.e);
        const body = `${ok} de ${filas.length} cumplieron su semana.` + (bajos.length ? ` Por debajo: ${bajos.slice(0, 4).map((x) => `${x.nom} ${x.h}/${x.e}`).join(", ")}${bajos.length > 4 ? "…" : ""}.` : " Nadie por debajo del 60 %.");
        n += await enviar(f.email, { title: "Tu semana en Ápex", body, tag: "semanal" });
      }
    }
    if (b.tipo === "mensaje") { // chat: fisio → deportista o deportista → fisio
      const { data: m } = await db.from("mensajes").select("paciente_id,texto,autor").eq("id", b.id).maybeSingle();
      const { data: p } = m ? await db.from("pacientes").select("nombre,email,fisio_email,avisos").eq("id", m.paciente_id).maybeSingle() : { data: null };
      const t = (m?.texto || "").trim(), corto = t.length > 140 ? t.slice(0, 137) + "…" : t;
      if (m?.autor === "deportista") { if (p?.fisio_email && t) n = await enviar(p.fisio_email, { title: `Mensaje de ${p.nombre || "tu paciente"}`, body: corto, tag: "chat-" + m.paciente_id, url: APP + "?chat=" + m.paciente_id }); }
      else if (p?.email && t && quiere(p, "mensaje")) n = await enviar(p.email, { title: "Mensaje de tu fisioterapeuta", body: corto, tag: "msg-" + b.id });
    }
    if (b.tipo === "tecnica" || b.tipo === "tecnica_c") { // video de técnica: nuevo → fisio; comentado → deportista
      const { data: v } = await db.from("tecnica").select("paciente_id,ejercicio,comentario").eq("id", b.id).maybeSingle();
      const { data: p } = v ? await db.from("pacientes").select("nombre,email,fisio_email,avisos").eq("id", v.paciente_id).maybeSingle() : { data: null };
      if (v && b.tipo === "tecnica" && p?.fisio_email) n = await enviar(p.fisio_email, { title: "Video de técnica", body: `${p.nombre || "Paciente"} subió su ${v.ejercicio}. Revísalo y coméntale.`, tag: "tec-" + b.id, url: APP + "?tecnica=" + v.paciente_id });
      if (v && b.tipo === "tecnica_c" && p?.email && quiere(p, "mensaje")) n = await enviar(p.email, { title: "Tu fisioterapeuta revisó tu técnica", body: `${v.ejercicio}: ${(v.comentario || "").slice(0, 120)}`, tag: "tecc-" + b.id });
    }
    if (b.tipo === "prueba" && b.email) n = await enviar(b.email, { title: "Ápex", body: "Las notificaciones quedaron activas en este dispositivo.", tag: "prueba" });

    return new Response(JSON.stringify({ ok: true, enviadas: n }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
