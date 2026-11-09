// Conector con Claude retirado (9 nov 2026): Ápex ya no expone datos a conectores externos.
Deno.serve(() => new Response(JSON.stringify({error: 'Conector retirado'}), {status: 410, headers: {'Content-Type': 'application/json'}}));
