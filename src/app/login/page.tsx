"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión.");
        return;
      }

      // Redirect based on user role or callbackUrl
      if (callbackUrl !== "/" && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
        router.push(callbackUrl);
      } else if (data.user.rol === "ADMIN") {
        router.push("/admin");
      } else if (data.user.rol === "OPERADOR") {
        router.push("/operador");
      } else {
        router.push("/");
      }
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div className="glass-panel" style={{ maxWidth: "420px", width: "100%", padding: "2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, background: "linear-gradient(to right, #38bdf8, #f59e0b)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.5rem" }}>
              MaqConnect
            </h1>
          </Link>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Inicia sesión para acceder al panel</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-form">
            <div className="admin-form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.cl"
                required
                autoFocus
              />
            </div>
            <div className="admin-form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "0.75rem 1rem", marginTop: "1rem", color: "#ef4444", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "0.85rem", marginTop: "1.5rem", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
          >
            {loading && <span className="btn-spinner" />}
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div style={{ marginTop: "2rem", padding: "1rem", background: "rgba(56, 189, 248, 0.05)", borderRadius: "8px", border: "1px solid rgba(56, 189, 248, 0.15)" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>Cuentas de demo:</p>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span><strong>Admin:</strong> admin@maqconnect.cl</span>
            <span><strong>Operador:</strong> pedro.rojas@email.cl</span>
            <span><strong>Contraseña:</strong> demo123</span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link href="/" style={{ color: "var(--primary)", fontSize: "0.85rem", textDecoration: "none" }}>
            &larr; Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
