"use client";

import { useState } from "react";
import type { StreamSession } from "@/lib/hct/types";
import { EzopenPlayer } from "./EzopenPlayer";

type State =
  | { status: "needsCode"; wrongCode?: boolean }
  | { status: "loading" }
  | { status: "ready"; session: StreamSession }
  | { status: "error"; message: string };

// El stream esta cifrado: se pide el codigo de verificacion del dispositivo.
// HCT acepta cualquier codigo al crear la sesion (va embebido en la URL ezopen),
// asi que el codigo solo se guarda cuando el player confirma el primer frame
// (poc:playing). Si la reproduccion falla (poc:error), el codigo era incorrecto
// y se vuelve a pedir.
export function LiveWithCode({ cameraId }: { cameraId: string }) {
  const [state, setState] = useState<State>({ status: "needsCode" });
  const [code, setCode] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: "loading" });
    const res = await fetch(`/api/cameras/${cameraId}/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = (await res.json().catch(() => null)) as
      | (StreamSession & { error?: string; message?: string })
      | null;
    if (res.status === 409) {
      setState({ status: "needsCode", wrongCode: code.length > 0 });
      return;
    }
    if (!res.ok || !data || !("url" in data)) {
      setState({ status: "error", message: data?.message ?? data?.error ?? "Error creando sesión" });
      return;
    }
    setState({ status: "ready", session: data });
  }

  if (state.status === "ready") {
    return (
      <EzopenPlayer
        session={state.session}
        onPlaying={() => {
          // Codigo verificado por reproduccion real: guardarlo en esta computadora
          fetch(`/api/cameras/${cameraId}/code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });
        }}
        onError={() => setState({ status: "needsCode", wrongCode: true })}
      />
    );
  }
  if (state.status === "loading") {
    return <div className="player-box"><div className="spinner" /></div>;
  }

  return (
    <div className="card">
      <div className="alert info">
        Esta cámara tiene el stream cifrado. Captura el código de verificación del
        dispositivo (el definido al darlo de alta en Hik-Connect). Solo se pide una
        vez: se guarda localmente en esta computadora.
      </div>
      {state.status === "needsCode" && state.wrongCode && (
        <div className="alert warn">Código incorrecto, verifícalo e intenta de nuevo.</div>
      )}
      {state.status === "error" && <div className="alert error">{state.message}</div>}
      <form onSubmit={submit}>
        <label htmlFor="code">Código de verificación</label>
        <input
          id="code"
          className="input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={16}
          autoFocus
          required
        />
        <div style={{ marginTop: 16 }}>
          <button className="btn" type="submit">Iniciar live</button>
        </div>
      </form>
    </div>
  );
}
