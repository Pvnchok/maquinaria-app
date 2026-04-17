import { getListingById, getUsers, getOperatorAvailability, type Listing } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";

function buildServiceLabel(tipoServicio: string): string {
  const labels: Record<string, string> = {
    ARRIENDO_CON_OPERADOR: "Arriendo con operador",
    ARRIENDO_SIN_OPERADOR: "Arriendo sin operador",
    SOLO_SERVICIO_OPERADOR: "Servicio de operador",
  };
  return labels[tipoServicio] ?? tipoServicio.replace(/_/g, " ").toLowerCase();
}

function buildListingDescription(listing: Listing): string {
  const maq = listing.maquinaria;
  const precio = `$${listing.precioReferencial.toLocaleString("es-CL")}`;
  const unidad = listing.tipoServicio === "SOLO_SERVICIO_OPERADOR" ? "hora" : "día";
  const ubicacion = `${listing.ciudadDisponible}, ${listing.regionDisponible}`;
  const servicio = buildServiceLabel(listing.tipoServicio);

  const parts: string[] = [];

  if (maq) {
    parts.push(
      `${maq.tipoMaquinaria} ${maq.marca} ${maq.modelo} (${maq.year}) en condición ${maq.condicion.toLowerCase()} disponible para arriendo en ${ubicacion}.`
    );
    parts.push(`Capacidad: ${maq.tonelajeCapacidad}.`);
  } else {
    parts.push(
      `${listing.usuario.nombre} ofrece servicio de operador en ${ubicacion}.`
    );
    if (listing.usuario.claseLicencia) {
      parts.push(`Licencia ${listing.usuario.claseLicencia}.`);
    }
  }

  parts.push(`${servicio} a ${precio}/${unidad}.`);
  parts.push("Contacta al proveedor en MaqConnect.");

  return parts.join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    return {
      title: "Anuncio no encontrado",
      description: "El anuncio que buscas no existe o fue eliminado de MaqConnect.",
    };
  }

  const titulo = listing.maquinaria
    ? `${listing.maquinaria.tipoMaquinaria} ${listing.maquinaria.marca} ${listing.maquinaria.modelo}`
    : `Operador: ${listing.usuario.nombre}`;

  const ubicacion = `${listing.ciudadDisponible}, ${listing.regionDisponible}`;
  const title = `${titulo} – Arriendo en ${listing.regionDisponible}`;
  const description = buildListingDescription(listing);
  const canonicalUrl = `https://maqconnect.cl/listings/${id}`;

  const keywords = [
    "arriendo maquinaria",
    listing.maquinaria?.tipoMaquinaria,
    listing.maquinaria?.marca,
    listing.ciudadDisponible,
    listing.regionDisponible,
    buildServiceLabel(listing.tipoServicio),
  ].filter(Boolean) as string[];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      locale: "es_CL",
      siteName: "MaqConnect",
      ...(listing.maquinaria?.fotoUrl
        ? { images: [{ url: listing.maquinaria.fotoUrl, alt: titulo, width: 800, height: 400 }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${titulo} – ${ubicacion}`,
      description,
      ...(listing.maquinaria?.fotoUrl
        ? { images: [listing.maquinaria.fotoUrl] }
        : {}),
    },
  };
}

export default async function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  const users = await getUsers();
  const operatorUser = users.find((u) => listing.usuario.nombre.includes(u.nombre));
  const availability = operatorUser ? await getOperatorAvailability(operatorUser.id) : null;

  const titulo = listing.maquinaria
    ? `${listing.maquinaria.tipoMaquinaria} ${listing.maquinaria.marca} ${listing.maquinaria.modelo}`
    : `Operador: ${listing.usuario.nombre}`;

  return (
    <div className="layout">
      <header className="header">
        <h1>{titulo}</h1>
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
              <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <Image
                  src={listing.maquinaria.fotoUrl}
                  alt={`${listing.maquinaria.tipoMaquinaria} ${listing.maquinaria.marca} ${listing.maquinaria.modelo}`}
                  fill
                  priority
                  sizes="(max-width: 800px) 100vw, 800px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
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
                <div style={{ display: 'inline-block', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  ⚡ Disponibilidad Inmediata
                </div>
              </div>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{titulo}</h2>
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

            {/* Availability Calendar for Contractors */}
            {availability && (
              <AvailabilityCalendar
                diasLibres={availability.diasLibres}
                operadorNombre={listing.usuario.nombre}
              />
            )}

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
