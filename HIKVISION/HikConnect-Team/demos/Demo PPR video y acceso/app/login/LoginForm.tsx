"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Error de autenticación");
      return;
    }
    router.replace(searchParams.get("next") ?? "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="username">Usuario</label>
      <input
        id="username"
        className="input"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        required
      />
      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        className="input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />
      {error && <div className="alert error">{error}</div>}
      <div style={{ marginTop: 20 }}>
        <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </div>
      <p className="mono" style={{ marginTop: 16 }}>
        Demo: admin / admin (operador) · visor / visor (solo lectura)
      </p>
    </form>
  );
}
