/**
 * Comunicación con el reproductor EZUIKit aislado en public/ezuikit-player.html (iframe).
 * El SDK no se carga en la app React para evitar máscaras fixed que oscurecen toda la UI.
 */
export interface StreamTokenBundle {
  appKey?: string;
  appToken?: string;
  streamAreaDomain?: string;
}

export type EzuikitIframeMessage =
  | { type: "ezuikit-ready" }
  | { type: "ezuikit-playing" }
  | { type: "ezuikit-stopped" }
  | { type: "ezuikit-error"; message: string };

export function postToEzuikitIframe(
  iframe: HTMLIFrameElement,
  message: Record<string, unknown>
): void {
  iframe.contentWindow?.postMessage(message, window.location.origin);
}

export function listenEzuikitIframe(
  handler: (msg: EzuikitIframeMessage) => void
): () => void {
  const onMessage = (ev: MessageEvent) => {
    if (ev.origin !== window.location.origin) return;
    const data = ev.data as EzuikitIframeMessage | undefined;
    if (!data?.type?.startsWith("ezuikit-")) return;
    handler(data);
  };
  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}
