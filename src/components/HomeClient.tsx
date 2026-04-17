"use client";

import { useState } from "react";
import type { Listing } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

interface HomeClientProps {
  listings: Listing[];
}

export default function HomeClient({ listings }: HomeClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterServicio, setFilterServicio] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [maxPrecio, setMaxPrecio] = useState("1000000");
  const [minYear, setMinYear] = useState("2010");
  const [filterCondicion, setFilterCondicion] = useState("");
  const [filterLicencia, setFilterLicencia] = useState("");
  const [filterFuncion, setFilterFuncion] = useState("");

  const categoriasUnicas = Array.from(new Set(listings.map(l => l.maquinaria?.tipoMaquinaria).filter(Boolean))) as string[];

  const getFuncion = (tipo: string | undefined) => {
    if (!tipo) return "Otro";
    const tr = tipo.toLowerCase();
    if (tr.includes("bulldozer")) return "Empuje y Arrastre";
    if (tr.includes("excavadora") || tr.includes("retroexcavadora")) return "Excavación";
    if (tr.includes("cargador") || tr.includes("pala")) return "Carga";
    if (tr.includes("tolva") || tr.includes("camión")) return "Transporte y Descarga";
    if (tr.includes("motoniveladora") || tr.includes("rodillo")) return "Aplanado y Nivelación";
    if (tr.includes("manipulador")) return "Izaje y Carga";
    return "Uso General";
  };

  const funcionesUnicas = Array.from(new Set(listings.map(l => getFuncion(l.maquinaria?.tipoMaquinaria)).filter(Boolean))) as string[];
  const regionesUnicas = Array.from(new Set(listings.map(l => l.regionDisponible))) as string[];
  const licenciasUnicas = Array.from(new Set(listings.map(l => l.usuario.claseLicencia).filter(Boolean))) as string[];
  const condicionesUnicas = Array.from(new Set(listings.map(l => l.maquinaria?.condicion).filter(Boolean))) as string[];

  const filteredListings = listings.filter((l) => {
    const textToSearch = [
      l.maquinaria?.tipoMaquinaria,
      l.maquinaria?.marca,
      l.usuario.nombre,
      l.regionDisponible,
      l.ciudadDisponible,
      getFuncion(l.maquinaria?.tipoMaquinaria)
    ].join(" ").toLowerCase();

    const textMatch = textToSearch.includes(searchTerm.toLowerCase());
    const serviceMatch = filterServicio ? l.tipoServicio === filterServicio : true;
    const catMatch = filterCategoria ? l.maquinaria?.tipoMaquinaria === filterCategoria : true;
    const regMatch = filterRegion ? l.regionDisponible === filterRegion : true;
    const precioMatch = maxPrecio ? l.precioReferencial <= Number(maxPrecio) : true;
    const yearMatch = minYear ? (l.maquinaria && l.maquinaria.year >= Number(minYear)) : true;
    const condMatch = filterCondicion ? l.maquinaria?.condicion === filterCondicion : true;
    const licMatch = filterLicencia ? l.usuario.claseLicencia === filterLicencia : true;
    const funcionMatch = filterFuncion ? getFuncion(l.maquinaria?.tipoMaquinaria) === filterFuncion : true;

    return textMatch && serviceMatch && catMatch && regMatch && precioMatch && yearMatch && condMatch && licMatch && funcionMatch;
  });

  return (
    <div className="layout">
      <header className="header">
        <h1>MaqConnect</h1>
        <p>Encuentra y arrienda maquinaria pesada y operadores certificados en todo Chile.</p>
      </header>

      <main className="main-grid">
        <aside className="filters-section glass-panel">
          <h3>Filtros</h3>

          <div className="filter-group">
            <label>Buscar (texto libre)</label>
            <input
              type="text"
              placeholder="Ej. Retroexcavadora, Biobío..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Región</label>
            <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
              <option value="">Todas las regiones</option>
              {regionesUnicas.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Categoría de Máquina</label>
            <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categoriasUnicas.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Función / Tarea</label>
            <select value={filterFuncion} onChange={(e) => setFilterFuncion(e.target.value)}>
              <option value="">Cualquier función</option>
              {funcionesUnicas.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Precio Máximo</span>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${Number(maxPrecio).toLocaleString("es-CL")}</span>
            </label>
            <input
              type="range"
              min="50000"
              max="1000000"
              step="10000"
              value={maxPrecio}
              onChange={(e) => setMaxPrecio(e.target.value)}
              style={{ cursor: 'pointer', padding: 0, height: '6px', background: 'var(--border)', outline: 'none', borderRadius: '10px', accentColor: 'var(--primary)' }}
            />
          </div>

          <div className="filter-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Año Mínimo</span>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{minYear}</span>
            </label>
            <input
              type="range"
              min="2010"
              max="2026"
              step="1"
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
              style={{ cursor: 'pointer', padding: 0, height: '6px', background: 'var(--border)', outline: 'none', borderRadius: '10px', accentColor: 'var(--primary)' }}
            />
          </div>

          <div className="filter-group">
            <label>Condición</label>
            <select value={filterCondicion} onChange={(e) => setFilterCondicion(e.target.value)}>
              <option value="">Todas</option>
              {condicionesUnicas.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Clase de Licencia (Operadores)</label>
            <select value={filterLicencia} onChange={(e) => setFilterLicencia(e.target.value)}>
              <option value="">Cualquiera</option>
              {licenciasUnicas.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Tipo de Servicio</label>
            <select value={filterServicio} onChange={(e) => setFilterServicio(e.target.value)}>
              <option value="">Todos los servicios</option>
              <option value="SOLO_ARRIENDO_MAQUINA">Arriendo Maquinaria (Solo)</option>
              <option value="ARRIENDO_CON_OPERADOR">Arriendo con Operador</option>
              <option value="SOLO_SERVICIO_OPERADOR">Solo Servicio de Operador</option>
            </select>
          </div>
        </aside>

        <section className="listings-grid">
          {filteredListings.length > 0 ? (
            filteredListings.map((listing) => (
              <Link href={`/listings/${listing.id}`} key={listing.id} className="glass-panel" style={{ textDecoration: 'none', padding: 0, display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease-in-out', overflow: 'hidden' }}>
                {listing.maquinaria && listing.maquinaria.fotoUrl ? (
                  <div style={{ backgroundColor: '#fff', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                    <Image
                      src={listing.maquinaria.fotoUrl}
                      alt={`${listing.maquinaria.tipoMaquinaria} ${listing.maquinaria.marca} ${listing.maquinaria.modelo}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'contain', padding: '1rem' }}
                    />
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.02)', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>👤 Servicio de Operador</span>
                  </div>
                )}

                <div className="listing-content" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.75rem', lineHeight: '1.4', minHeight: '2.8em' }}>
                    {listing.maquinaria
                      ? `${listing.maquinaria.tipoMaquinaria} ${listing.maquinaria.marca} ${listing.maquinaria.modelo}`
                      : `Operador: ${listing.usuario.nombre}`}
                  </h2>

                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                    ${listing.precioReferencial.toLocaleString("es-CL")}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>
                      {listing.tipoServicio === "SOLO_SERVICIO_OPERADOR" ? " / hora" : " / día"}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong style={{ color: '#cbd5e1' }}>Función</strong> {getFuncion(listing.maquinaria?.tipoMaquinaria)}
                    </span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong style={{ color: '#cbd5e1' }}>Servicio</strong> {listing.tipoServicio.replace(/_/g, " ")}
                    </span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong style={{ color: '#cbd5e1' }}>Ubicación</strong> {listing.ciudadDisponible}, {listing.regionDisponible}
                    </span>
                    {listing.maquinaria && (
                      <>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <strong style={{ color: '#cbd5e1' }}>Condición</strong> {listing.maquinaria.condicion} - Año {listing.maquinaria.year}
                        </span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <strong style={{ color: '#cbd5e1' }}>Capacidad</strong> {listing.maquinaria.tonelajeCapacidad}
                        </span>
                      </>
                    )}
                    {listing.usuario.claseLicencia && (
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <strong style={{ color: '#cbd5e1' }}>Licencia</strong> {listing.usuario.claseLicencia}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-state">
              <h2>No se encontraron resultados</h2>
              <p>Intenta ajustar tus filtros de búsqueda.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
