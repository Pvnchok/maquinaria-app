"use client";

import { useState, useEffect, useCallback } from "react";
import { mockListings, mockUsers, mockOperatorAvailability } from "@/lib/data";
import Link from "next/link";

type OperadorSection = "perfil" | "maquinas" | "listings" | "disponibilidad";

interface MaquinaForm {
  tipoMaquinaria: string;
  marca: string;
  modelo: string;
  year: number;
  condicion: string;
  tonelajeCapacidad: string;
  fotoUrl: string;
}

const emptyMaquina: MaquinaForm = { tipoMaquinaria: "", marca: "", modelo: "", year: 2024, condicion: "BUENA", tonelajeCapacidad: "", fotoUrl: "" };

interface Notification {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function OperadorDashboard() {
  const [section, setSection] = useState<OperadorSection>("perfil");

  // Simulate logged-in operator (Pedro Rojas - u2)
  const currentOperator = mockUsers.find(u => u.id === "u2")!;
  const operatorListings = mockListings.filter(l => l.usuario.nombre.includes("Pedro Rojas"));

  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [savingMaq, setSavingMaq] = useState(false);
  const [deletingMaqId, setDeletingMaqId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // --- NOTIFICATIONS ---
  const addNotification = useCallback((type: "success" | "error", message: string) => {
    const id = `notif-${Date.now()}`;
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Profile
  const [perfil, setPerfil] = useState({
    nombre: currentOperator.nombre,
    email: currentOperator.email,
    telefono: currentOperator.telefono,
    claseLicencia: currentOperator.claseLicencia || "",
  });

  // --- INITIAL DATA LOAD ---
  const loadData = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    try {
      // Data is already loaded from mock imports
      setIsLoading(false);
    } catch {
      setLoadError("Error al cargar los datos del panel. Intente nuevamente.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const savePerfil = async () => {
    if (!perfil.nombre || !perfil.email) {
      addNotification("error", "Nombre y email son campos obligatorios.");
      return;
    }
    setSavingPerfil(true);
    try {
      addNotification("success", "Perfil actualizado correctamente.");
    } catch {
      addNotification("error", "Error al guardar el perfil. Intente nuevamente.");
    } finally {
      setSavingPerfil(false);
    }
  };

  // Machines
  const initialMaquinas = operatorListings
    .filter(l => l.maquinaria)
    .map((l, idx) => ({
      id: `maq-${idx}`,
      ...l.maquinaria!,
    }));
  
  const [maquinas, setMaquinas] = useState(initialMaquinas);
  const [showMaqModal, setShowMaqModal] = useState(false);
  const [editingMaqId, setEditingMaqId] = useState<string | null>(null);
  const [maqForm, setMaqForm] = useState<MaquinaForm>(emptyMaquina);
  const [confirmDeleteMaqId, setConfirmDeleteMaqId] = useState<string | null>(null);

  const openNewMaq = () => {
    setEditingMaqId(null);
    setMaqForm({ ...emptyMaquina });
    setShowMaqModal(true);
  };

  const openEditMaq = (maq: typeof maquinas[0]) => {
    setEditingMaqId(maq.id);
    setMaqForm({
      tipoMaquinaria: maq.tipoMaquinaria,
      marca: maq.marca,
      modelo: maq.modelo,
      year: maq.year,
      condicion: maq.condicion,
      tonelajeCapacidad: maq.tonelajeCapacidad,
      fotoUrl: maq.fotoUrl,
    });
    setShowMaqModal(true);
  };

  const saveMaq = async () => {
    if (!maqForm.tipoMaquinaria || !maqForm.marca) {
      addNotification("error", "Tipo de maquinaria y marca son campos obligatorios.");
      return;
    }
    if (maqForm.marca.length > 100 || maqForm.modelo.length > 100) {
      addNotification("error", "Marca o modelo exceden el largo máximo permitido.");
      return;
    }
    if (maqForm.year < 1900 || maqForm.year > new Date().getFullYear() + 1) {
      addNotification("error", "Año fuera de rango válido.");
      return;
    }
    setSavingMaq(true);
    try {
      if (editingMaqId) {
        setMaquinas(prev => prev.map(m => m.id === editingMaqId ? { ...m, ...maqForm } : m));
        addNotification("success", `Máquina "${maqForm.tipoMaquinaria}" actualizada correctamente.`);
      } else {
        setMaquinas(prev => [...prev, { id: `maq-${Date.now()}`, ...maqForm }]);
        addNotification("success", `Máquina "${maqForm.tipoMaquinaria}" agregada correctamente.`);
      }
      setShowMaqModal(false);
    } catch {
      addNotification("error", "Error al guardar la máquina. Intente nuevamente.");
    } finally {
      setSavingMaq(false);
    }
  };

  const deleteMaq = async (id: string) => {
    setDeletingMaqId(id);
    try {
      const maqName = maquinas.find(m => m.id === id)?.tipoMaquinaria || "M\u00e1quina";
      setMaquinas(prev => prev.filter(m => m.id !== id));
      setConfirmDeleteMaqId(null);
      addNotification("success", `M\u00e1quina "${maqName}" eliminada correctamente.`);
    } catch {
      addNotification("error", "Error al eliminar la m\u00e1quina. Intente nuevamente.");
    } finally {
      setDeletingMaqId(null);
    }
  };

  // --- AVAILABILITY CALENDAR ---
  const operatorAvailability = mockOperatorAvailability.find(a => a.operadorId === currentOperator.id);
  const [diasLibres, setDiasLibres] = useState<Set<string>>(new Set(operatorAvailability?.diasLibres ?? []));
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const toggleDia = (dateStr: string) => {
    setDiasLibres(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });
    addNotification("success", diasLibres.has(dateStr) ? "Día marcado como no disponible." : "Día marcado como disponible.");
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfWeek = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday = 0
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const prevMonth = () => {
    setCalendarMonth(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setCalendarMonth(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const sidebarItems: { key: OperadorSection; label: string; icon: string }[] = [
    { key: "perfil", label: "Mi Perfil", icon: "👤" },
    { key: "disponibilidad", label: "Disponibilidad", icon: "📅" },
    { key: "maquinas", label: "Mis Máquinas", icon: "🚜" },
    { key: "listings", label: "Mis Listings", icon: "📋" },
  ];

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="admin-layout">
        <aside className="admin-sidebar glass-panel" style={{ borderRadius: '16px 0 0 16px' }}>
          <div className="admin-sidebar-header">
            <div className="skeleton skeleton-text" style={{ width: '120px', height: '24px' }} />
            <div className="skeleton skeleton-text" style={{ width: '100px', height: '12px', marginTop: '0.5rem' }} />
          </div>
          <nav className="admin-nav">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton skeleton-text" style={{ height: '40px', borderRadius: '8px' }} />
            ))}
          </nav>
        </aside>
        <main className="admin-main">
          <div className="skeleton skeleton-text" style={{ width: '150px', height: '32px', marginBottom: '1rem' }} />
          <div className="skeleton skeleton-text" style={{ width: '300px', height: '16px', marginBottom: '2rem' }} />
          <div className="skeleton skeleton-card" style={{ height: '300px', borderRadius: '16px' }} />
        </main>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (loadError) {
    return (
      <div className="admin-layout">
        <div className="admin-error-container">
          <div className="admin-error-card glass-panel">
            <div className="admin-error-icon">&#9888;&#65039;</div>
            <h2 className="admin-error-title">Error al cargar el panel</h2>
            <p className="admin-error-message">{loadError}</p>
            <button className="btn-primary" onClick={loadData} style={{ padding: '0.75rem 2rem', width: 'auto' }}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Notifications */}
      <div className="notification-container">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`notification notification-${notif.type}`}
            onClick={() => dismissNotification(notif.id)}
          >
            <span className="notification-icon">{notif.type === "success" ? "\u2713" : "\u2715"}</span>
            <span className="notification-message">{notif.message}</span>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="admin-sidebar glass-panel" style={{ borderRadius: '16px 0 0 16px' }}>
        <div className="admin-sidebar-header">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(to right, #f8fafc, #f59e0b)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem' }}>MaqConnect</h2>
          </Link>
          <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Panel Operador</span>
        </div>
        <nav className="admin-nav">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              className={`admin-nav-btn ${section === item.key ? "active" : ""}`}
              onClick={() => setSection(item.key)}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>P</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{perfil.nombre}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Operador</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* ===== PERFIL ===== */}
        {section === "perfil" && (
          <div>
            <h1 className="admin-page-title">Mi Perfil</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Actualiza tu información personal y de contacto.</p>

            <div className="admin-profile-grid">
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem', flexShrink: 0 }}>
                    {perfil.nombre.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{perfil.nombre}</h2>
                    <span className="admin-role-badge role-operador">OPERADOR</span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Miembro desde {currentOperator.fechaRegistro}</div>
                  </div>
                </div>

                <div className="admin-form">
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Nombre completo</label>
                      <input type="text" value={perfil.nombre} onChange={e => setPerfil(p => ({ ...p, nombre: e.target.value }))} />
                    </div>
                    <div className="admin-form-group">
                      <label>Correo electrónico</label>
                      <input type="email" value={perfil.email} onChange={e => setPerfil(p => ({ ...p, email: e.target.value }))} />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Teléfono</label>
                      <input type="text" value={perfil.telefono} onChange={e => setPerfil(p => ({ ...p, telefono: e.target.value }))} />
                    </div>
                    <div className="admin-form-group">
                      <label>Clase de Licencia</label>
                      <input type="text" value={perfil.claseLicencia} onChange={e => setPerfil(p => ({ ...p, claseLicencia: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn-primary" onClick={savePerfil} disabled={savingPerfil} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    {savingPerfil && <span className="btn-spinner" />}
                    {savingPerfil ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </div>

              {/* Info Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="admin-stat-card glass-panel">
                  <div className="admin-stat-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>🚜</div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-value">{maquinas.length}</span>
                    <span className="admin-stat-label">Máquinas Registradas</span>
                  </div>
                </div>
                <div className="admin-stat-card glass-panel">
                  <div className="admin-stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>📋</div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-value">{operatorListings.length}</span>
                    <span className="admin-stat-label">Listings Activos</span>
                  </div>
                </div>
                <div className="admin-stat-card glass-panel">
                  <div className="admin-stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>⭐</div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-value">ACTIVO</span>
                    <span className="admin-stat-label">Estado de Cuenta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== MÁQUINAS ===== */}
        {section === "maquinas" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Mis Máquinas</h1>
              <button className="btn-primary" onClick={openNewMaq} style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
                + Agregar Máquina
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Gestiona la información de tus máquinas registradas.</p>

            {maquinas.length > 0 ? (
              <div className="operador-maquinas-grid">
                {maquinas.map(maq => (
                  <div key={maq.id} className="glass-panel operador-maquina-card">
                    <div style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '160px', marginBottom: '1rem' }}>
                      {maq.fotoUrl ? (
                        <img src={maq.fotoUrl} alt={maq.tipoMaquinaria} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ color: '#999', fontSize: '3rem' }}>🚜</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{maq.tipoMaquinaria}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      <span><strong style={{ color: '#cbd5e1' }}>Marca:</strong> {maq.marca}</span>
                      <span><strong style={{ color: '#cbd5e1' }}>Modelo:</strong> {maq.modelo}</span>
                      <span><strong style={{ color: '#cbd5e1' }}>Año:</strong> {maq.year}</span>
                      <span><strong style={{ color: '#cbd5e1' }}>Condición:</strong> {maq.condicion}</span>
                      <span><strong style={{ color: '#cbd5e1' }}>Capacidad:</strong> {maq.tonelajeCapacidad}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      <button className="btn-primary" onClick={() => openEditMaq(maq)} style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}>✏️ Editar</button>
                      {confirmDeleteMaqId === maq.id ? (
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="admin-btn-secondary" onClick={() => deleteMaq(maq.id)} disabled={deletingMaqId === maq.id} style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                            {deletingMaqId === maq.id ? <span className="btn-spinner" /> : "✓ Sí"}
                          </button>
                          <button className="admin-btn-secondary" onClick={() => setConfirmDeleteMaqId(null)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>✕</button>
                        </div>
                      ) : (
                        <button className="admin-btn-secondary" onClick={() => setConfirmDeleteMaqId(maq.id)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>🗑️</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚜</div>
                <h3>No tienes máquinas registradas</h3>
                <p style={{ marginTop: '0.5rem' }}>Agrega tu primera máquina para comenzar a publicar servicios.</p>
              </div>
            )}
          </div>
        )}

        {/* ===== DISPONIBILIDAD ===== */}
        {section === "disponibilidad" && (
          <div>
            <h1 className="admin-page-title">Mi Disponibilidad</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Marca los días que estás libre para trabajar. Los contratistas podrán ver tu disponibilidad.</p>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              {/* Calendar header */}
              <div className="cal-header">
                <button className="cal-nav-btn" onClick={prevMonth}>&lsaquo;</button>
                <h2 className="cal-title">{monthNames[calendarMonth.month]} {calendarMonth.year}</h2>
                <button className="cal-nav-btn" onClick={nextMonth}>&rsaquo;</button>
              </div>

              {/* Day labels */}
              <div className="cal-grid">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
                  <div key={d} className="cal-day-label">{d}</div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="cal-grid">
                {Array.from({ length: getFirstDayOfWeek(calendarMonth.year, calendarMonth.month) }).map((_, i) => (
                  <div key={`empty-${i}`} className="cal-day cal-day-empty" />
                ))}
                {Array.from({ length: getDaysInMonth(calendarMonth.year, calendarMonth.month) }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isAvailable = diasLibres.has(dateStr);
                  const today = new Date();
                  const isToday = today.getFullYear() === calendarMonth.year && today.getMonth() === calendarMonth.month && today.getDate() === day;
                  const isPast = new Date(dateStr) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  return (
                    <button
                      key={dateStr}
                      className={`cal-day ${isAvailable ? 'cal-day-available' : 'cal-day-unavailable'} ${isToday ? 'cal-day-today' : ''} ${isPast ? 'cal-day-past' : ''}`}
                      onClick={() => !isPast && toggleDia(dateStr)}
                      disabled={isPast}
                      title={isPast ? 'Día pasado' : isAvailable ? 'Disponible — clic para quitar' : 'No disponible — clic para marcar libre'}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="cal-legend">
                <div className="cal-legend-item">
                  <span className="cal-legend-dot cal-legend-available" />
                  <span>Disponible</span>
                </div>
                <div className="cal-legend-item">
                  <span className="cal-legend-dot cal-legend-unavailable" />
                  <span>No disponible</span>
                </div>
                <div className="cal-legend-item">
                  <span className="cal-legend-dot cal-legend-today" />
                  <span>Hoy</span>
                </div>
              </div>

              {/* Summary */}
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Días libres este mes:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>
                    {Array.from(diasLibres).filter(d => d.startsWith(`${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, '0')}`)).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== MIS LISTINGS ===== */}
        {section === "listings" && (
          <div>
            <h1 className="admin-page-title">Mis Listings</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Tus servicios publicados en la plataforma.</p>

            {operatorListings.length > 0 ? (
              <div className="admin-table-wrapper glass-panel">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Máquina</th>
                      <th>Servicio</th>
                      <th>Precio/Día</th>
                      <th>Ubicación</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operatorListings.map(l => (
                      <tr key={l.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {l.maquinaria?.fotoUrl && (
                              <div style={{ width: 40, height: 40, borderRadius: '8px', overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <img src={l.maquinaria.fotoUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 500 }}>{l.maquinaria?.tipoMaquinaria || "—"}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.maquinaria ? `${l.maquinaria.marca} ${l.maquinaria.modelo}` : "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="admin-role-badge role-operador" style={{ fontSize: '0.65rem' }}>{l.tipoServicio.replace(/_/g, " ")}</span></td>
                        <td style={{ fontWeight: 600 }}>${l.precioReferencial.toLocaleString("es-CL")}</td>
                        <td style={{ fontSize: '0.85rem' }}>{l.ciudadDisponible}, {l.regionDisponible}</td>
                        <td><span className="admin-status-badge status-activo">ACTIVO</span></td>
                        <td>
                          <Link href={`/listings/${l.id}`} className="admin-action-btn edit" title="Ver" style={{ textDecoration: 'none' }}>👁️</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <h3>No tienes listings publicados</h3>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Machine Modal */}
      {showMaqModal && (
        <div className="admin-modal-overlay" onClick={() => setShowMaqModal(false)}>
          <div className="admin-modal glass-panel" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
              {editingMaqId ? "Editar Máquina" : "Nueva Máquina"}
            </h2>
            <div className="admin-form">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Tipo de Maquinaria</label>
                  <select value={maqForm.tipoMaquinaria} onChange={e => setMaqForm(p => ({ ...p, tipoMaquinaria: e.target.value }))}>
                    <option value="">Seleccionar...</option>
                    <option value="Excavadora">Excavadora</option>
                    <option value="Retroexcavadora">Retroexcavadora</option>
                    <option value="Bulldozer">Bulldozer</option>
                    <option value="Cargador Frontal">Cargador Frontal</option>
                    <option value="Camión Tolva">Camión Tolva</option>
                    <option value="Motoniveladora">Motoniveladora</option>
                    <option value="Rodillo Compactador">Rodillo Compactador</option>
                    <option value="Manipulador Telescópico">Manipulador Telescópico</option>
                    <option value="Maquinaria Pesada">Maquinaria Pesada (otra)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Marca</label>
                  <input type="text" value={maqForm.marca} onChange={e => setMaqForm(p => ({ ...p, marca: e.target.value }))} placeholder="Ej: Caterpillar" />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Modelo</label>
                  <input type="text" value={maqForm.modelo} onChange={e => setMaqForm(p => ({ ...p, modelo: e.target.value }))} placeholder="Ej: CAT 320" />
                </div>
                <div className="admin-form-group">
                  <label>Año</label>
                  <input type="number" value={maqForm.year} onChange={e => setMaqForm(p => ({ ...p, year: Number(e.target.value) }))} min={2000} max={2026} />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Condición</label>
                  <select value={maqForm.condicion} onChange={e => setMaqForm(p => ({ ...p, condicion: e.target.value }))}>
                    <option value="NUEVA">Nueva</option>
                    <option value="EXCELENTE">Excelente</option>
                    <option value="BUENA">Buena</option>
                    <option value="REGULAR">Regular</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Capacidad / Tonelaje</label>
                  <input type="text" value={maqForm.tonelajeCapacidad} onChange={e => setMaqForm(p => ({ ...p, tonelajeCapacidad: e.target.value }))} placeholder="Ej: 15 ton" />
                </div>
              </div>
              <div className="admin-form-group">
                <label>URL de Foto</label>
                <input type="text" value={maqForm.fotoUrl} onChange={e => setMaqForm(p => ({ ...p, fotoUrl: e.target.value }))} placeholder="/nombre-imagen.jpg" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="admin-btn-secondary" onClick={() => setShowMaqModal(false)} disabled={savingMaq}>Cancelar</button>
              <button className="btn-primary" onClick={saveMaq} disabled={savingMaq} style={{ padding: '0.6rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {savingMaq && <span className="btn-spinner" />}
                {savingMaq ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
