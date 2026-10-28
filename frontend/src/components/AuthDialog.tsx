import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, X } from "lucide-react";
import { PasswordInput } from "./PasswordInput";
import { useDialogExit } from "./useDialogExit";
import { api } from "../services/api";
import { errorMessage, useApp, type AuthMode } from "../app/context";
const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string(),
  name: z.string(),
});
type Fields = z.infer<typeof schema>;
export function AuthDialog({
  mode: initialMode,
  close,
}: {
  mode: AuthMode;
  close: () => void;
}) {
  const [mode, setMode] = useState(initialMode),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const dismiss = useDialogExit(dialog, close);
  const { refresh, notify, session } = useApp();
  const {
    register,
    handleSubmit,
    setError: fieldError,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });
  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement as HTMLElement;
    node?.showModal();
    setFocus("email");
    return () => {
      node?.close();
      previous?.focus();
    };
  }, [setFocus]);
  async function submit(values: Fields) {
    setError("");
    setMessage("");
    if (
      mode !== "forgot" &&
      (values.password.length < 12 || values.password.length > 128)
    ) {
      fieldError("password", { message: "Use 12–128 characters." });
      return;
    }
    if (mode === "register" && !values.name.trim()) {
      fieldError("name", { message: "Enter your name." });
      return;
    }
    try {
      if (mode === "forgot") {
        const result = await api<{ message: string }>("/auth/forgot-password", {
          method: "POST",
          body: { email: values.email },
        });
        setMessage(result.message);
        return;
      }
      const result = await api<{ emailSent?: boolean }>(`/auth/${mode}`, {
        method: "POST",
        body:
          mode === "register"
            ? values
            : { email: values.email, password: values.password },
      });
      await refresh();
      notify(
        mode === "register"
          ? result.emailSent === false
            ? "Account created. Resend verification from account settings."
            : "Welcome to TrackLab. Check your email to verify your account."
          : "Welcome back. Your workshop is ready.",
      );
      close();
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <dialog
      className="dialog auth-dialog"
      ref={dialog}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) dismiss();
      }}
    >
      <button
        className="icon-button close-dialog"
        aria-label="Close sign in"
        onClick={dismiss}
      >
        <X size={20} />
      </button>
      <span className="wordmark">TRACKLAB</span>
      <h2>
        {mode === "register"
          ? "Make room for your next ride."
          : mode === "forgot"
            ? "Back to your workshop."
            : "Good to have you back."}
      </h2>
      <p>
        {mode === "register"
          ? session.developmentUnlimited
            ? "Save and edit builds without development usage quotas."
            : `Save up to ${session.policy.builds} builds, edit your bikes, and share verified public builds.`
          : mode === "forgot"
            ? "We’ll send a link to reset your password."
            : "Sign in to pick up where you left off."}
      </p>
      <form onSubmit={handleSubmit(submit)} noValidate>
        {mode === "register" && (
          <label>
            Your name
            <input
              autoComplete="name"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <span className="field-error">{errors.name.message}</span>
            )}
          </label>
        )}
        <label>
          Email address
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <span className="field-error">{errors.email.message}</span>
          )}
        </label>
        {mode !== "forgot" && (
          <label>
            Password
            <PasswordInput
              label="Password"
              aria-describedby="password-help"
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            <span
              id="password-help"
              className={errors.password ? "field-error" : "muted small"}
            >
              {errors.password?.message ||
                "At least 12 characters. Spaces and passphrases welcome."}
            </span>
          </label>
        )}
        {error && (
          <p role="alert" className="error-box">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="notice">
            {message}
          </p>
        )}
        <button className="button primary full" disabled={isSubmitting}>
          {isSubmitting
            ? "One moment…"
            : mode === "register"
              ? "Create your account"
              : mode === "forgot"
                ? "Send recovery link"
                : "Sign in"}
          <ArrowRight size={18} />
        </button>
      </form>
      <div className="auth-links">
        <button
          onClick={() => {
            setMode(mode === "register" ? "login" : "register");
            setError("");
            setMessage("");
          }}
        >
          {mode === "register"
            ? "Already have an account? Sign in"
            : "New to TrackLab? Create an account"}
        </button>
        {mode === "login" && (
          <button onClick={() => setMode("forgot")}>Forgot password?</button>
        )}
      </div>
    </dialog>
  );
}
