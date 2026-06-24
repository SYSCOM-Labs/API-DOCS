interface FormAlertProps {
  message: string;
  variant?: "error" | "info";
}

export function FormAlert({ message, variant = "error" }: FormAlertProps) {
  if (!message) return null;
  const cls =
    variant === "error"
      ? "rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
      : "rounded-xl bg-neutral-50 px-4 py-3 text-sm text-ink-secondary";
  return <p className={cls}>{message}</p>;
}
