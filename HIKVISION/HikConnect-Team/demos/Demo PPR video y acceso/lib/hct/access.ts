import { hctFetch } from "./client";

export type DoorAction = "unlock" | "lock" | "remain_unlock" | "remain_lock";

const ACTION_TYPES: Record<DoorAction, number> = {
  unlock: 1,
  lock: 2,
  remain_unlock: 3,
  remain_lock: 4,
};

interface RemoteControlResult {
  operationResult?: Array<{ elementId?: string; errorCode?: string }>;
}

// NUNCA enviar elementlist vacio: la guia permite que el alcance sean todas las puertas.
export async function remoteDoorControl(doorId: string, action: DoorAction): Promise<void> {
  if (!doorId) throw new Error("doorId requerido");
  await hctFetch<RemoteControlResult>("/acs/v1/remote/control", {
    body: {
      remoteControl: {
        actionType: ACTION_TYPES[action],
        elementlist: [doorId],
        direction: 0,
        areaId: "",
        depthTraversal: 0,
      },
    },
  });
}
