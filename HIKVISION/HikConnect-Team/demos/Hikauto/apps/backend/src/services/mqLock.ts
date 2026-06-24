/**
 * Serializa subscribe/poll/complete MQ — Hik-Connect no tolera bien llamadas concurrentes
 * (telemetría + last-locations + probe a la vez).
 */
let chain: Promise<unknown> = Promise.resolve();

export function withMqLock<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const run = chain.then(() => fn());
  chain = run.catch(() => undefined);
  return run;
}
