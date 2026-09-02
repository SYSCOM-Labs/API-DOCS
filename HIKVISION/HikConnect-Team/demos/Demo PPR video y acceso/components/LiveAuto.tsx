"use client";

import { useState } from "react";
import type { StreamSession } from "@/lib/hct/types";
import { EzopenPlayer } from "./EzopenPlayer";
import { LiveWithCode } from "./LiveWithCode";

// La sesion se creo con un codigo guardado localmente. Si la reproduccion falla,
// ese codigo ya no sirve (rotado o incorrecto): se borra del archivo local y se
// cae al prompt para capturar uno nuevo.
export function LiveAuto({ session, cameraId }: { session: StreamSession; cameraId: string }) {
  const [invalid, setInvalid] = useState(false);

  if (invalid) return <LiveWithCode cameraId={cameraId} />;

  return (
    <EzopenPlayer
      session={session}
      onError={() => {
        setInvalid(true);
        fetch(`/api/cameras/${cameraId}/code`, { method: "DELETE" });
      }}
    />
  );
}
