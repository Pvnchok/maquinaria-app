"use client";

import { useState, useEffect, useCallback } from "react";
import { type MockUser, type MockMessage, type UserRole, type UserStatus } from "@/lib/data";
import type { Listing } from "@/lib/db";
import Link from "next/link";

type AdminSection = "dashboard" | "usuarios" | "listings" | "mensajes";

interface Notification {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function AdminPanel() {
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [users, setUsers] = useState<MockUser[]>([]);
  const [messages, setMessages] = useState<MockMessage[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);

  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // User filters
  const [searchUser, setSearchUser] = useState("");
  const [filterRol, setFilterRol] = useState<string>("");

  // User modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<MockUser | null>(null);
  const [userForm, setUserForm] = useState<Partial<MockUser>>({});

  // Message modal
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgForm, setMsgForm] = useState({ destinatarioId: "", asunto: "", contenido: "" });

  // Message detail
  const [viewingMsg, setViewingMsg] = useState<MockMessage | null>(null);

  // Delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  // --- INITIAL DATA LOAD ---
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [usersRes, messagesRes, listingsRes] = await Promise.all([
        fetch("/api/db/users", { cache: "no-store" }),
        fetch("/api/db/messages", { cache: "no-store" }),
        fetch("/api/db/listings", { cache: "no-store" }),
      ]);
      if (!usersRes.ok || !messagesRes.ok || !listingsRes.ok) {
        throw new Error("Error al cargar los datos del panel.");
      }
      const [usersJson, messagesJson, listingsJson] = await Promise.all([
        usersRes.json(),
        messagesRes.json(),
        listingsRes.json(),
      ]);
      setUsers(usersJson.users ?? []);
      setMessages(messagesJson.messages ?? []);
      setListings(listingsJson.listings ?? []);
      setIsLoading(false);
    } catch {
      setLoadError("Error al cargar los datos del panel. Intente nuevamente.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- STATS ---
  const totalUsers = users.length;
  const operadoresActivos = users.filter(u => u.rol === "OPERADOR" && u.estado === "ACTIVO").length;
  const contratistasActivos = users.filter(u => u.rol === "CONTRATISTA" && u.estado === "ACTIVO").length;
  const totalListings = listings.length;
  const msgNoLeidos = messages.filter(m => !m.leido).length;

  // --- USER CRUD ---
  const filteredUsers = users.filter(u => {
    const textMatch = [u.nombre, u.email, u.telefono].join(" ").toLowerCase().includes(searchUser.toLowerCase());
    const rolMatch = filterRol ? u.rol === filterRol : true;
    return textMatch && rolMatch;
  });

  const openNewUser = () => {
    setEditingUser(null);
    setUserForm({ nombre: "", email: "", telefono: "", rol: "OPERADOR", estado: "ACTIVO", fechaRegistro: new Date().toISOString().split("T")[0] });
    setShowUserModal(true);
  };

  const openEditUser = (user: MockUser) => {
    setEditingUser(user);
    setUserForm({ ...user });
    setShowUserModal(true);
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const saveUser = async () => {
    if (!userForm.nombre || !userForm.email) {
      addNotification("error", "Nombre y email son campos obligatorios.");
      return;
    }
    if (userForm.nombre.length > 100 || userForm.email.length > 254) {
      addNotification("error", "Nombre o email exceden el largo máximo permitido.");
      return;
    }
    if (!isValidEmail(userForm.email)) {
      addNotification("error", "Formato de email inválido.");
      return;
    }
    if (userForm.telefono && userForm.telefono.length > 20) {
      addNotification("error", "Teléfono excede el largo máximo permitido.");
      return;
    }
    setSavingUser(true);
    try {
      if (editingUser) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...userForm } as MockUser : u));
        addNotification("success", `Usuario "${userForm.nombre}" actualizado correctamente.`);
      } else {
        const newUser: MockUser = {
          id: "u" + (users.length + 1),
          nombre: userForm.nombre || "",
          email: userForm.email || "",
          telefono: userForm.telefono || "",
          rol: (userForm.rol as UserRole) || "OPERADOR",
          estado: (userForm.estado as UserStatus) || "ACTIVO",
          fechaRegistro: userForm.fechaRegistro || new Date().toISOString().split("T")[0],
          claseLicencia: userForm.claseLicencia,
          empresa: userForm.empresa,
        };
        setUsers(prev => [...prev, newUser]);
        addNotification("success", `Usuario "${newUser.nombre}" creado correctamente.`);
      }
      setShowUserModal(false);
    } catch {
      addNotification("error", "Error al guardar el usuario. Intente nuevamente.");
    } finally {
      setSavingUser(false);
    }
  };

  const deleteUser = async (id: string) => {
    setDeletingUserId(id);
    try {
      const userName = users.find(u => u.id === id)?.nombre || "Usuario";
      setUsers(prev => prev.filter(u => u.id !== id));
      setConfirmDeleteId(null);
      addNotification("success", `Usuario "${userName}" eliminado correctamente.`);
    } catch {
      addNotification("error", "Error al eliminar el usuario. Intente nuevamente.");
    } finally {
      setDeletingUserId(null);
    }
  };

  const toggleUserStatus = async (id: string) => {
    setTogglingUserId(id);
    try {
      const user = users.find(u => u.id === id);
      const newStatus = user?.estado === "ACTIVO" ? "SUSPENDIDO" : "ACTIVO";
      setUsers(prev => prev.map(u => u.id === id ? { ...u, estado: newStatus as UserStatus } : u));
      addNotification("success", `Usuario "${user?.nombre}" ${newStatus === "ACTIVO" ? "activado" : "suspendido"}.`);
    } catch {
      addNotification("error", "Error al cambiar el estado del usuario.");
    } finally {
      setTogglingUserId(null);
    }
  };

  // --- MESSAGES ---
  const sendMessage = async () => {
    if (!msgForm.destinatarioId || !msgForm.asunto || !msgForm.contenido) {
      addNotification("error", "Todos los campos del mensaje son obligatorios.");
      return;
    }
    if (msgForm.asunto.length > 200 || msgForm.contenido.length > 5000) {
      addNotification("error", "Asunto o contenido exceden el largo máximo permitido.");
      return;
    }
    setSendingMessage(true);
    try {
      const newMsg: MockMessage = {
        id: "m" + (messages.length + 1),
        remitenteId: "u1",
        destinatarioId: msgForm.destinatarioId,
        asunto: msgForm.asunto,
        contenido: msgForm.contenido,
        fecha: new Date().toISOString(),
        leido: false,
      };
      setMessages(prev => [newMsg, ...prev]);
      setMsgForm({ destinatarioId: "", asunto: "", contenido: "" });
      setShowMsgModal(false);
      addNotification("success", "Mensaje enviado correctamente.");
    } catch {
      addNotification("error", "Error al enviar el mensaje. Intente nuevamente.");
    } finally {
      setSendingMessage(false);
    }
  };

  const getUserName = (id: string) => users.find(u => u.id === id)?.nombre || "Desconocido";

  const sidebarItems: { key: AdminSection; label: string; icon: string }[] = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "usuarios", label: "Usuarios", icon: "👥" },
    { key: "listings", label: "Listings", icon: "🏗️" },
    { key: "mensajes", label: "Mensajes", icon: "✉️" },
  ];

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="admin-layout">
        <aside className="admin-sidebar glass-panel" style={{ borderRadius: '16px 0 0 16px' }}>
          <div className="admin-sidebar-header">
            <div className="skeleton skeleton-text" style={{ width: '120px', height: '24px' }} />
            <div className="skeleton skeleton-text" style={{ width: '80px', height: '12px', marginTop: '0.5rem' }} />
          </div>
          <nav className="admin-nav">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton skeleton-text" style={{ height: '40px', borderRadius: '8px' }} />
            ))}
          </nav>
        </aside>
        <main className="admin-main">
          <div className="skeleton skeleton-text" style={{ width: '200px', height: '32px', marginBottom: '1rem' }} />
          <div className="skeleton skeleton-text" style={{ width: '350px', height: '16px', marginBottom: '2rem' }} />
          <div className="admin-stats-grid">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton skeleton-card" style={{ height: '90px', borderRadius: '16px' }} />
            ))}
          </div>
          <div className="skeleton skeleton-card" style={{ height: '300px', borderRadius: '16px', marginTop: '2rem' }} />
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
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Panel Admin</span>
        </div>
        <nav className="admin-nav">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              className={`admin-nav-btn ${section === item.key ? "active" : ""}`}
              onClick={() => setSection(item.key)}
            >
              <span>{item.icon}</span> {item.label}
              {item.key === "mensajes" && msgNoLeidos > 0 && (
                <span className="admin-badge-count">{msgNoLeidos}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>A</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Admin</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>admin@maqconnect.cl</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* ===== DASHBOARD ===== */}
        {section === "dashboard" && (
          <div>
            <h1 className="admin-page-title">Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Resumen general de la plataforma MaqConnect.</p>
            <div className="admin-stats-grid">
              <div className="admin-stat-card glass-panel">
                <div className="admin-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>👥</div>
                <div className="admin-stat-info">
                  <span className="admin-stat-value">{totalUsers}</span>
                  <span className="admin-stat-label">Usuarios Totales</span>
                </div>
              </div>
              <div className="admin-stat-card glass-panel">
                <div className="admin-stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>🔧</div>
                <div className="admin-stat-info">
                  <span className="admin-stat-value">{operadoresActivos}</span>
                  <span className="admin-stat-label">Operadores Activos</span>
                </div>
              </div>
              <div className="admin-stat-card glass-panel">
                <div className="admin-stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>🏢</div>
                <div className="admin-stat-info">
                  <span className="admin-stat-value">{contratistasActivos}</span>
                  <span className="admin-stat-label">Contratistas Activos</span>
                </div>
              </div>
              <div className="admin-stat-card glass-panel">
                <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>🏗️</div>
                <div className="admin-stat-info">
                  <span className="admin-stat-value">{totalListings}</span>
                  <span className="admin-stat-label">Listings Publicados</span>
                </div>
              </div>
              <div className="admin-stat-card glass-panel">
                <div className="admin-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>✉️</div>
                <div className="admin-stat-info">
                  <span className="admin-stat-value">{msgNoLeidos}</span>
                  <span className="admin-stat-label">Mensajes No Leídos</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Últimos Usuarios Registrados</h3>
              <div className="admin-table-wrapper glass-panel">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(-5).reverse().map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{u.nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td><span className={`admin-role-badge role-${u.rol.toLowerCase()}`}>{u.rol}</span></td>
                        <td><span className={`admin-status-badge status-${u.estado.toLowerCase()}`}>{u.estado}</span></td>
                        <td>{u.fechaRegistro}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== USUARIOS ===== */}
        {section === "usuarios" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Gestión de Usuarios</h1>
              <button className="btn-primary" onClick={openNewUser} style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
                + Nuevo Usuario
              </button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Buscar por nombre, email..."
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                className="admin-search-input"
              />
              <select value={filterRol} onChange={e => setFilterRol(e.target.value)} className="admin-filter-select">
                <option value="">Todos los roles</option>
                <option value="ADMIN">Admin</option>
                <option value="OPERADOR">Operador</option>
                <option value="CONTRATISTA">Contratista</option>
              </select>
            </div>
            <div className="admin-table-wrapper glass-panel">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Contacto</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{u.nombre}</div>
                        {u.empresa && <div style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>{u.empresa}</div>}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{u.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.telefono}</div>
                      </td>
                      <td><span className={`admin-role-badge role-${u.rol.toLowerCase()}`}>{u.rol}</span></td>
                      <td><span className={`admin-status-badge status-${u.estado.toLowerCase()}`}>{u.estado}</span></td>
                      <td style={{ fontSize: '0.85rem' }}>{u.fechaRegistro}</td>
                      <td>
                        <div className="admin-actions">
                          <button className="admin-action-btn edit" onClick={() => openEditUser(u)} title="Editar">✏️</button>
                          <button
                            className="admin-action-btn toggle"
                            onClick={() => toggleUserStatus(u.id)}
                            title={u.estado === "ACTIVO" ? "Suspender" : "Activar"}
                            disabled={togglingUserId === u.id}
                          >
                            {togglingUserId === u.id ? <span className="btn-spinner" /> : (u.estado === "ACTIVO" ? "⏸️" : "▶️")}
                          </button>
                          {confirmDeleteId === u.id ? (
                            <span style={{ display: 'flex', gap: '0.25rem' }}>
                              <button
                                className="admin-action-btn delete"
                                onClick={() => deleteUser(u.id)}
                                title="Confirmar"
                                disabled={deletingUserId === u.id}
                              >
                                {deletingUserId === u.id ? <span className="btn-spinner" /> : "✓"}
                              </button>
                              <button className="admin-action-btn" onClick={() => setConfirmDeleteId(null)} title="Cancelar">✕</button>
                            </span>
                          ) : (
                            <button className="admin-action-btn delete" onClick={() => setConfirmDeleteId(u.id)} title="Eliminar">🗑️</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No se encontraron usuarios.</div>
              )}
            </div>
          </div>
        )}

        {/* ===== LISTINGS ===== */}
        {section === "listings" && (
          <div>
            <h1 className="admin-page-title">Gestión de Listings</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Todos los listings publicados en la plataforma.</p>
            <div className="admin-table-wrapper glass-panel">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Máquina</th>
                    <th>Operador</th>
                    <th>Servicio</th>
                    <th>Precio/Día</th>
                    <th>Ubicación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 500, color: 'var(--primary)' }}>#{l.id}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{l.maquinaria?.tipoMaquinaria || "N/A"}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.maquinaria ? `${l.maquinaria.marca} ${l.maquinaria.modelo}` : "—"}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{l.usuario.nombre}</td>
                      <td><span className="admin-role-badge role-operador" style={{ fontSize: '0.65rem' }}>{l.tipoServicio.replace(/_/g, " ")}</span></td>
                      <td style={{ fontWeight: 600 }}>${l.precioReferencial.toLocaleString("es-CL")}</td>
                      <td style={{ fontSize: '0.8rem' }}>{l.ciudadDisponible}</td>
                      <td>
                        <div className="admin-actions">
                          <Link href={`/listings/${l.id}`} className="admin-action-btn edit" title="Ver detalle" style={{ textDecoration: 'none' }}>👁️</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== MENSAJES ===== */}
        {section === "mensajes" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Mensajes</h1>
              <button className="btn-primary" onClick={() => setShowMsgModal(true)} style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
                + Nuevo Mensaje
              </button>
            </div>
            <div className="admin-messages-list">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`admin-message-card glass-panel ${!msg.leido ? "unread" : ""}`}
                  onClick={() => {
                    setViewingMsg(msg);
                    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, leido: true } : m));
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        {!msg.leido && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />}
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{msg.asunto}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Para: <strong style={{ color: 'var(--text-main)' }}>{getUserName(msg.destinatarioId)}</strong>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(msg.fecha).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    {msg.contenido.substring(0, 120)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ===== MODALS ===== */}

      {/* User Modal */}
      {showUserModal && (
        <div className="admin-modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="admin-modal glass-panel" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
              {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>
            <div className="admin-form">
              <div className="admin-form-group">
                <label>Nombre</label>
                <input type="text" value={userForm.nombre || ""} onChange={e => setUserForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre completo" />
              </div>
              <div className="admin-form-group">
                <label>Email</label>
                <input type="email" value={userForm.email || ""} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} placeholder="correo@email.cl" />
              </div>
              <div className="admin-form-group">
                <label>Teléfono</label>
                <input type="text" value={userForm.telefono || ""} onChange={e => setUserForm(p => ({ ...p, telefono: e.target.value }))} placeholder="+56 9 XXXX XXXX" />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Rol</label>
                  <select value={userForm.rol || "OPERADOR"} onChange={e => setUserForm(p => ({ ...p, rol: e.target.value as UserRole }))}>
                    <option value="ADMIN">Admin</option>
                    <option value="OPERADOR">Operador</option>
                    <option value="CONTRATISTA">Contratista</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Estado</label>
                  <select value={userForm.estado || "ACTIVO"} onChange={e => setUserForm(p => ({ ...p, estado: e.target.value as UserStatus }))}>
                    <option value="ACTIVO">Activo</option>
                    <option value="SUSPENDIDO">Suspendido</option>
                  </select>
                </div>
              </div>
              {userForm.rol === "OPERADOR" && (
                <div className="admin-form-group">
                  <label>Clase de Licencia</label>
                  <input type="text" value={userForm.claseLicencia || ""} onChange={e => setUserForm(p => ({ ...p, claseLicencia: e.target.value }))} placeholder="Clase D" />
                </div>
              )}
              {userForm.rol === "CONTRATISTA" && (
                <div className="admin-form-group">
                  <label>Empresa</label>
                  <input type="text" value={userForm.empresa || ""} onChange={e => setUserForm(p => ({ ...p, empresa: e.target.value }))} placeholder="Nombre de la empresa" />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="admin-btn-secondary" onClick={() => setShowUserModal(false)} disabled={savingUser}>Cancelar</button>
              <button className="btn-primary" onClick={saveUser} disabled={savingUser} style={{ padding: '0.6rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {savingUser && <span className="btn-spinner" />}
                {savingUser ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMsgModal && (
        <div className="admin-modal-overlay" onClick={() => setShowMsgModal(false)}>
          <div className="admin-modal glass-panel" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Nuevo Mensaje</h2>
            <div className="admin-form">
              <div className="admin-form-group">
                <label>Destinatario</label>
                <select value={msgForm.destinatarioId} onChange={e => setMsgForm(p => ({ ...p, destinatarioId: e.target.value }))}>
                  <option value="">Seleccionar destinatario...</option>
                  {users.filter(u => u.rol !== "ADMIN").map(u => (
                    <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Asunto</label>
                <input type="text" value={msgForm.asunto} onChange={e => setMsgForm(p => ({ ...p, asunto: e.target.value }))} placeholder="Asunto del mensaje" />
              </div>
              <div className="admin-form-group">
                <label>Contenido</label>
                <textarea value={msgForm.contenido} onChange={e => setMsgForm(p => ({ ...p, contenido: e.target.value }))} placeholder="Escriba su mensaje..." rows={5} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="admin-btn-secondary" onClick={() => setShowMsgModal(false)} disabled={sendingMessage}>Cancelar</button>
              <button className="btn-primary" onClick={sendMessage} disabled={sendingMessage} style={{ padding: '0.6rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {sendingMessage && <span className="btn-spinner" />}
                {sendingMessage ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Message Detail */}
      {viewingMsg && (
        <div className="admin-modal-overlay" onClick={() => setViewingMsg(null)}>
          <div className="admin-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>{viewingMsg.asunto}</h2>
              <button onClick={() => setViewingMsg(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', gap: '1.5rem' }}>
              <span>Para: <strong style={{ color: 'var(--text-main)' }}>{getUserName(viewingMsg.destinatarioId)}</strong></span>
              <span>{new Date(viewingMsg.fecha).toLocaleString("es-CL")}</span>
            </div>
            <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border)', lineHeight: 1.7, fontSize: '0.9rem' }}>
              {viewingMsg.contenido}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
