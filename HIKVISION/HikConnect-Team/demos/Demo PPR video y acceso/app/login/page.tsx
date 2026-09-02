import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>SYSCOM POC</h1>
        <p className="sub">Video y Control de Acceso · Hik-Connect for Teams</p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
