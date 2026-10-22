// Ápex · conector para Claude (MCP por HTTP, sin costo).
// URL: /functions/v1/claude-mcp/<llave>. La llave es personal de cada fisio (se crea y revoca en Cuenta).
// Claude puede LEER los usuarios del fisio y PROPONER planes. Nunca publica ni cambia un plan:
// cada propuesta queda pendiente en la ficha hasta que el fisio la acepte.
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, authorization, mcp-session-id, mcp-protocol-version", "Access-Control-Allow-Methods": "POST, GET, OPTIONS" };
const J = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const sha = async (t: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))).map((b) => b.toString(16).padStart(2, "0")).join("");

const FORMATO = `Cada día: {"nombre":"Día 1 · Tren inferior","rpe":"7–8","bloques":[{"tipo":"act|neuro|central","formato":"series","ejercicios":[{"nombre":"Sentadilla","series":"4","reps":"6","nota":""}]}]}. ` +
  `"tipo": act = activación (movilidad, prevención, core), neuro = potencia y coordinación (saltos, lanzamientos), central = fuerza. ` +
  `"formato": series, o intervalos con "trabajo", "descanso" y "rondas" en segundos. "rpe" es uno por día. Reps pueden ser texto (8–10, 30 s, 5 por lado).`;

const TOOLS = [
  { name: "listar_usuarios", description: "Lista los usuarios (pacientes) del fisioterapeuta en Ápex con su módulo, fase y fecha del último plan. Úsala para encontrar el id de la persona.",
    inputSchema: { type: "object", properties: { buscar: { type: "string", description: "Parte del nombre (opcional)" } } } },
  { name: "ver_usuario", description: "Muestra el caso de un usuario: módulo, condición, deporte, nivel, días por semana, notas y evaluación; su último plan publicado y sus últimas sesiones con pesos, repeticiones, RPE y dolor. Úsala antes de proponer una progresión.",
    inputSchema: { type: "object", properties: { usuario_id: { type: "string" } }, required: ["usuario_id"] } },
  { name: "proponer_plan", description: "Envía a Ápex una propuesta de semana para un usuario. NO la publica: queda pendiente en la ficha hasta que el fisioterapeuta la revise y la acepte o la rechace. " + FORMATO + " Explica en 'resumen' qué cambiaste y por qué (2 a 4 líneas). No pongas pierna pesada ni saltos en días seguidos.",
    inputSchema: { type: "object", properties: {
      usuario_id: { type: "string" }, resumen: { type: "string" },
      dias: { type: "array", minItems: 1, maxItems: 7, items: { type: "object", properties: { nombre: { type: "string" }, rpe: { type: "string" }, bloques: { type: "array", items: { type: "object" } } }, required: ["bloques"] } },
    }, required: ["usuario_id", "dias", "resumen"] } },
];

const SEG = ["act", "neuro", "central"];
function validarDias(dias: any[]) {
  if (!Array.isArray(dias) || !dias.length) throw new Error("El plan no tiene días.");
  return dias.slice(0, 7).map((d: any, k: number) => {
    const segs = SEG.map((tipo) => {
      const bs = (d.bloques || []).filter((b: any) => String(b.tipo || "").toLowerCase().startsWith(tipo.slice(0, 3)));
      const rows = bs.flatMap((b: any) => (b.ejercicios || []).filter((x: any) => x && x.nombre).map((x: any) => ({ e: String(x.nombre).slice(0, 120), s: String(x.series ?? "").slice(0, 20), r: String(x.reps ?? "").slice(0, 40), c: "", n: String(x.nota || "").slice(0, 300), lado: "", ter: false })));
      const b0 = bs[0] || {}, inter = /interv/i.test(b0.formato || "");
      return { type: tipo, sub: "", fmt: inter ? { t: "inter", a: +b0.trabajo || 40, b: +b0.descanso || 20, c: +b0.rondas || 3 } : { t: "series" }, rows };
    });
    if (!segs.some((s) => s.rows.length)) throw new Error(`El día ${k + 1} no tiene ejercicios.`);
    const day: any = { name: String(d.nombre || `Día ${k + 1}`).slice(0, 60), segs };
    if (d.rpe) day.rpe = String(d.rpe).replace(/^RPE\s*/i, "").slice(0, 10);
    return day;
  });
}
async function suyo(email: string, id: string) {
  const { data } = await db.from("pacientes").select("id,nombre,estado,updated_at").eq("id", id).eq("fisio_email", email).maybeSingle();
  if (!data) throw new Error("No encontré ese usuario entre los tuyos. Usa listar_usuarios para ver los id.");
  return data;
}
async function herramienta(email: string, name: string, a: any) {
  if (name === "listar_usuarios") {
    let q = db.from("pacientes").select("id,nombre,estado,updated_at").eq("fisio_email", email).order("updated_at", { ascending: false }).limit(200);
    if (a?.buscar) q = q.ilike("nombre", `%${String(a.buscar).slice(0, 60)}%`);
    const { data } = await q;
    const ids = (data || []).map((p: any) => p.id);
    const { data: pl } = ids.length ? await db.from("planes").select("paciente_id,publicado_at").in("paciente_id", ids).order("publicado_at", { ascending: false }) : { data: [] };
    const ult: Record<string, string> = {}; (pl || []).forEach((x: any) => { if (!ult[x.paciente_id]) ult[x.paciente_id] = String(x.publicado_at).slice(0, 10); });
    return (data || []).map((p: any) => ({ id: p.id, nombre: p.nombre, modulo: p.estado?.modulo || "rodilla", deporte: p.estado?.deporte || p.estado?.deporteP || null, dias_por_semana: p.estado?.dias || null, ultimo_plan: ult[p.id] || null }));
  }
  if (name === "ver_usuario") {
    const p = await suyo(email, a.usuario_id), e = p.estado || {};
    const [{ data: pl }, { data: se }, { data: pr }] = await Promise.all([
      db.from("planes").select("publicado_at,semana,contenido").eq("paciente_id", p.id).order("publicado_at", { ascending: false }).limit(1),
      db.from("sesiones").select("fecha,dia,min,srpe,dolor,d24,ex,nota").eq("paciente_id", p.id).order("fecha", { ascending: false }).limit(12),
      db.from("plan_propuestas").select("created_at,estado,resumen").eq("paciente_id", p.id).order("created_at", { ascending: false }).limit(3),
    ]);
    const c = (pl || [])[0]?.contenido || null;
    const pf = e.pf || {};
    return {
      id: p.id, nombre: p.nombre,
      caso: { modulo: e.modulo, condicion: e.cond || e.lumCond || e.rehabCond || null, deporte: e.deporte || e.deporteP || null, nivel: e.nivel || null, poblacion: e.poblacion || null, dias_por_semana: e.dias || null, inicio_del_plan: e.inicio || null, notas: e.notas || null,
        evaluacion: { sexo: pf.sexo === "m" ? "mujer" : pf.sexo === "h" ? "hombre" : null, edad: pf.edad || null, motivo: pf.motivo || null, objetivo: pf.objetivo || null, antecedentes: pf.ant || null, banderas_rojas: pf.rf || null, dolor: pf.dolor || null } },
      ultimo_plan_publicado: c ? { fecha: String((pl || [])[0].publicado_at).slice(0, 10), fase: c.fase, semana: c.semana, mesociclo: c.meso?.l || null, dias: (c.dias || []).map((d: any) => ({ nombre: d.name, rpe: d.rpe || null, bloques: (d.segs || []).map((sg: any) => ({ tipo: sg.type, formato: sg.fmt?.t || "series", ejercicios: (sg.rows || []).map((r: any) => ({ nombre: r.e, series: r.s, reps: r.r, carga: r.c || "", nota: r.n || "" })) })) })) } : null,
      ultimas_sesiones: se || [],
      propuestas_recientes: pr || [],
    };
  }
  if (name === "proponer_plan") {
    const p = await suyo(email, a.usuario_id);
    const dias = validarDias(a.dias);
    await db.from("plan_propuestas").update({ estado: "rechazada", revisada_at: new Date().toISOString() }).eq("paciente_id", p.id).eq("estado", "pendiente");
    const { error } = await db.from("plan_propuestas").insert({ paciente_id: p.id, fisio_email: email, dias, resumen: String(a.resumen || "").slice(0, 1500) });
    if (error) throw new Error("No se pudo guardar la propuesta.");
    return { ok: true, mensaje: `Propuesta de ${dias.length} día(s) enviada a la ficha de ${p.nombre}. Queda pendiente: el fisioterapeuta la revisa en Ápex (Plan) y la acepta o la rechaza. No se publicó nada.` };
  }
  throw new Error("Herramienta desconocida.");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return new Response("Ápex · conector para Claude", { status: 405, headers: CORS });
  const llave = new URL(req.url).pathname.split("/").filter(Boolean).pop() || "";
  const { data: k } = await db.from("claude_llaves").select("id,fisio_email,revocada").eq("llave_hash", await sha(llave)).maybeSingle();
  if (!k || k.revocada) return J({ jsonrpc: "2.0", id: null, error: { code: -32001, message: "Enlace no válido o revocado. Crea uno nuevo en Ápex → Cuenta → Conectar con Claude." } }, 401);
  const { data: f } = await db.from("fisios").select("email").eq("email", k.fisio_email).maybeSingle();
  if (!f) return J({ jsonrpc: "2.0", id: null, error: { code: -32001, message: "Este correo ya no es fisioterapeuta en Ápex." } }, 403);
  db.from("claude_llaves").update({ usada_at: new Date().toISOString() }).eq("id", k.id).then(() => {});
  let body: any; try { body = await req.json(); } catch { return J({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "JSON no válido" } }, 400); }
  const una = async (m: any) => {
    if (!m || m.id === undefined || m.id === null) return null;   // notificaciones: sin respuesta
    try {
      if (m.method === "initialize") return { jsonrpc: "2.0", id: m.id, result: { protocolVersion: m.params?.protocolVersion || "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "Ápex", version: "1.0.0" },
        instructions: "Conector de Ápex para fisioterapeutas. Primero busca a la persona con listar_usuarios, mira su caso y sesiones con ver_usuario, y envía la semana con proponer_plan. Las propuestas nunca se publican solas: el fisioterapeuta las revisa en la app." } };
      if (m.method === "ping") return { jsonrpc: "2.0", id: m.id, result: {} };
      if (m.method === "tools/list") return { jsonrpc: "2.0", id: m.id, result: { tools: TOOLS } };
      if (m.method === "tools/call") {
        try { const r = await herramienta(k.fisio_email, m.params?.name, m.params?.arguments || {}); return { jsonrpc: "2.0", id: m.id, result: { content: [{ type: "text", text: JSON.stringify(r, null, 1) }] } }; }
        catch (e: any) { return { jsonrpc: "2.0", id: m.id, result: { content: [{ type: "text", text: e?.message || "Error" }], isError: true } }; }
      }
      return { jsonrpc: "2.0", id: m.id, error: { code: -32601, message: "Método no soportado" } };
    } catch (e: any) { return { jsonrpc: "2.0", id: m.id, error: { code: -32603, message: e?.message || "Error interno" } }; }
  };
  if (Array.isArray(body)) { const out = (await Promise.all(body.map(una))).filter(Boolean); return out.length ? J(out) : new Response(null, { status: 202, headers: CORS }); }
  const r = await una(body);
  return r ? J(r) : new Response(null, { status: 202, headers: CORS });
});
