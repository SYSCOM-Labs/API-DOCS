"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { forgetBrowserKeys } from "@/app/settings/actions";

export function ForgetKeysButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn ghost sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await forgetBrowserKeys();
          router.refresh();
        });
      }}
    >
      {pending ? "…" : "Olvidar claves de este navegador"}
    </button>
  );
}
