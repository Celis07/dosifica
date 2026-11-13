// Ápex · enlace de registro SIN correo (nov 2026).
// El fisio crea un enlace para una ficha que aún no tiene correo; la persona lo abre, escribe su correo
// y queda unida a su ficha. Después sigue el flujo normal: consentimiento → crear contraseña → su plan.
// Acciones (POST JSON):
//   {accion:'crear', paciente_id}  → solo el fisio de esa ficha. Devuelve {token, expira}.
//   {accion:'info', token}         → público. Devuelve {nombre} (solo el primer nombre) si el enlace sirve.
//   {accion:'usar', token, email}  → público. Une el correo a la ficha, gasta el enlace y devuelve un
//                                    token de sesión de un solo uso (igual que la función "acceso").
// La tabla invitaciones guarda solo el hash del token y no tiene políticas RLS: solo esta función la usa.
import { createClient } from "npm:@supabase/supabase-js@2";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(URL_, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const out = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const DIAS = 7;
const NO_SIRVE = "Este enlace ya se usó o venció. Pídele uno nuevo a tu fisioterapeuta.";
const SIN_SESION = "Tu correo quedó guardado, pero no se pudo abrir la sesión. Entra con “Entrar con el código de tu correo” usando ese correo.";

async function sha(t: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
}
function nuevoToken() {
  const b = new Uint8Array(24); crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function vigente(token: string) {
  if (!token || typeof token !== "string" || token.length < 20) return null;
  const { data } = await admin.from("invitaciones").select("id,paciente_id,expira_at,usado_at").eq("token_hash", await sha(token)).maybeSingle();
  if (!data || data.usado_at || new Date(data.expira_at) < new Date()) return null;
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return out({ error: "método" }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const accion = body.accion;

    if (accion === "crear") {
      const auth = req.headers.get("Authorization") || "";
      const user = createClient(URL_, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
      const { data: f } = await user.from("fisios").select("email").maybeSingle();
      if (!f) return out({ error: "Solo un fisioterapeuta puede crear enlaces." }, 403);
      if (!body.paciente_id) return out({ error: "Falta la ficha." }, 400);
      const { data: p } = await user.from("pacientes").select("id,email").eq("id", body.paciente_id).maybeSingle();   // RLS: solo sus usuarios
      if (!p) return out({ error: "Ficha no encontrada." }, 404);
      if ((p.email || "").trim()) return out({ error: "Esta persona ya tiene correo: usa el enlace de acceso." }, 400);
      const token = nuevoToken(), expira = new Date(Date.now() + DIAS * 864e5).toISOString();
      // un enlace vivo por ficha: el anterior deja de servir
      await admin.from("invitaciones").update({ expira_at: new Date().toISOString() }).eq("paciente_id", p.id).is("usado_at", null);
      const { error } = await admin.from("invitaciones").insert({ paciente_id: p.id, token_hash: await sha(token), creado_por: f.email, expira_at: expira });
      if (error) return out({ error: "No se pudo crear el enlace." }, 500);
      return out({ token, expira });
    }

    if (accion === "info") {
      const inv = await vigente(body.token);
      if (!inv) return out({ error: NO_SIRVE }, 410);
      const { data: p } = await admin.from("pacientes").select("nombre,email").eq("id", inv.paciente_id).maybeSingle();
      if (!p || (p.email || "").trim()) return out({ error: NO_SIRVE }, 410);
      return out({ nombre: (p.nombre || "").trim().split(/\s+/)[0] || "" });
    }

    if (accion === "usar") {
      const email = String(body.email || "").trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return out({ error: "Ese correo no es válido." }, 400);
      const inv = await vigente(body.token);
      if (!inv) return out({ error: NO_SIRVE }, 410);
      const { data: esFisio } = await admin.from("fisios").select("email").eq("email", email).maybeSingle();
      if (esFisio) return out({ error: "Ese correo ya está en uso en Ápex. Escribe otro o pídele ayuda a tu fisioterapeuta." }, 409);
      const { data: otro } = await admin.from("pacientes").select("id").eq("email", email).neq("id", inv.paciente_id).limit(1);
      if (otro?.length) return out({ error: "Ese correo ya está en uso en Ápex. Escribe otro o pídele ayuda a tu fisioterapeuta." }, 409);
      // gastar el enlace primero (si dos personas lo usan a la vez, solo una gana)
      const { data: gan } = await admin.from("invitaciones").update({ usado_at: new Date().toISOString(), email_usado: email })
        .eq("id", inv.id).is("usado_at", null).select("id");
      if (!gan?.length) return out({ error: NO_SIRVE }, 410);
      const { data: up, error: eUp } = await admin.from("pacientes").update({ email, updated_at: new Date().toISOString() })
        .eq("id", inv.paciente_id).or("email.is.null,email.eq.").select("id");
      if (eUp || !up?.length) {
        await admin.from("invitaciones").update({ usado_at: null, email_usado: null }).eq("id", inv.id);   // se devuelve el enlace
        return out({ error: eUp ? "No se pudo guardar el correo. Inténtalo de nuevo." : NO_SIRVE }, eUp ? 500 : 410);
      }
      let r = await admin.auth.admin.generateLink({ type: "magiclink", email });
      if (r.error) {
        const c = await admin.auth.admin.createUser({ email, email_confirm: true });
        if (c.error && !/already|registered|exists/i.test(c.error.message)) return out({ error: SIN_SESION }, 500);
        r = await admin.auth.admin.generateLink({ type: "magiclink", email });
      }
      if (r.error || !r.data?.properties?.hashed_token) return out({ error: SIN_SESION }, 500);
      return out({ token: r.data.properties.hashed_token, tipo: r.data.properties.verification_type || "magiclink" });
    }

    return out({ error: "Acción no válida." }, 400);
  } catch (e) {
    console.error("invitacion", String(e));
    return out({ error: "Error inesperado." }, 500);
  }
});
