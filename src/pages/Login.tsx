import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Route as RouteIcon, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { users } from "../data/users";
import { ROLE_LABELS } from "../utils/roleAccess";

// Helper demo account untuk mempermudah juri mencoba tiap role.
// Data akun TIDAK diubah — hanya dibaca dari src/data/users.ts (locked).
const DEMO_ACCOUNTS = users.map((u) => ({
  email: u.email,
  password: u.password,
  label: ROLE_LABELS[u.role],
}));

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Sudah login lalu membuka /login -> redirect ke /dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const success = login(email, password);
    if (!success) {
      setError("Email atau password salah. Silakan coba lagi.");
      return;
    }

    navigate("/dashboard", { replace: true });
  }

  function fillDemoAccount(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-900">
            <RouteIcon className="h-6 w-6 text-accent-500" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-900">
            MediRoute
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Central Distribution Control System
          </p>
        </div>

        <div className="rounded-xl border border-ink-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-ink-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@mediroute.id"
                className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-ink-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md bg-critical-100 px-3 py-2 text-sm text-critical-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-md bg-brand-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800"
            >
              Login
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-xl border border-ink-200 bg-white p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">
            Demo Accounts
          </p>
          <ul className="space-y-1">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() =>
                    fillDemoAccount(account.email, account.password)
                  }
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs text-ink-700 transition-colors hover:bg-ink-50"
                >
                  <span className="font-medium">{account.label}</span>
                  <span className="text-ink-500">{account.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
