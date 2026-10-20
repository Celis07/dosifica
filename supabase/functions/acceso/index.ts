// Ápex · enlace de acceso para compartir por WhatsApp o copiado.
// Solo el fisioterapeuta del paciente puede pedirlo. Devuelve un token de un solo uso (hashed_token);
// la app arma el enlace https://celis07.github.io/dosifica/#acceso=<token> y la sesión se abre
// solo cuando el deportista toca "Entrar" (así la vista previa de WhatsApp no gasta el enlace).
import { createClient } from "npm:@supabase/supabase-js@2";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(URL_, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const out = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return out({ error: "método" }, 405);
  try {
    const auth = req.headers.get("Authorization") || "";
    const user = createClient(URL_, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
    // 1) quien llama es fisioterapeuta
    const { data: f } = await user.from("fisios").select("email").maybeSingle();
    if (!f) return out({ error: "Solo un fisioterapeuta puede generar enlaces." }, 403);
    // 2) el paciente es suyo (las políticas RLS lo garantizan)
    const { paciente_id } = await req.json().catch(() => ({}));
    if (!paciente_id) return out({ error: "Falta el paciente." }, 400);
    const { data: p } = await user.from("pacientes").select("id,nombre,email").eq("id", paciente_id).maybeSingle();
    if (!p) return out({ error: "Paciente no encontrado." }, 404);
    const email = (p.email || "").trim().toLowerCase();
    if (!email) return out({ error: "El paciente no tiene correo." }, 400);
    // 3) nunca un enlace para entrar como fisioterapeuta
    const { data: esFisio } = await admin.from("fisios").select("email").eq("email", email).maybeSingle();
    if (esFisio) return out({ error: "Ese correo es de un fisioterapeuta." }, 403);
    // 4) token de un solo uso (crea la cuenta si aún no existe)
    let r = await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (r.error) {
      const c = await admin.auth.admin.createUser({ email, email_confirm: true });
      if (c.error && !/already|registered|exists/i.test(c.error.message)) return out({ error: "No se pudo crear la cuenta." }, 500);
      r = await admin.auth.admin.generateLink({ type: "magiclink", email });
    }
    if (r.error || !r.data?.properties?.hashed_token) return out({ error: "No se pudo generar el enlace." }, 500);
    return out({ token: r.data.properties.hashed_token, tipo: r.data.properties.verification_type || "magiclink", nombre: p.nombre, email });
  } catch (e) {
    console.error("acceso", String(e));
    return out({ error: "Error inesperado." }, 500);
  }
});
