import { mockListings } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = mockListings.find((l) => l.id === id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="layout">
      <header className="header">
        <h1>Detalles del Servicio</h1>
        <p>Revisa la información detallada de esta maquinaria o servicio y contacta al proveedor.</p>
        <div style={{ marginTop: '1rem' }}>
          <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
            &larr; Volver a resultados
          </Link>
        </div>
      </header>

      <main className="main-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '800px', margin: '0 auto' }}>
        <article className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {listing.maquinaria && listing.maquinaria.fotoUrl ? (
              <img
                src={listing.maquinaria.fotoUrl}
                alt={listing.maquinaria.tipoMaquinaria}
                style={{ width: '100%', borderRadius: 'var(--radius)', maxHeight: '400px', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                👤 Servicio de Operador
              </div>
            )}

            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-block', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  {listing.tipoServicio.replace(/_/g, " ")}
                </div>
                {/* Asumimos disponibilidad inmediata para todos los listings en este prototipo, o puedes leer 'listing.disponible' si existe en la BD */}
                <div style={{ display: 'inline-block', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  ⚡ Disponibilidad Inmediata
                </div>
              </div>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {listing.maquinaria
                  ? `${listing.maquinaria.tipoMaquinaria} ${listing.maquinaria.marca} ${listing.maquinaria.modelo}`
                  : `Operador: ${listing.usuario.nombre}`}
              </h2>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)', marginBottom: '1rem' }}>
                ${listing.precioReferencial.toLocaleString("es-CL")} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>{listing.tipoServicio === "SOLO_SERVICIO_OPERADOR" ? "/ hora" : "/ día"}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Ubicación</strong>
                <div>{listing.ciudadDisponible}, {listing.regionDisponible}</div>
              </div>
              
              {listing.maquinaria && (
                <>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Año</strong>
                    <div>{listing.maquinaria.year}</div>
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Condición</strong>
                    <div>{listing.maquinaria.condicion}</div>
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Capacidad / Tonelaje</strong>
                    <div>{listing.maquinaria.tonelajeCapacidad}</div>
                  </div>
                </>
              )}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Información del Proveedor / Operador</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div><strong>Nombre:</strong> {listing.usuario.nombre}</div>
                {listing.usuario.claseLicencia && (
                  <div><strong>Licencia:</strong> <span style={{ color: 'var(--primary)' }}>{listing.usuario.claseLicencia}</span></div>
                )}
                <div><strong>Rol:</strong> {listing.usuario.rol}</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a 
                href={`mailto:contacto@proveedor.cl?subject=Consulta%20sobre%20${encodeURIComponent(listing.maquinaria ? `${listing.maquinaria.tipoMaquinaria} ${listing.maquinaria.marca}` : `Operador ${listing.usuario.nombre}`)}`}
                className="btn-primary" 
                style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', textAlign: 'center', textDecoration: 'none', background: '#ea4335', color: '#fff', minWidth: '250px' }}
              >
                ✉️ Enviar Correo (Gmail)
              </a>
              <a 
                href={`https://wa.me/56912345678?text=Hola,%20vengo%20de%20MaqConnect.%20Estoy%20interesado%20en%20el%20anuncio:%20${encodeURIComponent(listing.maquinaria ? `${listing.maquinaria.tipoMaquinaria} - ${listing.maquinaria.modelo}` : `Operador ${listing.usuario.nombre}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary" 
                style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', textAlign: 'center', textDecoration: 'none', background: '#25D366', color: '#fff', minWidth: '250px' }}
              >
                💬 Contactar por WhatsApp
              </a>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
