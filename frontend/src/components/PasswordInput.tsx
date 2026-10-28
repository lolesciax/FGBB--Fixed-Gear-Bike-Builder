import { useState, type ComponentPropsWithRef } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({
  label,
  ...input
}: ComponentPropsWithRef<"input"> & { label: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="password-control">
      <input
        {...input}
        aria-label={label}
        type={visible ? "text" : "password"}
      />
      <button
        className="icon-button"
        type="button"
        aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </span>
  );
}
