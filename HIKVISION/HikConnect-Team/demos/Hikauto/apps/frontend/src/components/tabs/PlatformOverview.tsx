import type { PlatformSnapshot, DiscoveredVehicle } from "../../types";

import { btnSecondary } from "../ui/classes";



interface PlatformOverviewProps {

  platform: PlatformSnapshot | null;

  sandboxMode: boolean;

  selectedVehicleId: string;

  onSelectVehicle: (id: string) => void;

  onRediscover: () => void;

  discovering: boolean;

}



const CAPABILITIES = [

  { key: "vehicles", label: "Agregar vehículo", endpoint: "POST /vehicles/add" },

  { key: "acc", label: "Estado ACC", endpoint: "POST /accstatus/search" },

  { key: "drivers", label: "Conductores", endpoint: "POST /driver/add" },

  { key: "stream", label: "Video en vivo", endpoint: "POST /video/live" },

  { key: "telemetry", label: "Telemetría GPS", endpoint: "POST /mq/subscribe" },

];



export function PlatformOverview({

  platform,

  sandboxMode,

  selectedVehicleId,

  onSelectVehicle,

  onRediscover,

  discovering,

}: PlatformOverviewProps) {

  if (sandboxMode && !platform) {

    return (

      <div className="space-y-6">

        <header>

          <p className="section-label">Plataforma</p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">Modo exploración</h2>

          <p className="mt-2 text-sm text-ink-secondary">

            Conecta con credenciales reales para cargar tu inventario Hik-Connect.

          </p>

        </header>

        <CapabilityList platform={null} />

      </div>

    );

  }



  if (!platform) {

    return (

      <p className="text-sm text-ink-secondary">

        Sin datos. Usa «Sincronizar» en la barra superior.

      </p>

    );

  }



  const { summary } = platform;



  return (

    <div className="space-y-8">

      <header className="flex flex-wrap items-start justify-between gap-4">

        <div>

          <p className="section-label">Plataforma</p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">Tu inventario</h2>

          <p className="mt-1 text-sm text-ink-secondary">{platform.areaDomain}</p>

        </div>

        <button

          type="button"

          onClick={onRediscover}

          disabled={discovering}

          className={btnSecondary}

        >

          {discovering ? "Sincronizando…" : "Sincronizar"}

        </button>

      </header>



      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

        <StatCard label="Áreas" value={summary.areaCount} />

        <StatCard label="Vehículos" value={summary.vehicleCount} />

        <StatCard label="Online" value={summary.onlineVehicleCount} />

        <StatCard label="Conductores" value={summary.driverCount} />

      </div>



      {platform.vehicles.length > 0 && (

        <section>

          <p className="section-label">Dispositivo activo</p>

          <select

            className="mt-2 w-full rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"

            value={selectedVehicleId}

            onChange={(e) => onSelectVehicle(e.target.value)}

          >

            {platform.vehicles.map((v) => (

              <option key={v.vehicleId} value={v.vehicleId}>

                {v.licensePlateNo} — {v.deviceSerial}

                {v.online === "1" ? " · online" : ""}

              </option>

            ))}

          </select>

          {platform.vehicles.find((v) => v.vehicleId === selectedVehicleId) && (

            <VehicleDetail

              vehicle={platform.vehicles.find((v) => v.vehicleId === selectedVehicleId)!}

            />

          )}

        </section>

      )}



      {platform.vehicles.length === 0 && (

        <p className="text-sm text-ink-secondary">

          No hay vehículos onboard. Agrega uno en la sección Vehículos.

        </p>

      )}



      <CapabilityList platform={platform} />

    </div>

  );

}



function StatCard({ label, value }: { label: string; value: number }) {

  return (

    <div className="content-card py-4 text-center">

      <div className="text-2xl font-semibold tabular-nums text-ink">{value}</div>

      <div className="mt-1 text-xs text-ink-tertiary">{label}</div>

    </div>

  );

}



function VehicleDetail({ vehicle }: { vehicle: DiscoveredVehicle }) {

  return (

    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-neutral-50 px-4 py-3 text-xs">

      <dt className="text-ink-tertiary">vehicleId</dt>

      <dd className="truncate font-mono text-ink">{vehicle.vehicleId}</dd>

      <dt className="text-ink-tertiary">deviceSerial</dt>

      <dd className="font-mono text-accent">{vehicle.deviceSerial}</dd>

      <dt className="text-ink-tertiary">areaId</dt>

      <dd className="truncate font-mono text-ink">{vehicle.areaId}</dd>

      <dt className="text-ink-tertiary">cameraId</dt>

      <dd className="truncate font-mono text-ink">{vehicle.cameraId || "—"}</dd>

    </dl>

  );

}



function CapabilityList({ platform }: { platform: PlatformSnapshot | null }) {

  const ready = (key: string) => {

    if (!platform) return key === "telemetry";

    switch (key) {

      case "vehicles":

        return platform.areas.length > 0;

      case "acc":

        return Boolean(platform.deviceSerialsCsv);

      case "drivers":

        return platform.driverGroups.length > 0 || platform.areas.length > 0;

      case "stream":

        return platform.vehicles.some((v) => v.deviceSerial);

      case "telemetry":

        return Boolean(platform.deviceSerialsCsv);

      default:

        return false;

    }

  };



  return (

    <section>

      <p className="section-label">Capacidades disponibles</p>

      <ul className="mt-3 divide-y divide-black/[0.06] rounded-2xl border border-black/[0.06] bg-surface-raised">

        {CAPABILITIES.map((c) => (

          <li

            key={c.key}

            className="flex items-center justify-between px-4 py-3 text-sm"

          >

            <div>

              <span className="text-ink">{c.label}</span>

              <span className="ml-2 font-mono text-[10px] text-ink-tertiary">{c.endpoint}</span>

            </div>

            <span className={ready(c.key) ? "text-emerald-600" : "text-ink-tertiary"}>

              {ready(c.key) ? "Listo" : "—"}

            </span>

          </li>

        ))}

      </ul>

    </section>

  );

}

