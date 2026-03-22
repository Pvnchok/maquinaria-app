"use client";

import React from 'react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ backgroundColor: '#2f3d51', color: '#fff', paddingTop: '4rem', paddingBottom: '3rem', fontFamily: 'var(--font-geist-sans), sans-serif', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', position: 'relative' }}>
          
          <button 
            onClick={scrollToTop} 
            style={{ position: 'absolute', right: 0, top: '-2rem', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem', transition: 'transform 0.2s' }}
            title="Volver arriba"
          >
            ↑
          </button>

          <div style={{ gridColumn: '1 / span 2', paddingRight: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '1rem', color: '#fb923c', letterSpacing: '-0.5px' }}>
              MAQCONNECT
            </h2>
            <p style={{ lineHeight: '1.6', marginBottom: '2rem', color: '#e2e8f0', fontSize: '0.95rem', maxWidth: '350px' }}>
              Nuestra misión es ayudar a los consumidores a encontrar la maquinaria y el operador perfecto para sus necesidades y presupuesto.
            </p>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', border: '1px solid #64748b', borderRadius: '0.375rem', color: '#fff', textDecoration: 'none', fontSize: '0.9rem', transition: 'background-color 0.2s', fontWeight: 500 }}
               onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
               onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              📷 Instagram
            </a>
          </div>

          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>NAVEGA</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><a href="/" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Maquinaria Pesada</a></li>
              <li><a href="/operador" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Panel Operador</a></li>
              <li><a href="/admin" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Panel Admin</a></li>
              <li><a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Servicios</a></li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>LEGAL</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Términos y condiciones</a></li>
              <li><a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Preguntas frecuentes</a></li>
              <li><a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Política de privacidad</a></li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>CONTACTO</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Formulario web</a></li>
            </ul>
          </div>

        </div>

        <div style={{ marginTop: '5rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <p style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.95rem', marginBottom: '2.5rem' }}>
            MAQCONNECT 2026 | Todos los derechos reservados | Santiago de Chile
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: '#f8fafc', fontWeight: 600, fontSize: '0.95rem' }}>
            <span>Diseñado por Francisco Molina</span>
            <a href="#" style={{ color: '#fff', fontSize: '1.2rem', textDecoration: 'none' }}>📷</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
