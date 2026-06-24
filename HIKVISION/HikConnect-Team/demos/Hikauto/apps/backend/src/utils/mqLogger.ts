/** Logs de diagnóstico MQ en consola del backend (npm run dev). Desactivar: MQ_DEBUG=0 */
const ENABLED = process.env.MQ_DEBUG !== "0";
const TAG = "[hik-mq]";

export function mqLog(phase: string, detail: Record<string, unknown> = {}): void {
  if (!ENABLED) return;
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`${TAG} ${ts} ${phase}`, JSON.stringify(detail));
}

export function mqWarn(phase: string, detail: Record<string, unknown> = {}): void {
  if (!ENABLED) return;
  const ts = new Date().toISOString().slice(11, 23);
  console.warn(`${TAG} ${ts} ${phase}`, JSON.stringify(detail));
}

export function mqError(phase: string, err: unknown, detail: Record<string, unknown> = {}): void {
  const ts = new Date().toISOString().slice(11, 23);
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`${TAG} ${ts} ${phase}`, msg, JSON.stringify(detail));
}
