"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

type UserProfile = {
  nombre: string;
  rol: "ADMIN" | "OPERADOR" | "CONTRATISTA";
  iniciales: string;
  color: string;
};

const profiles: Record<string, UserProfile> = {
  admin: { nombre: "Admin Principal", rol: "ADMIN", iniciales: "A", color: "linear-gradient(135deg, #ef4444, #dc2626)" },
  operador: { nombre: "Pedro Rojas", rol: "OPERADOR", iniciales: "P", color: "linear-gradient(135deg, #22c55e, #16a34a)" },
  contratista: { nombre: "Constructora Andes SpA", rol: "CONTRATISTA", iniciales: "C", color: "linear-gradient(135deg, #a855f7, #7c3aed)" },
};

const rolLabels: Record<string, string> = {
  ADMIN: "Moderador / Admin",
  OPERADOR: "Operador",
  CONTRATISTA: "Contratista",
};

const rolColors: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: "rgba(239,68,68,0.15)", text: "#f87171" },
  OPERADOR: { bg: "rgba(34,197,94,0.15)", text: "#4ade80" },
  CONTRATISTA: { bg: "rgba(168,85,247,0.15)", text: "#c084fc" },
};

export default function Navbar() {
  const pathname = usePathname();

  let profile: UserProfile;
  if (pathname.startsWith("/admin")) {
    profile = profiles.admin;
  } else if (pathname.startsWith("/operador")) {
    profile = profiles.operador;
  } else {
    profile = profiles.contratista;
  }

  const rolStyle = rolColors[profile.rol];

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.6rem 2rem',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 900,
    }}>
      {/* Left: Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link href="/" style={{ textDecoration: 'none', fontSize: '1.1rem', fontWeight: 700, background: 'linear-gradient(to right, #f8fafc, #f59e0b)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          MaqConnect
        </Link>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <Link href="/" style={{
            textDecoration: 'none',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 500,
            color: !pathname.startsWith("/admin") && !pathname.startsWith("/operador") ? 'var(--primary)' : 'var(--text-muted)',
            background: !pathname.startsWith("/admin") && !pathname.startsWith("/operador") ? 'rgba(245,158,11,0.1)' : 'transparent',
            transition: 'all 0.2s',
          }}>
            Marketplace
          </Link>
          <Link href="/operador" style={{
            textDecoration: 'none',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 500,
            color: pathname.startsWith("/operador") ? 'var(--primary)' : 'var(--text-muted)',
            background: pathname.startsWith("/operador") ? 'rgba(245,158,11,0.1)' : 'transparent',
            transition: 'all 0.2s',
          }}>
            Operador
          </Link>
          <Link href="/admin" style={{
            textDecoration: 'none',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 500,
            color: pathname.startsWith("/admin") ? 'var(--primary)' : 'var(--text-muted)',
            background: pathname.startsWith("/admin") ? 'rgba(245,158,11,0.1)' : 'transparent',
            transition: 'all 0.2s',
          }}>
            Admin
          </Link>
        </div>
      </div>

      {/* Right: User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3 }}>
            {profile.nombre}
          </div>
          <span style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            padding: '1px 8px',
            borderRadius: '10px',
            background: rolStyle.bg,
            color: rolStyle.text,
            letterSpacing: '0.04em',
          }}>
            {rolLabels[profile.rol]}
          </span>
        </div>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: profile.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.85rem',
          color: '#fff',
          flexShrink: 0,
          border: '2px solid rgba(255,255,255,0.15)',
        }}>
          {profile.iniciales}
        </div>
      </div>
    </nav>
  );
}
