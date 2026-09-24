"use client";

import { useEffect, useState } from "react";
import { DevicePicker } from "@/components/DevicePicker";
import { OpsGrid } from "@/components/OperationCard";
import { hppCall, hppUpload, type HppCallResponse } from "@/lib/client";
import { categoryLabel, isSpeaker, useDevices } from "@/lib/devices";
import { explainError } from "@/lib/errors";
import { moduleBySlug } from "@/lib/operations";

type UploadedAudio = {
  audioFileUrl: string;
  uuid: string;
  name: string;
  format: string;
};

type DeviceAudio = {
  customAudioID: number;
  customAudioName?: string;
  audioFileFormat?: string;
  audioFileSize?: number;
  audioFileDuration?: number;
  customAudioFile?: { filePathType?: string; filePath?: string };
};

type CallOutcome = { serial: string; ok: boolean; detail: string };

/** Un elemento de la cola: archivo del altavoz o texto sintetizado. */
type PlaylistItem = {
  key: string;
  label: string;
  entry: { audioSource: "customAudio"; customAudioID: number } | {
    audioSource: "speechSynthesis";
    speechSynthesisContent: string;
  };
};

type Trace = {
  at: string;
  label: string;
  path: string;
  request: unknown;
  response: unknown;
};

/** HPP rechaza con VMS050028 cualquier nombre con acentos, espacios o signos. */
function sanitizeName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9_-]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 60);
}

/** Los campos de TTS solo aplican cuando la fuente es speechSynthesis. */
function buildCutBody(
  serial: string,
  playAudioList: object[],
  options: {
    level: number;
    volume: number;
    playMode?: "order" | "loop";
    playDuration?: number;
  },
) {
  const isTts = playAudioList.some(
    (item) => (item as { audioSource?: string }).audioSource === "speechSynthesis",
  );
  const loop = options.playMode === "loop";
  return {
    deviceSerial: serial,
    audioLevel: options.level,
    audioVolume: options.volume,
    enabled: true,
    ...(options.playMode ? { playMode: options.playMode } : {}),
    ...(loop ? { playDuration: options.playDuration ?? 60 } : {}),
    ...(isTts ? { TTSLanguageType: "spanish", voiceType: "female", pace: 50 } : {}),
    playAudioList,
  };
}

const CUT_VARIANTS: Array<{ label: string; build: (serial: string, list: object[]) => unknown }> = [
  {
    label: "solo obligatorios",
    build: (serial, list) => ({ deviceSerial: serial, audioLevel: 10, audioVolume: 80, playAudioList: list }),
  },
  {
    label: "obligatorios + enabled",
    build: (serial, list) => ({
      deviceSerial: serial, audioLevel: 10, audioVolume: 80, enabled: true, playAudioList: list,
    }),
  },
  {
    label: "playMode order",
    build: (serial, list) => ({
      deviceSerial: serial, audioLevel: 10, audioVolume: 80, enabled: true, playMode: "order", playAudioList: list,
    }),
  },
  {
    label: "playMode loop + playDuration 10",
    build: (serial, list) => ({
      deviceSerial: serial, audioLevel: 10, audioVolume: 80, enabled: true,
      playMode: "loop", playDuration: 10, playAudioList: list,
    }),
  },
  {
    label: "prioridad 15 y volumen 100",
    build: (serial, list) => ({
      deviceSerial: serial, audioLevel: 15, audioVolume: 100, enabled: true, playAudioList: list,
    }),
  },
  {
    label: "payload completo con TTS",
    build: (serial, list) => ({
      deviceSerial: serial, audioLevel: 10, audioVolume: 80, enabled: true, playMode: "order",
      TTSLanguageType: "spanish", voiceType: "female", pace: 50, playAudioList: list,
    }),
  },
];

function errorCodeOf(response: HppCallResponse) {
  const result = response.result as { errorCode?: string } | undefined;
  return result?.errorCode ?? response.errorCode;
}

/** Mensaje de error: código de HPP, su traducción y el texto original. */
function errorText(response: HppCallResponse) {
  const result = response.result as { errorCode?: string; message?: string } | undefined;
  const code = errorCodeOf(response);
  const explanation = explainError(code, "audio");
  const raw = result?.message ?? response.message;
  return [code, explanation || raw].filter(Boolean).join(" · ") || `HTTP ${response.httpStatus ?? "?"}`;
}

function summarize(outcomes: CallOutcome[], action: string) {
  const failed = outcomes.filter((item) => !item.ok);
  if (!failed.length) {
    return `${action} en ${outcomes.length} altavoz(ces): ${outcomes.map((item) => item.serial).join(", ")}.`;
  }
  const ok = outcomes.length - failed.length;
  return `${action} en ${ok} de ${outcomes.length}. Fallos: ${failed
    .map((item) => `${item.serial} (${item.detail})`)
    .join(", ")}.`;
}

export default function AudioPage() {
  const [fileName, setFileName] = useState("aviso");
  const [formatType, setFormatType] = useState("mp3");
  const [file, setFile] = useState<File | null>(null);
  const [localUrl, setLocalUrl] = useState("");
  const [uploaded, setUploaded] = useState<UploadedAudio | null>(null);
  const [serials, setSerials] = useState<string[]>([]);
  const [libraryTarget, setLibraryTarget] = useState("");
  const [audios, setAudios] = useState<DeviceAudio[]>([]);
  const [tts, setTts] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [trace, setTrace] = useState<Trace[]>([]);
  const [level, setLevel] = useState(10);
  const [volume, setVolume] = useState(80);
  const [lastPlayed, setLastPlayed] = useState<object[] | null>(null);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [playMode, setPlayMode] = useState<"order" | "loop">("order");
  const [playDuration, setPlayDuration] = useState(60);
  const { devices } = useDevices();
  const audioModule = moduleBySlug("audio");

  const notSpeakers = serials
    .map((serial) => devices.find((device) => device.deviceSerial === serial))
    .filter((device) => device && !isSpeaker(device));

  async function tracked(label: string, path: string, body: unknown) {
    const response = await hppCall({ path, body });
    setTrace((prev) => [
      { at: new Date().toLocaleTimeString(), label, path, request: body, response },
      ...prev,
    ].slice(0, 6));
    return response;
  }

  async function runOnDevices(
    label: string,
    path: string,
    targets: string[],
    buildBody: (serial: string) => unknown,
  ): Promise<CallOutcome[]> {
    const outcomes: CallOutcome[] = [];
    for (const serial of targets) {
      const response = await tracked(`${label} · ${serial}`, path, buildBody(serial));
      const result = response.result as { errorCode?: string } | undefined;
      outcomes.push({
        serial,
        ok: result?.errorCode === "0",
        detail: errorText(response),
      });
    }
    return outcomes;
  }

  useEffect(() => {
    if (!file) {
      setLocalUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!serials.includes(libraryTarget)) {
      setLibraryTarget(serials[0] ?? "");
      setAudios([]);
    }
  }, [serials, libraryTarget]);

  // La biblioteca se consulta sola al elegir un altavoz.
  useEffect(() => {
    if (libraryTarget) void loadLibrary(libraryTarget);
     
  }, [libraryTarget]);

  async function upload() {
    if (!file) return;
    const safeName = sanitizeName(fileName);
    if (!safeName) {
      setMessage("El nombre queda vacío tras quitar los caracteres especiales. Escribe otro.");
      return;
    }
    if (safeName !== fileName) setFileName(safeName);
    setBusy(true);
    setMessage("Subiendo archivo a Hik-Partner Pro…");
    const form = new FormData();
    form.set("path", "/api/hpcgw/v1/audio/file/upload");
    form.set("fileName", safeName);
    form.set("formatType", formatType);
    form.set("audioFile", file);
    try {
      const response = await hppUpload(form);
      setTrace((prev) => [
        {
          at: new Date().toLocaleTimeString(),
          label: "audio/file/upload",
          path: "/api/hpcgw/v1/audio/file/upload",
          request: { fileName, formatType, audioFile: file.name },
          response,
        },
        ...prev,
      ].slice(0, 6));
      const result = response.result as {
        errorCode?: string;
        message?: string;
        data?: { audioFileUrl?: string; uuid?: string };
      };
      if (result?.errorCode === "0" && result.data?.audioFileUrl && result.data.uuid) {
        setUploaded({
          audioFileUrl: result.data.audioFileUrl,
          uuid: result.data.uuid,
          name: fileName,
          format: formatType,
        });
        setMessage("Archivo subido. Ahora aplícalo a los altavoces seleccionados.");
      } else {
        setMessage(`No se pudo subir: ${errorText(response)}`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function applyToDevices() {
    if (!uploaded || !serials.length) return;
    setBusy(true);
    setMessage("Registrando el audio en los altavoces…");
    try {
      const outcomes = await runOnDevices("audio/file/add", "/api/hpcgw/v1/audio/file/add", serials, (serial) => ({
        deviceSerial: serial,
        customAudioInfo: {
          customAudioName: uploaded.name,
          customAudioURL: uploaded.audioFileUrl,
          audioFileFormat: uploaded.format,
          uuid: uploaded.uuid,
        },
      }));
      setMessage(summarize(outcomes, "Audio aplicado"));
      if (outcomes.some((item) => item.ok)) {
        await loadLibrary(libraryTarget || serials[0]);
      }
    } finally {
      setBusy(false);
    }
  }

  async function loadLibrary(target = libraryTarget) {
    if (!target) return;
    setBusy(true);
    setMessage(`Consultando la biblioteca de ${target}…`);
    try {
      const response = await tracked(
        "audio/file/list/get",
        "/api/hpcgw/v1/audio/file/list/get",
        { deviceSerial: target },
      );
      const result = response.result as {
        errorCode?: string;
        data?: Record<string, unknown>;
      } | undefined;
      if (result?.errorCode === "0") {
        // Algunos firmwares devuelven la lista con otra capitalización.
        const data = result.data ?? {};
        const list = (data.CustomAudioInfoList ??
          data.customAudioInfoList ??
          data.customAudioList ??
          []) as DeviceAudio[];
        setAudios(list);
        setMessage(
          list.length
            ? `${list.length} audio(s) configurado(s) en ${target}.`
            : `${target} respondió sin audios. Aplica un archivo o revisa el diagnóstico.`,
        );
      } else {
        setAudios([]);
        setMessage(`No se pudo consultar ${target}: ${errorText(response)}`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function cutIn(
    targets: string[],
    playAudioList: object[],
    action: string,
    mode: "order" | "loop" = "order",
  ) {
    if (!targets.length) return;
    setBusy(true);
    setLastPlayed(playAudioList);
    setMessage("Enviando orden de reproducción…");
    try {
      const outcomes = await runOnDevices(
        "audio/inter/cut",
        "/api/hpcgw/v1/audio/inter/cut",
        targets,
        (serial) => buildCutBody(serial, playAudioList, {
          level,
          volume,
          playMode: mode,
          playDuration,
        }),
      );
      setMessage(`${summarize(outcomes, action)} El sonido sale del altavoz, no del navegador.`);
    } finally {
      setBusy(false);
    }
  }

  function addToPlaylist(item: Omit<PlaylistItem, "key">) {
    setPlaylist((prev) => [...prev, { ...item, key: `${Date.now()}-${prev.length}` }]);
  }

  function movePlaylistItem(index: number, delta: number) {
    setPlaylist((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  /** enabled:false cancela el cut-in en curso (tabla 3-129). */
  async function stopPlayback(targets: string[]) {
    if (!targets.length) return;
    setBusy(true);
    setMessage("Enviando orden de parada…");
    try {
      const reference = lastPlayed ?? [{ audioSource: "customAudio", customAudioID: audios[0]?.customAudioID ?? 1 }];
      const outcomes = await runOnDevices(
        "audio/inter/cut · stop",
        "/api/hpcgw/v1/audio/inter/cut",
        targets,
        (serial) => ({
          deviceSerial: serial,
          audioLevel: level,
          audioVolume: volume,
          enabled: false,
          playAudioList: reference,
        }),
      );
      setMessage(summarize(outcomes, "Parada enviada"));
    } finally {
      setBusy(false);
    }
  }

  /** Recorre payloads cada vez más simples para aislar qué campo rechaza el servicio. */
  async function probeVariants(playAudioList: object[]) {
    if (!libraryTarget) return;
    setBusy(true);
    const failures: string[] = [];
    try {
      for (const variant of CUT_VARIANTS) {
        setMessage(`Probando variante: ${variant.label}…`);
        const response = await tracked(
          `variante · ${variant.label}`,
          "/api/hpcgw/v1/audio/inter/cut",
          variant.build(libraryTarget, playAudioList),
        );
        const code = errorCodeOf(response);
        if (code === "0") {
          setMessage(`Funcionó la variante «${variant.label}». Ese es el payload que acepta ${libraryTarget}.`);
          return;
        }
        failures.push(`${variant.label} → ${code ?? "sin código"}`);
      }
      setMessage(
        `Ninguna variante funcionó en ${libraryTarget}: ${failures.join(" · ")}. ` +
          "El rechazo no viene del formato del cuerpo.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">IP Speaker · categoría 12 / subtipo 19</span>
        <h2>Centro de audio</h2>
        <p>Sube, administra y emite avisos por los altavoces de la instalación.</p>
      </header>

      <div className="note audio-explanation">
        <strong>Hay dos reproducciones diferentes:</strong> “Vista previa” suena en este navegador
        antes de subir. “Reproducir en altavoz” envía una orden <code>audio/inter/cut</code> y el
        sonido sale físicamente de los IP Speaker seleccionados.
      </div>

      <section className="audio-workflow">
        <article className="neu audio-step">
          <span className="step-number">1</span>
          <h3>Seleccionar y revisar</h3>
          <p className="desc">MP3, WAV o AAC; máximo 10 MB. El nombre debe ser único.</p>
          <label className="label">
            Archivo
            <input
              className="field"
              type="file"
              accept=".mp3,.wav,.aac,audio/*"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                setFile(selected);
                if (selected) {
                  setFileName(sanitizeName(selected.name.replace(/\.[^.]+$/, "")));
                  setFormatType(selected.name.split(".").pop()?.toLowerCase() ?? "mp3");
                }
              }}
            />
          </label>
          <label className="label">
            Nombre en HPP
            <input className="field" value={fileName} onChange={(event) => setFileName(event.target.value)} />
          </label>
          {sanitizeName(fileName) !== fileName && (
            <p className="desc slider-note">
              Se enviará como <code>{sanitizeName(fileName) || "(vacío)"}</code>: HPP rechaza acentos,
              espacios y signos con VMS050028.
            </p>
          )}
          {localUrl && (
            <div className="browser-preview">
              <span>Vista previa en este navegador</span>
              <audio controls src={localUrl} />
            </div>
          )}
          <button className="btn primary" disabled={busy || !file} onClick={() => void upload()}>
            {busy ? "Procesando…" : "Subir a HPP"}
          </button>
        </article>

        <article className="neu audio-step">
          <span className="step-number">2</span>
          <h3>Elegir altavoces</h3>
          <p className="desc">
            Marca uno o varios equipos del inventario. Puedes aplicar y emitir en todos a la vez.
          </p>
          <DevicePicker
            selected={serials}
            onChange={setSerials}
            compatibleOnly
            compatibleLabel="Solo IP Speaker (12 / 19)"
            isCompatible={isSpeaker}
            hint="Desmarca el filtro si tu altavoz reporta otra categoría."
          />
          {uploaded ? (
            <div className="uploaded-audio">
              <strong>{uploaded.name}.{uploaded.format}</strong>
              <small>UUID: {uploaded.uuid}</small>
            </div>
          ) : (
            <div className="empty-state compact">Sube un archivo para poder aplicarlo.</div>
          )}
          <div className="btn-row">
            <button
              className="btn primary"
              disabled={busy || !uploaded || !serials.length}
              onClick={() => void applyToDevices()}
            >
              Aplicar a {serials.length || 0} altavoz(ces)
            </button>
            <button className="btn" disabled={busy || !libraryTarget} onClick={() => void loadLibrary()}>
              Ver biblioteca
            </button>
          </div>
        </article>
      </section>

      {notSpeakers.length > 0 && (
        <div className="note audio-warning">
          <strong>Estos equipos no son IP Speaker:</strong>{" "}
          {notSpeakers.map((device) => `${device?.deviceSerial} (${categoryLabel(device!)})`).join(", ")}.
          Las APIs de audio solo funcionan en categoría 12 / subtipo 19, así que devolverán
          EVZ20015 o EVZ60020.
        </div>
      )}

      {message && <div className="dashboard-status audio-status">{message}</div>}

      <div className="audio-layout">
        <section className="neu">
          <div className="section-title">
            <div>
              <h3>Biblioteca del altavoz</h3>
              <p className="desc">Cada equipo tiene sus propios IDs de audio.</p>
            </div>
            <div className="library-target">
              <select
                className="field"
                value={libraryTarget}
                disabled={!serials.length}
                onChange={(event) => {
                  setLibraryTarget(event.target.value);
                  void loadLibrary(event.target.value);
                }}
              >
                {!serials.length && <option value="">Sin altavoces</option>}
                {serials.map((serial) => (
                  <option key={serial} value={serial}>{serial}</option>
                ))}
              </select>
              <button className="btn" disabled={busy || !libraryTarget} onClick={() => void loadLibrary()}>
                Actualizar
              </button>
            </div>
          </div>
          <div className="cut-params">
            <label className="label">
              <span className="slider-head">Volumen <strong>{volume}</strong></span>
              <input
                className="slider"
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
              />
            </label>
            <label className="label">
              <span className="slider-head">Prioridad <strong>{level}</strong></span>
              <input
                className="slider"
                type="range"
                min={0}
                max={15}
                value={level}
                onChange={(event) => setLevel(Number(event.target.value))}
              />
            </label>
          </div>
          <p className="desc slider-note">
            El volumen viaja dentro de cada orden de reproducción: se fija al enviarla y no cambia el
            audio que ya está sonando. Para subirlo o bajarlo, mueve la barra y vuelve a reproducir.
          </p>
          <div className="btn-row">
            <button
              className="btn danger"
              disabled={busy || !libraryTarget}
              onClick={() => void stopPlayback([libraryTarget])}
            >
              Detener en {libraryTarget || "altavoz"}
            </button>
            {serials.length > 1 && (
              <button className="btn" disabled={busy} onClick={() => void stopPlayback(serials)}>
                Detener en todos
              </button>
            )}
          </div>
          <div className="audio-library">
            {!audios.length && (
              <div className="empty-state">
                <strong>Sin audios cargados</strong>
                <span>Selecciona un altavoz y pulsa Actualizar.</span>
              </div>
            )}
            {audios.map((audio) => {
              const previewUrl = audio.customAudioFile?.filePathType === "URL"
                ? audio.customAudioFile.filePath
                : undefined;
              return (
                <article className="audio-item" key={audio.customAudioID}>
                  <div>
                    <strong>{audio.customAudioName ?? `Audio ${audio.customAudioID}`}</strong>
                    <small>
                      ID {audio.customAudioID} · {audio.audioFileFormat ?? "—"} ·{" "}
                      {audio.audioFileDuration ? `${audio.audioFileDuration}s` : "duración n/d"}
                    </small>
                  </div>
                  {previewUrl && <audio controls preload="none" src={previewUrl} />}
                  <div className="btn-row">
                    <button
                      className="btn primary"
                      disabled={busy || !libraryTarget}
                      onClick={() => void cutIn(
                        [libraryTarget],
                        [{ audioSource: "customAudio", customAudioID: audio.customAudioID }],
                        "Reproducción aceptada",
                      )}
                    >
                      Reproducir
                    </button>
                    <button
                      className="btn"
                      disabled={busy}
                      onClick={() => addToPlaylist({
                        label: audio.customAudioName ?? `Audio ${audio.customAudioID}`,
                        entry: { audioSource: "customAudio", customAudioID: audio.customAudioID },
                      })}
                    >
                      + Lista
                    </button>
                    <button
                      className="btn"
                      disabled={busy || !libraryTarget}
                      title="Reintenta con payloads cada vez más simples para aislar el campo que rechaza el servicio"
                      onClick={() => void probeVariants(
                        [{ audioSource: "customAudio", customAudioID: audio.customAudioID }],
                      )}
                    >
                      Probar variantes
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="neu tts-panel">
          <span className="step-number">TTS</span>
          <h3>Texto a voz</h3>
          <p className="desc">
            No requiere archivos ni IDs, así que puede emitirse en todos los altavoces seleccionados.
          </p>
          <label className="label">
            Mensaje
            <textarea
              className="field"
              maxLength={4096}
              placeholder="Atención: esta es una prueba del sistema de audio."
              value={tts}
              onChange={(event) => setTts(event.target.value)}
            />
          </label>
          <div className="btn-row">
            <button
              className="btn primary"
              disabled={busy || !serials.length || !tts.trim()}
              onClick={() => void cutIn(
                serials,
                [{ audioSource: "speechSynthesis", speechSynthesisContent: tts.trim() }],
                "TTS aceptado",
              )}
            >
              Emitir en {serials.length || 0} altavoz(ces)
            </button>
            <button
              className="btn"
              disabled={busy || !tts.trim()}
              onClick={() => {
                addToPlaylist({
                  label: `TTS: ${tts.trim().slice(0, 30)}${tts.trim().length > 30 ? "…" : ""}`,
                  entry: { audioSource: "speechSynthesis", speechSynthesisContent: tts.trim() },
                });
                setTts("");
              }}
            >
              + Lista
            </button>
            {libraryTarget && serials.length > 1 && (
              <button
                className="btn"
                disabled={busy || !tts.trim()}
                onClick={() => void cutIn(
                  [libraryTarget],
                  [{ audioSource: "speechSynthesis", speechSynthesisContent: tts.trim() }],
                  "TTS aceptado",
                )}
              >
                Solo {libraryTarget}
              </button>
            )}
          </div>
          {!serials.length && <p className="desc">Selecciona altavoces en el paso 2.</p>}
        </section>
      </div>

      <section className="neu playlist-panel">
        <div className="section-title">
          <div>
            <h3>Lista de reproducción</h3>
            <p className="desc">
              Una sola orden <code>audio/inter/cut</code> con varios elementos en{" "}
              <code>playAudioList</code>: el altavoz los encadena en orden. Puedes mezclar archivos
              y texto a voz.
            </p>
          </div>
          {playlist.length > 0 && (
            <button className="btn" disabled={busy} onClick={() => setPlaylist([])}>
              Vaciar
            </button>
          )}
        </div>

        {!playlist.length ? (
          <div className="empty-state">
            <strong>La lista está vacía</strong>
            <span>Usa «+ Lista» en la biblioteca o en el panel de texto a voz.</span>
          </div>
        ) : (
          <ol className="playlist">
            {playlist.map((item, index) => (
              <li key={item.key}>
                <span className="playlist-index">{index + 1}</span>
                <span className="playlist-label">
                  <strong>{item.label}</strong>
                  <small>
                    {item.entry.audioSource === "customAudio"
                      ? `customAudio · ID ${item.entry.customAudioID}`
                      : "speechSynthesis"}
                  </small>
                </span>
                <span className="playlist-actions">
                  <button className="btn" disabled={index === 0} onClick={() => movePlaylistItem(index, -1)}>↑</button>
                  <button
                    className="btn"
                    disabled={index === playlist.length - 1}
                    onClick={() => movePlaylistItem(index, 1)}
                  >
                    ↓
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => setPlaylist((prev) => prev.filter((entry) => entry.key !== item.key))}
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ol>
        )}

        <div className="cut-params">
          <label className="label">
            Modo
            <select
              className="field"
              value={playMode}
              onChange={(event) => setPlayMode(event.target.value as "order" | "loop")}
            >
              <option value="order">order · reproduce la lista una vez</option>
              <option value="loop">loop · repite la lista</option>
            </select>
          </label>
          {playMode === "loop" && (
            <label className="label">
              <span className="slider-head">Duración del bucle <strong>{playDuration}s</strong></span>
              <input
                className="slider"
                type="range"
                min={5}
                max={600}
                step={5}
                value={playDuration}
                onChange={(event) => setPlayDuration(Number(event.target.value))}
              />
            </label>
          )}
        </div>

        <div className="btn-row">
          <button
            className="btn primary"
            disabled={busy || !playlist.length || !libraryTarget}
            onClick={() => void cutIn(
              [libraryTarget],
              playlist.map((item) => item.entry),
              "Lista enviada",
              playMode,
            )}
          >
            Reproducir lista en {libraryTarget || "altavoz"}
          </button>
          {serials.length > 1 && playlist.every((item) => item.entry.audioSource === "speechSynthesis") && (
            <button
              className="btn"
              disabled={busy || !playlist.length}
              onClick={() => void cutIn(
                serials,
                playlist.map((item) => item.entry),
                "Lista enviada",
                playMode,
              )}
            >
              Reproducir en los {serials.length} altavoces
            </button>
          )}
        </div>
        {playlist.some((item) => item.entry.audioSource === "customAudio") && serials.length > 1 && (
          <p className="desc slider-note">
            La lista incluye archivos, y cada altavoz numera sus audios por separado, así que solo se
            envía al equipo seleccionado. Una lista con solo texto a voz sí puede ir a todos.
          </p>
        )}
      </section>

      <details className="advanced-tools" open={trace.length > 0}>
        <summary>Diagnóstico de las últimas llamadas ({trace.length})</summary>
        <p className="desc">
          Petición y respuesta exactas de cada paso. Si la reproducción no suena, aquí verás el
          errorCode que devolvió el altavoz.
        </p>
        {!trace.length && <div className="empty-state compact">Aún no hay llamadas en esta sesión.</div>}
        {trace.map((entry, index) => (
          <article className="trace-entry" key={`${entry.at}-${index}`}>
            <header>
              <strong>{entry.label}</strong>
              <small>{entry.at} · {entry.path}</small>
            </header>
            <pre className="result">{JSON.stringify({ request: entry.request, response: entry.response }, null, 2)}</pre>
          </article>
        ))}
      </details>

      <details className="advanced-tools">
        <summary>Herramientas API avanzadas</summary>
        <p className="desc">Formularios directos para borrado y payloads personalizados.</p>
        {audioModule && <OpsGrid ops={audioModule.ops} />}
      </details>
    </>
  );
}
