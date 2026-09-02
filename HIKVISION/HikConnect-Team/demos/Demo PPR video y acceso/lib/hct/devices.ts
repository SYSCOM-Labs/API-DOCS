import { hctFetch } from "./client";

// Alta/baja de dispositivos (camaras/NVR = encodingDevice, control de acceso =
// accessControllerDevice). Mutaciones sin cache; el caller revalida inventarios.

interface HctTimezoneResponse {
  timeZone?: { id?: string }[];
  systemTimeZoneID?: string;
}

async function getSystemTimezoneId(): Promise<string> {
  const data = await hctFetch<HctTimezoneResponse>("/resource/v1/timezone/get", { body: {} });
  return data.systemTimeZoneID ?? data.timeZone?.[0]?.id ?? "19";
}

export interface NewDevice {
  name: string;
  serial: string;
  verifyCode: string;
  category: "encodingDevice" | "accessControllerDevice";
}

export interface AddDeviceResult {
  succeeded: number;
  failed: number;
  errorCode?: string;
}

export async function addDevice(input: NewDevice): Promise<AddDeviceResult> {
  const timeZoneId = await getSystemTimezoneId();
  const data = await hctFetch<{
    addDeviceResponse?: {
      succeeded?: number;
      failed?: number;
      deviceList?: { errorCode?: string }[];
    };
  }>("/resource/v1/devices/add", {
    body: {
      deviceCategory: input.category,
      deviceInfo: {
        name: input.name,
        ezvizSerialNo: input.serial,
        ezvizVerifyCode: input.verifyCode,
      },
      importToArea: { areaID: "", enable: "0" },
      timeZone: { id: timeZoneId, applyToDevice: "1" },
    },
  });
  const res = data?.addDeviceResponse;
  return {
    succeeded: res?.succeeded ?? 0,
    failed: res?.failed ?? 0,
    errorCode: res?.deviceList?.[0]?.errorCode,
  };
}

export async function deleteDevice(deviceId: string, category: string): Promise<void> {
  await hctFetch("/resource/v1/devices/delete", {
    body: { deviceID: [deviceId], deviceCategory: category },
  });
}
