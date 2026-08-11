import { useEffect, useState } from "react";
import { apiPost } from "../../api/client";
import type { PlatformSnapshot, ProxyDebugInfo } from "../../types";
import {
  isoWithOffset,
  normalizeGroups,
  normalizePersons,
  readHik,
  type GroupItem,
  type PersonItem,
} from "../../lib/normalize";
import { ApiNote } from "../ui/ApiNote";
import { btnPrimary, btnSecondary, btnDestructive, inputClass, selectClass } from "../ui/classes";

interface Props {
  credentialsEnvelope: Record<string, string>;
  sandboxMode: boolean;
  platform: PlatformSnapshot | null;
  onHud: (label: string, debug?: ProxyDebugInfo) => void;
}

export function PersonsTab({ credentialsEnvelope, sandboxMode, platform, onHud }: Props) {
  const [groups, setGroups] = useState<GroupItem[]>(
    (platform?.personGroups ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      personCount: g.personCount,
    }))
  );
  const [persons, setPersons] = useState<PersonItem[]>([]);
  const [groupName, setGroupName] = useState("");
  const [collectSerial, setCollectSerial] = useState(platform?.devices[0]?.serialNo ?? "");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    personCode: "",
    groupId: "",
    gender: 1,
    pinCode: "",
  });
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [msgIsError, setMsgIsError] = useState(false);

  const call = async (label: string, path: string, body: Record<string, unknown>) => {
    setBusy(label);
    setMsg("");
    try {
      const res = await apiPost(path, credentialsEnvelope, { sandboxMode, ...body });
      if (res.debug) onHud(label, res.debug);
      if (res.error) {
        setMsg(`${label}: ${res.error}`);
        setMsgIsError(true);
        return null;
      }
      const { errorCode } = readHik(res);
      if (errorCode !== "0") {
        setMsg(`${label}: la plataforma devolvió errorCode=${errorCode}`);
        setMsgIsError(true);
        return null;
      }
      setMsg(`${label}: OK`);
      setMsgIsError(false);
      return res;
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
      setMsgIsError(true);
      return null;
    } finally {
      setBusy("");
    }
  };

  const refresh = async () => {
    const g = await call("Buscar grupos", "/api/attendance/groups/search", {
      parentGroupId: "",
      groupName: "",
    });
    const { payload: gPayload } = readHik(g);
    setGroups(normalizeGroups(gPayload));

    const p = await call("Listar personas", "/api/attendance/persons/list", {
      pageIndex: 1,
      pageSize: 100,
    });
    const { payload: pPayload } = readHik(p);
    setPersons(normalizePersons(pPayload));
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sandboxMode]);

  // Sin esto el select queda en "Departamento…" y el botón Agregar nunca se habilita.
  useEffect(() => {
    if (!form.groupId && groups[0]) {
      setForm((prev) => ({ ...prev, groupId: groups[0].id }));
    }
  }, [groups, form.groupId]);

  useEffect(() => {
    if (!collectSerial && platform?.devices[0]?.serialNo) {
      setCollectSerial(platform.devices[0].serialNo);
    }
  }, [platform, collectSerial]);

  const missing: string[] = [];
  if (!form.firstName.trim()) missing.push("Nombre");
  if (!form.personCode.trim()) missing.push("N.º empleado");
  if (!form.groupId) missing.push("Departamento");

  const addPerson = async (quick: boolean) => {
    const now = new Date();
    const end = new Date(now);
    end.setFullYear(end.getFullYear() + 10);

    const personInfo = {
      groupId: form.groupId,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      personCode: form.personCode.trim(),
      startDate: isoWithOffset(now),
      endDate: isoWithOffset(end),
    };

    const res = quick
      ? await call("Alta rápida", "/api/attendance/persons/quick-add", {
          personInfo,
          ...(form.pinCode ? { pinCode: form.pinCode } : {}),
        })
      : await call("Agregar persona", "/api/attendance/persons/add", personInfo);

    if (!res) return;

    const { payload } = readHik<{ personId?: string }>(res);
    if (!quick && form.pinCode && payload?.personId) {
      await call("Actualizar PIN", "/api/attendance/persons/pin", {
        personId: payload.personId,
        pinCode: form.pinCode,
      });
    }

    setForm((prev) => ({ ...prev, firstName: "", lastName: "", personCode: "", pinCode: "" }));
    await refresh();
  };

  const collectAndApplyCard = async (personId?: string) => {
    if (!personId || !collectSerial) return;
    const res = await call("Capturar tarjeta", "/api/attendance/persons/card-collect", {
      deviceSerial: collectSerial,
    });
    const { payload } = readHik<{ cardNo?: string }>(res);
    if (!payload?.cardNo) return;
    await call("Aplicar tarjeta", "/api/attendance/persons/update-cards", {
      personId,
      cardList: [{ cardNo: payload.cardNo }],
    });
  };

  const collectAndApplyFinger = async (personId?: string) => {
    if (!personId || !collectSerial) return;
    const res = await call("Capturar huella", "/api/attendance/persons/finger-collect", {
      deviceSerial: collectSerial,
    });
    const { payload } = readHik<{ fingerData?: string }>(res);
    if (!payload?.fingerData) return;
    await call("Aplicar huella", "/api/attendance/persons/update-fingers", {
      personId,
      fingerList: [{ name: "Dedo 1", data: payload.fingerData }],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">Personas y departamentos</h2>
          <p className="mt-1 text-sm text-ink-secondary">
            CRUD + credenciales (rostro, PIN, QR, tarjeta, huella)
          </p>
        </div>
        <button type="button" className={btnSecondary} disabled={!!busy} onClick={() => void refresh()}>
          {busy ? "Trabajando…" : "Refrescar"}
        </button>
      </div>

      {msg && (
        <p className={`text-sm ${msgIsError ? "text-red-600" : "text-ink-secondary"}`}>{msg}</p>
      )}

      <ApiNote tone="tip" title="Credenciales y sincronización con el dispositivo">
        <p>
          Alta de personas, PIN y QR sí van por API. La captura de{" "}
          <strong>tarjeta</strong> y <strong>huella</strong> (
          <span className="endpoint-badge">cardcollect</span> /{" "}
          <span className="endpoint-badge">fingercollect</span>) requiere presentar la credencial
          en el dispositivo físico seleccionado.
        </p>
        <p>
          Tras asignar un nivel de acceso, las actualizaciones de persona/credenciales se
          sincronizan al equipo; sin nivel vinculado a la puerta, el marcaje puede rechazarse
          aunque la persona exista.
        </p>
      </ApiNote>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="content-card space-y-3">
          <h3 className="font-semibold">Nuevo departamento</h3>
          <span className="endpoint-badge">person/v1/groups/add</span>
          <input
            className={inputClass}
            placeholder="Nombre del grupo"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <button
            type="button"
            className={btnPrimary}
            disabled={!!busy || !groupName.trim()}
            onClick={() =>
              void call("Agregar grupo", "/api/attendance/groups/add", {
                groupName: groupName.trim(),
              }).then((res) => {
                if (res) setGroupName("");
                return refresh();
              })
            }
          >
            Crear grupo
          </button>
          <ul className="mt-4 space-y-2 text-sm">
            {groups.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-2">
                <span>
                  {g.name} <span className="text-ink-tertiary">({g.personCount ?? 0})</span>
                </span>
                <button
                  type="button"
                  className={btnDestructive + " !px-3 !py-1 text-xs"}
                  disabled={!!busy}
                  onClick={() =>
                    void call("Eliminar grupo", "/api/attendance/groups/delete", {
                      groupId: g.id,
                    }).then(() => refresh())
                  }
                >
                  Eliminar
                </button>
              </li>
            ))}
            {!groups.length && (
              <li className="text-ink-secondary">
                Sin departamentos. Crea uno para poder dar de alta personas.
              </li>
            )}
          </ul>
        </div>

        <div className="content-card space-y-3">
          <h3 className="font-semibold">Alta de persona</h3>
          <span className="endpoint-badge">persons/add · persons/quick/add</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              className={inputClass}
              placeholder="Nombre"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Apellido"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <input
            className={inputClass}
            placeholder="N.º empleado (personCode)"
            value={form.personCode}
            onChange={(e) => setForm({ ...form, personCode: e.target.value })}
          />
          <select
            className={selectClass}
            value={form.groupId}
            onChange={(e) => setForm({ ...form, groupId: e.target.value })}
          >
            <option value="">Departamento…</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          {!groups.length && (
            <p className="text-[11px] text-amber-600">
              No hay departamentos en la plataforma. Crea uno en «Nuevo departamento» y vuelve a
              refrescar.
            </p>
          )}
          <select
            className={selectClass}
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: Number(e.target.value) })}
          >
            <option value={1}>Masculino</option>
            <option value={2}>Femenino</option>
            <option value={0}>Desconocido</option>
          </select>
          <input
            className={inputClass}
            placeholder="PIN opcional (4–8 dígitos)"
            value={form.pinCode}
            onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnPrimary}
              disabled={!!busy || missing.length > 0}
              onClick={() => void addPerson(false)}
            >
              Agregar
            </button>
            <button
              type="button"
              className={btnSecondary}
              disabled={!!busy || missing.length > 0}
              onClick={() => void addPerson(true)}
            >
              Quick add
            </button>
          </div>
          {missing.length > 0 && (
            <p className="text-[11px] text-amber-700">Falta capturar: {missing.join(", ")}.</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          Dispositivo para capturar tarjeta/huella
          <select
            className={selectClass}
            value={collectSerial}
            onChange={(e) => setCollectSerial(e.target.value)}
          >
            <option value="">Selecciona…</option>
            {(platform?.devices ?? []).map((d) => (
              <option key={d.serialNo || d.id} value={d.serialNo}>
                {d.name} ({d.serialNo})
              </option>
            ))}
          </select>
        </label>
        <p className="text-[11px] text-ink-tertiary">
          La captura requiere presentar la tarjeta o el dedo en el dispositivo físico.
        </p>
      </div>

      <div className="content-card overflow-x-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-black/[0.06] text-xs text-ink-tertiary">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Grupo</th>
              <th className="px-4 py-3">Credenciales</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {persons.map((p) => (
              <tr key={p.personId} className="border-b border-black/[0.04]">
                <td className="px-4 py-2.5">
                  {p.displayName || (
                    <span className="text-ink-tertiary">
                      (sin nombre en la respuesta)
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs">{p.personCode}</td>
                <td className="px-4 py-2.5">
                  {p.groupName ??
                    p.fullPath ??
                    groups.find((g) => g.id === p.groupId)?.name ??
                    "—"}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    <Mini
                      label="PIN"
                      disabled={!!busy}
                      onClick={() =>
                        void call("Actualizar PIN", "/api/attendance/persons/pin", {
                          personId: p.personId,
                          pinCode: form.pinCode || "1234",
                        })
                      }
                    />
                    <Mini
                      label="QR"
                      disabled={!!busy}
                      onClick={() =>
                        void call("QR persona", "/api/attendance/persons/qrcode", {
                          personId: p.personId,
                          clientLocalTime: isoWithOffset(new Date()),
                        })
                      }
                    />
                    <Mini
                      label="Tarjeta"
                      disabled={!!busy || !collectSerial}
                      onClick={() => void collectAndApplyCard(p.personId)}
                    />
                    <Mini
                      label="Huella"
                      disabled={!!busy || !collectSerial}
                      onClick={() => void collectAndApplyFinger(p.personId)}
                    />
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    className="text-xs text-red-600 disabled:opacity-40"
                    disabled={!!busy}
                    onClick={() =>
                      void call("Eliminar persona", "/api/attendance/persons/delete", {
                        personId: p.personId,
                      }).then(() => refresh())
                    }
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {!persons.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-secondary">
                  Sin personas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Mini({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="rounded-full border border-black/[0.08] px-2 py-0.5 text-[11px] hover:bg-black/[0.03] disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
