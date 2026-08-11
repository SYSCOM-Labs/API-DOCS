import { useEffect, useState } from "react";
import { apiPost } from "../../api/client";
import type { PlatformSnapshot, ProxyDebugInfo } from "../../types";
import {
  normalizeAccessLevels,
  normalizePersons,
  readHik,
  type AccessLevelItem,
  type PersonItem,
} from "../../lib/normalize";
import { ApiNote } from "../ui/ApiNote";
import { btnPrimary, btnSecondary, inputClass, selectClass } from "../ui/classes";

interface Props {
  credentialsEnvelope: Record<string, string>;
  sandboxMode: boolean;
  platform: PlatformSnapshot | null;
  onHud: (label: string, debug?: ProxyDebugInfo) => void;
}

interface ScheduleTemplate {
  id: string;
  name: string;
  remark?: string;
}

export function AccessTab({ credentialsEnvelope, sandboxMode, platform, onHud }: Props) {
  const [levels, setLevels] = useState<AccessLevelItem[]>([]);
  const [persons, setPersons] = useState<PersonItem[]>([]);
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [levelId, setLevelId] = useState("");
  const [personId, setPersonId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [newName, setNewName] = useState("");
  const [newRemark, setNewRemark] = useState("");
  const [resourceIds, setResourceIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const refresh = async () => {
    setBusy(true);
    setMsg("");
    try {
      const [al, p, t] = await Promise.all([
        apiPost("/api/attendance/access-levels/list", credentialsEnvelope, {
          sandboxMode,
          accessLevelSearchRequest: {
            pageIndex: 1,
            pageSize: 100,
            searchCriteria: { accessLevelName: "", associateResInfoList: [] },
          },
        }),
        apiPost("/api/attendance/persons/list", credentialsEnvelope, {
          sandboxMode,
          pageIndex: 1,
          pageSize: 100,
        }),
        apiPost("/api/attendance/access-levels/templates", credentialsEnvelope, {
          sandboxMode,
          pageIndex: 1,
          pageSize: 100,
        }),
      ]);

      if (al.debug) onHud("Listar niveles de acceso", al.debug);
      if (p.debug) onHud("Personas para asignación", p.debug);
      if (t.debug) onHud("Listar plantillas horarias", t.debug);

      const alHik = readHik(al);
      const pHik = readHik(p);
      const tHik = readHik<Record<string, unknown>>(t);
      const list = normalizeAccessLevels(alHik.payload);
      const plist = normalizePersons(pHik.payload);
      const templatePayload = tHik.payload as
        | {
            templateResponse?: { templateList?: ScheduleTemplate[] };
            templateList?: ScheduleTemplate[];
          }
        | undefined;
      const templateList =
        templatePayload?.templateResponse?.templateList ?? templatePayload?.templateList ?? [];

      setLevels(list);
      setPersons(plist);
      setTemplates(templateList);
      setLevelId((current) => current || list[0]?.id || "");
      setPersonId((current) => current || plist[0]?.personId || "");
      setTemplateId((current) => current || templateList[0]?.id || "");

      const failures = [
        alHik.errorCode !== "0" ? `niveles: ${alHik.errorCode}` : "",
        pHik.errorCode !== "0" ? `personas: ${pHik.errorCode}` : "",
        tHik.errorCode !== "0" ? `plantillas: ${tHik.errorCode}` : "",
      ].filter(Boolean);
      if (failures.length) setMsg(`La API respondió con error (${failures.join(", ")}).`);
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "No se pudieron cargar los niveles.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sandboxMode]);

  const toggleResource = (id: string) => {
    setResourceIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const createLevel = async () => {
    if (!newName.trim() || !templateId || !resourceIds.length) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await apiPost("/api/attendance/access-levels/add", credentialsEnvelope, {
        sandboxMode,
        accessLevel: {
          name: newName.trim(),
          remark: newRemark.trim(),
          timeSchedule: { id: templateId },
          associateResList: resourceIds.map((id) => ({ id })),
        },
      });
      if (res.debug) onHud("Crear nivel de acceso", res.debug);
      const hik = readHik(res);
      if (hik.errorCode !== "0") {
        setMsg(`No se creó el nivel. errorCode=${hik.errorCode}`);
        return;
      }
      setNewName("");
      setNewRemark("");
      setResourceIds([]);
      await refresh();
      setMsg("Nivel de acceso creado.");
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "No se pudo crear el nivel.");
    } finally {
      setBusy(false);
    }
  };

  const assign = async (remove = false) => {
    const path = remove
      ? "/api/attendance/access-levels/remove"
      : "/api/attendance/access-levels/assign";
    const label = remove ? "Quitar nivel" : "Asignar nivel";
    setBusy(true);
    setMsg("");
    try {
      const res = await apiPost(path, credentialsEnvelope, {
        sandboxMode,
        personList: [
          {
            personId,
            accessLevelIdList: [levelId],
          },
        ],
      });
      if (res.debug) onHud(label, res.debug);
      const hik = readHik(res);
      setMsg(
        hik.errorCode === "0"
          ? `${label}: listo`
          : `${label} falló. errorCode=${hik.errorCode}`
      );
    } catch (error) {
      setMsg(error instanceof Error ? error.message : `${label} falló.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">Niveles de acceso</h2>
          <p className="mt-1 text-sm text-ink-secondary">
            <span className="endpoint-badge">acspm/v1/accesslevel/*</span>
          </p>
        </div>
        <button
          type="button"
          className={btnSecondary}
          disabled={busy}
          onClick={() => void refresh()}
        >
          {busy ? "Consultando…" : "Refrescar"}
        </button>
      </div>

      {msg && <p className="text-sm text-ink-secondary">{msg}</p>}

      <ApiNote tone="api" title="Las plantillas horarias no se crean por API" defaultOpen>
        <p>
          La OpenAPI solo permite <strong>listar</strong> plantillas (
          <span className="endpoint-badge">acspm/v1/template/list</span>). Crear o editar días,
          franjas y festivos se hace en el portal:{" "}
          <em>Access Control → Access Schedule Template</em>.
        </p>
        <p>
          Aquí se usan las plantillas ya existentes al crear un nivel (
          <span className="endpoint-badge">acspm/v1/access/level/add</span>).
        </p>
        {templates.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5">
            {templates.map((template) => (
              <li key={template.id}>
                <span className="font-medium">{template.name}</span>
                {template.remark ? <span className="opacity-70"> — {template.remark}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs opacity-80">
            No hay plantillas en este tenant. Créalas primero en Hik-Connect y pulsa Refrescar.
          </p>
        )}
      </ApiNote>

      <div className="content-card space-y-4">
        <div>
          <h3 className="font-semibold">Crear nivel de acceso</h3>
          <span className="endpoint-badge">acspm/v1/access/level/add</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            Nombre
            <input
              className={inputClass}
              maxLength={64}
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Ej. Acceso oficinas"
            />
          </label>
          <label className="block text-sm">
            Observaciones
            <input
              className={inputClass}
              maxLength={128}
              value={newRemark}
              onChange={(event) => setNewRemark(event.target.value)}
              placeholder="Opcional"
            />
          </label>
        </div>
        <label className="block text-sm">
          Plantilla horaria
          <select
            className={selectClass}
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}
          >
            <option value="">Selecciona una plantilla…</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
        <p className="text-[11px] text-ink-tertiary">
          Si no aparece la plantilla, créala en Hik-Connect y pulsa Refrescar.
        </p>
        {!templates.length && (
          <p className="text-xs text-amber-700">
            No hay plantillas disponibles. Configúralas en el portal antes de crear un nivel.
          </p>
        )}
        <fieldset>
          <legend className="mb-2 text-sm">Puertas asociadas</legend>
          <div className="grid gap-2 md:grid-cols-2">
            {(platform?.doors ?? []).map((door) => (
              <label
                key={door.id}
                className="flex items-center gap-2 rounded-lg border border-black/[0.08] px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={resourceIds.includes(door.id)}
                  onChange={() => toggleResource(door.id)}
                />
                <span>{door.name}</span>
              </label>
            ))}
          </div>
          {!platform?.doors.length && (
            <p className="text-xs text-amber-700">
              No se descubrieron puertas para asociar al nivel.
            </p>
          )}
        </fieldset>
        <button
          type="button"
          className={btnPrimary}
          disabled={busy || !newName.trim() || !templateId || !resourceIds.length}
          onClick={() => void createLevel()}
        >
          {busy ? "Procesando…" : "Crear nivel"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="content-card">
          <h3 className="mb-3 font-semibold">Niveles disponibles</h3>
          <ul className="space-y-2 text-sm">
            {levels.map((l) => (
              <li key={l.id} className="flex justify-between gap-2">
                <span>
                  {l.name}
                  {l.remark ? (
                    <span className="text-ink-tertiary"> — {l.remark}</span>
                  ) : null}
                </span>
                <span className="font-mono text-[11px] text-ink-tertiary">{l.id}</span>
              </li>
            ))}
            {!levels.length && (
              <p className="text-ink-secondary">
                No hay niveles creados o la consulta no devolvió resultados.
              </p>
            )}
          </ul>
        </div>

        <div className="content-card space-y-3">
          <h3 className="font-semibold">Asignar / quitar</h3>
          <label className="block text-sm">
            Nivel
            <select className={selectClass} value={levelId} onChange={(e) => setLevelId(e.target.value)}>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Persona
            <select
              className={selectClass}
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
            >
              {persons.map((p) => (
                <option key={p.personId} value={p.personId}>
                  {p.displayName || p.personId} ({p.personCode ?? "sin código"})
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className={btnPrimary}
              disabled={busy || !levelId || !personId}
              onClick={() => void assign(false)}
            >
              Asignar
            </button>
            <button
              type="button"
              className={btnSecondary}
              disabled={busy || !levelId || !personId}
              onClick={() => void assign(true)}
            >
              Quitar
            </button>
          </div>
          <p className="text-[11px] text-ink-tertiary">
            Tras vincular, las actualizaciones de persona/credenciales se sincronizan al dispositivo.
          </p>
        </div>
      </div>
    </div>
  );
}
