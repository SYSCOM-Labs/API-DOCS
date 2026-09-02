"use client";

import { useEffect, useRef } from "react";
import type { StreamSession } from "@/lib/hct/types";

const PLAYER_WIDTH = 860;
const PLAYER_HEIGHT = 480;

// EZUIKit hace cirugia sobre su contenedor (saca el div del DOM y lo recrea),
// lo cual rompe la reconciliacion de React. Por eso el player vive en una
// pagina estatica aislada (/player.html), identica al demo funcional, y aqui
// solo la embebemos en un iframe.
//
// Teardown del stream: Next.js 16 no desmonta la pagina anterior al navegar —
// la deja oculta (React Activity) y el iframe seguia vivo con el audio abierto.
// Al ocultarse, React corre el cleanup de este efecto: paramos el player y
// vaciamos el src. Al volver (Activity show o remount de StrictMode) el efecto
// se re-ejecuta y restaura el src, reiniciando el video.
//
// onPlaying/onError: player.html reporta via postMessage cuando el primer frame
// sale (handleSuccess) o cuando falla la reproduccion (handleError). Sirve para
// validar codigos de dispositivo: HCT devuelve URL aun con codigo incorrecto.
export function EzopenPlayer({
  session,
  onPlaying,
  onError,
}: {
  session: StreamSession;
  onPlaying?: () => void;
  onError?: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const callbacksRef = useRef({ onPlaying, onError });
  callbacksRef.current = { onPlaying, onError };

  const src = session.mock
    ? ""
    : `/player.html?url=${encodeURIComponent(session.url)}` +
      `&token=${encodeURIComponent(session.accessToken)}` +
      `&domain=${encodeURIComponent(session.domain)}`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !src) return;
    if (iframe.src !== new URL(src, window.location.origin).href) {
      iframe.src = src;
    }
    return () => {
      try {
        iframe.contentWindow?.postMessage("poc:stop", window.location.origin);
      } catch {
        // el pagehide de player.html es la segunda red de seguridad
      }
      iframe.src = "about:blank";
    };
  }, [src]);

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) return;
      if (e.data === "poc:playing") callbacksRef.current.onPlaying?.();
      if (e.data === "poc:error") callbacksRef.current.onError?.();
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  if (session.mock) {
    return (
      <div className="player-box">
        <div style={{ textAlign: "center", color: "#93a5bb" }}>
          <p style={{ fontSize: 18, fontWeight: 600 }}>Visor simulado (modo MOCK)</p>
          <p className="mono">{session.url}</p>
          <p>En modo LIVE aquí se monta EZUIKit con la sesión EZOPEN real.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="player-box">
      <iframe
        ref={iframeRef}
        src={src}
        width={PLAYER_WIDTH}
        height={PLAYER_HEIGHT}
        style={{ border: "none", background: "#000" }}
        allow="autoplay; fullscreen"
        title="Video en vivo"
      />
    </div>
  );
}
