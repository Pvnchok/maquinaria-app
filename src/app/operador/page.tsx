"use client";

import { useState } from "react";
import { mockListings, mockUsers } from "@/lib/data";
import Link from "next/link";

type OperadorSection = "perfil" | "maquinas" | "listings";

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

export default function OperadorDashboard() {
  const [section, setSection] = useState<OperadorSection>("perfil");

  // Simulate logged-in operator (Pedro Rojas - u2)
  const currentOperator = mockUsers.find(u => u.id === "u2")!;
  const operatorListings = mockListings.filter(l => l.usuario.nombre.includes("Pedro Rojas"));

  // Profile
  const [perfil, setPerfil] = useState({
    nombre: currentOperator.nombre,
    email: currentOperator.email,
    telefono: currentOperator.telefono,
    claseLicencia: currentOperator.claseLicencia || "",
  });
  const [perfilGuardado, setPerfilGuardado] = useState(false);

  const savePerfil = () => {
    setPerfilGuardado(true);
    setTimeout(() => setPerfilGuardado(false), 3000);
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

  const saveMaq = () => {
    if (!maqForm.tipoMaquinaria || !maqForm.marca) return;
    if (editingMaqId) {
      setMaquinas(prev => prev.map(m => m.id === editingMaqId ? { ...m, ...maqForm } : m));
    } else {
      setMaquinas(prev => [...prev, { id: `maq-${Date.now()}`, ...maqForm }]);
    }
    setShowMaqModal(false);
  };

  const deleteMaq = (id: string) => {
    setMaquinas(prev => prev.filter(m => m.id !== id));
    setConfirmDeleteMaqId(null);
  };

  const sidebarItems: { key: OperadorSection; label: string; icon: string }[] = [
    { key: "perfil", label: "Mi Perfil", icon: "👤" },
    { key: "maquinas", label: "Mis Máquinas", icon: "🚜" },
    { key: "listings", label: "Mis Listings", icon: "📋" },
  ];

  return (
    <div className="admin-layout">
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
                  <button className="btn-primary" onClick={savePerfil} style={{ padding: '0.75rem 2rem' }}>
                    Guardar Cambios
                  </button>
                  {perfilGuardado && (
                    <span style={{ color: '#22c55e', fontWeight: 500, fontSize: '0.9rem', animation: 'fadeIn 0.3s ease' }}>
                      ✓ Perfil actualizado correctamente
                    </span>
                  )}
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
                          <button className="admin-btn-secondary" onClick={() => deleteMaq(maq.id)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>✓ Sí</button>
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
              <button className="admin-btn-secondary" onClick={() => setShowMaqModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={saveMaq} style={{ padding: '0.6rem 2rem' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
