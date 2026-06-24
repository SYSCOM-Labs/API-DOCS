import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "../../api/client";
import { GUIDES } from "../../content/guides";
import { GuidePanel, FormField } from "../GuidePanel";
import {
  listenEzuikitIframe,
  postToEzuikitIframe,
  type StreamTokenBundle,
} from "../../lib/ezuikit";
import {
  applyEzopenChannel,
  camerasForDevice,
  defaultCameraChannel,
  formatChannelLabel,
  resolveCameraResource,
} from "../../lib/ezopenChannel";
import type { FleetTabProps } from "./types";
import { btnDestructive, btnPrimary, btnSecondary, inputClass } from "../ui/classes";

const PLAYER_W = 640;
const PLAYER_H = 360;

export function LiveStreamTab({
  credentialsEnvelope,
  isConfigured,
  platform,
  selectedVehicle,
  onHud,
}: FleetTabProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [deviceSerial, setDeviceSerial] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [deviceCode, setDeviceCode] = useState("");
  const [cameraChannel, setCameraChannel] = useState(5);
  const [twoWayAudio, setTwoWayAudio] = useState(false);
  const [liveUrl, setLiveUrl] = useState("");
  const [streamToken, setStreamToken] = useState<StreamTokenBundle>({});
  const [iframeReady, setIframeReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  const deviceCameras = camerasForDevice(platform, deviceSerial);

  useEffect(() => {
    if (!selectedVehicle) return;
    setDeviceSerial(selectedVehicle.deviceSerial);
    const ch =
      Number(selectedVehicle.cameraChannelNo) ||
      defaultCameraChannel(platform, selectedVehicle.deviceSerial, 5);
    setCameraChannel(ch);
    setResourceId(
      resolveCameraResource(platform, selectedVehicle.deviceSerial, ch) ||
        selectedVehicle.cameraId
    );
    try {
      const saved = localStorage.getItem(
        `hikFleet.deviceCode.${selectedVehicle.deviceSerial}`
      );
      if (saved) setDeviceCode(saved);
      const savedCh = localStorage.getItem(
        `hikFleet.cameraChannel.${selectedVehicle.deviceSerial}`
      );
      if (savedCh) {
        const n = Number(savedCh);
        if (n > 0) {
          setCameraChannel(n);
          const rid = resolveCameraResource(platform, selectedVehicle.deviceSerial, n);
          if (rid) setResourceId(rid);
        }
      }
    } catch {
      /* ignore */
    }
  }, [selectedVehicle, platform]);

  useEffect(() => {
    if (!deviceSerial) return;
    const rid = resolveCameraResource(platform, deviceSerial, cameraChannel);
    if (rid) setResourceId(rid);
  }, [deviceSerial, cameraChannel, platform]);

  useEffect(() => {
    if (deviceSerial && deviceCode) {
      localStorage.setItem(`hikFleet.deviceCode.${deviceSerial}`, deviceCode);
    }
  }, [deviceSerial, deviceCode]);

  useEffect(() => {
    if (deviceSerial && cameraChannel > 0) {
      localStorage.setItem(`hikFleet.cameraChannel.${deviceSerial}`, String(cameraChannel));
    }
  }, [deviceSerial, cameraChannel]);

  useEffect(() => {
    return listenEzuikitIframe((msg) => {
      if (msg.type === "ezuikit-ready") setIframeReady(true);
      if (msg.type === "ezuikit-playing") setPlaying(true);
      if (msg.type === "ezuikit-stopped") setPlaying(false);
      if (msg.type === "ezuikit-error") {
        setError(msg.message);
        setPlaying(false);
      }
    });
  }, []);

  useEffect(
    () => () => {
      if (iframeRef.current) {
        postToEzuikitIframe(iframeRef.current, { type: "ezuikit-destroy" });
      }
    },
    []
  );

  async function loadStream() {
    if (!isConfigured) {
      setError("Conecta con Account y Password antes del live view real.");
      return;
    }
    if (!iframeReady || !iframeRef.current) {
      setError("Espera a que el reproductor iframe esté listo…");
      return;
    }

    setError("");
    setStep(1);
    setPlaying(false);

    const tokenRes = await apiGet<{ data?: StreamTokenBundle }>(
      "/api/fleet/stream/token",
      credentialsEnvelope
    );
    if (tokenRes.debug) onHud("Stream token (Paso 1)", tokenRes.debug);
    const tok = (tokenRes.data as { data?: StreamTokenBundle })?.data ?? {};
    if (!tok.appToken) {
      setError("No se obtuvo appToken. Revisa streamtoken/get en el Code HUD.");
      return;
    }
    setStreamToken(tok);
    setStep(2);

    const effectiveResourceId =
      resolveCameraResource(platform, deviceSerial, cameraChannel) || resourceId;

    const livePayload: Record<string, unknown> = {
      type: "1",
      deviceSerial,
      resourceId: effectiveResourceId,
      protocol: 1,
      quality: "1",
      cameraChannel,
    };
    if (deviceCode.trim()) livePayload.code = deviceCode.trim();

    const liveRes = await apiPost<{ data?: { url?: string } }>(
      "/api/fleet/live/address",
      credentialsEnvelope,
      livePayload
    );
    if (liveRes.debug) onHud("Live address (Paso 2)", liveRes.debug);
    let url = (liveRes.data as { data?: { url?: string } })?.data?.url ?? "";
    url = applyEzopenChannel(url, cameraChannel);
    setLiveUrl(url);
    if (!url) {
      setError("No se obtuvo URL EZOPEN. Revisa deviceSerial y canal en Code HUD.");
      return;
    }
    setStep(3);

    postToEzuikitIframe(iframeRef.current, {
      type: "ezuikit-init",
      url,
      appToken: tok.appToken,
      streamAreaDomain: tok.streamAreaDomain ?? "",
      width: PLAYER_W,
      height: PLAYER_H,
    });
  }

  function stopStream() {
    if (iframeRef.current) {
      postToEzuikitIframe(iframeRef.current, { type: "ezuikit-destroy" });
    }
    setPlaying(false);
    setTwoWayAudio(false);
    setStep(0);
    setLiveUrl("");
  }

  function toggleTwoWayAudio() {
    if (!playing || !iframeRef.current) return;
    if (!twoWayAudio && cameraChannel !== 1) {
      setError(
        "Two-Way Audio solo en canal 1 (PDF §1.2.9). Para video usa CH5; para hablar cambia a canal 1."
      );
      return;
    }
    setError("");
    const next = !twoWayAudio;
    setTwoWayAudio(next);
    postToEzuikitIframe(iframeRef.current, {
      type: next ? "ezuikit-talk-start" : "ezuikit-talk-stop",
    });
  }

  return (
    <div>
      <GuidePanel guide={GUIDES.stream} />

      {selectedVehicle && (
        <p className="mb-4 text-sm text-ink-secondary">
          {selectedVehicle.deviceSerial}
          {selectedVehicle.online === "1" ? " · online" : ""}
        </p>
      )}

      <p className="mb-4 text-xs text-ink-tertiary">
        Reproductor: {iframeReady ? "listo" : "cargando…"}
      </p>

      <div className="mb-4 flex gap-2 text-xs text-ink-tertiary">
        {["Token", "URL live", "Reproducir"].map((s, i) => (
          <span
            key={s}
            className={`rounded-full px-3 py-1 ${
              step > i ? "bg-accent/10 text-accent" : "bg-black/[0.04]"
            }`}
          >
            {i + 1}. {s}
          </span>
        ))}
      </div>

      <div className="space-y-3 text-sm">
        <FormField label="deviceSerial" hint="Serial del dashcam">
          <input className={inputClass} value={deviceSerial} onChange={(e) => setDeviceSerial(e.target.value)} />
        </FormField>
        <FormField label="resourceId" hint="cameraId del canal seleccionado">
          <input className={inputClass} value={resourceId} onChange={(e) => setResourceId(e.target.value)} />
        </FormField>
        <FormField
          label="code (opcional)"
          hint="Solo si el dispositivo tiene encriptación de stream activada"
        >
          <input
            className={inputClass}
            type="password"
            placeholder="Opcional — dejar vacío si no aplica"
            value={deviceCode}
            onChange={(e) => setDeviceCode(e.target.value)}
          />
        </FormField>
        <FormField label="cameraChannel" hint="Canal de video (OSD CH5 → 5)">
          {deviceCameras.length > 0 ? (
            <select
              className={inputClass}
              value={cameraChannel}
              onChange={(e) => setCameraChannel(Number(e.target.value))}
            >
              {deviceCameras.map((c) => (
                <option key={`${c.id}-${c.channelNo}`} value={Number(c.channelNo)}>
                  {formatChannelLabel(c.channelNo)}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              min={1}
              className={`${inputClass} w-24`}
              value={cameraChannel}
              onChange={(e) => setCameraChannel(Number(e.target.value))}
            />
          )}
        </FormField>

        {streamToken.streamAreaDomain && (
          <p className="text-xs text-ink-tertiary">streamAreaDomain: {streamToken.streamAreaDomain}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={loadStream} disabled={!iframeReady} className={btnPrimary}>
            Iniciar stream
          </button>
          <button type="button" onClick={stopStream} disabled={!playing} className={btnSecondary}>
            Detener
          </button>
          <button
            type="button"
            onClick={toggleTwoWayAudio}
            disabled={!playing}
            className={twoWayAudio ? btnDestructive : btnSecondary}
          >
            Audio {twoWayAudio ? "ON" : "OFF"}
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {liveUrl && (
          <p className="break-all text-xs text-ink-tertiary">EZOPEN: {liveUrl}</p>
        )}

        <iframe
          ref={iframeRef}
          src="/ezuikit-player.html"
          title="Hik Live Stream"
          className="block max-w-full rounded-2xl border border-black/[0.08] bg-black shadow-card"
          style={{ width: PLAYER_W, height: PLAYER_H, maxWidth: "100%" }}
          allow="autoplay; microphone"
        />
      </div>
    </div>
  );
}
