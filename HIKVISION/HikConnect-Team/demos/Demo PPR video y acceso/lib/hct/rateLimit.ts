// Cola global para no exceder el limite del OpenAPI: 5 solicitudes/segundo.
//
// Implementacion por RESERVA DE SLOT, sin cadena de promesas de modulo:
// la version anterior encadenaba `chain.then(...)` sobre una promesa global,
// y un 'use cache' que espera promesas creadas fuera de su frontera se cuelga
// durante el prerender ("Filling a cache during prerender timed out").
// Aqui la parte sincrona (leer y apartar el siguiente slot) es atomica en JS,
// y el sleep se crea dentro de la llamada: seguro para llenados en prerender.
const MIN_INTERVAL_MS = 210;

let nextSlot = 0;

export function schedule<T>(fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const start = Math.max(now, nextSlot);
  nextSlot = start + MIN_INTERVAL_MS;
  const wait = start - now;
  return (async () => {
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    return fn();
  })();
}
