-- =============================================================================
-- MaqConnect — Supabase schema
-- =============================================================================
-- Cómo usar:
--   1. Abre tu proyecto en https://supabase.com/dashboard
--   2. En el sidebar: SQL Editor → New query
--   3. Pega este archivo completo y presiona "Run"
--   4. Luego corre `npm run supabase:seed` para poblar la base con los datos demo
-- =============================================================================

-- Limpieza (ejecuta el script varias veces sin errores)
DROP TABLE IF EXISTS operator_availability CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================================================
-- users — cuentas de la plataforma (ADMIN, OPERADOR, CONTRATISTA)
-- =============================================================================
CREATE TABLE users (
  id               TEXT PRIMARY KEY,
  nombre           TEXT NOT NULL,
  email            TEXT UNIQUE NOT NULL,
  telefono         TEXT,
  rol              TEXT NOT NULL CHECK (rol IN ('ADMIN', 'OPERADOR', 'CONTRATISTA')),
  estado           TEXT NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'SUSPENDIDO')),
  fecha_registro   TEXT NOT NULL,
  clase_licencia   TEXT,
  posee_maquinaria BOOLEAN,
  empresa          TEXT,
  password_hash    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX users_rol_idx ON users (rol);
CREATE INDEX users_estado_idx ON users (estado);

-- =============================================================================
-- listings — publicaciones de maquinaria / operadores en la plataforma
-- Los objetos `usuario` y `maquinaria` se guardan como JSONB para
-- coincidir 1:1 con la estructura que consume el frontend.
-- =============================================================================
CREATE TABLE listings (
  id                  TEXT PRIMARY KEY,
  tipo_servicio       TEXT NOT NULL CHECK (tipo_servicio IN (
                        'ARRIENDO_CON_OPERADOR',
                        'SOLO_ARRIENDO_MAQUINA',
                        'SOLO_SERVICIO_OPERADOR'
                      )),
  precio_referencial  NUMERIC NOT NULL,
  region_disponible   TEXT NOT NULL,
  ciudad_disponible   TEXT NOT NULL,
  usuario             JSONB NOT NULL,
  maquinaria          JSONB,
  estado              TEXT NOT NULL DEFAULT 'ACTIVO',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX listings_region_idx   ON listings (region_disponible);
CREATE INDEX listings_servicio_idx ON listings (tipo_servicio);
CREATE INDEX listings_precio_idx   ON listings (precio_referencial);

-- =============================================================================
-- messages — mensajes administrativos entre usuarios
-- =============================================================================
CREATE TABLE messages (
  id              TEXT PRIMARY KEY,
  remitente_id    TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  destinatario_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  asunto          TEXT NOT NULL,
  contenido       TEXT NOT NULL,
  fecha           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  leido           BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX messages_destinatario_idx ON messages (destinatario_id);
CREATE INDEX messages_leido_idx        ON messages (leido);

-- =============================================================================
-- operator_availability — calendario de disponibilidad por operador
-- =============================================================================
CREATE TABLE operator_availability (
  operador_id  TEXT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  dias_libres  TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Row Level Security — habilitado con políticas laxas para el demo.
-- AJUSTA ESTO antes de producción.
-- =============================================================================
ALTER TABLE users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_availability ENABLE ROW LEVEL SECURITY;

-- Lectura pública (anon puede leer listings + availability — es el catálogo)
CREATE POLICY "listings_public_read"
  ON listings FOR SELECT
  USING (true);

CREATE POLICY "availability_public_read"
  ON operator_availability FOR SELECT
  USING (true);

-- Para el demo, permitimos lectura de users y messages con anon key.
-- En producción deberías reemplazar por políticas basadas en auth.uid().
CREATE POLICY "users_demo_read"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "messages_demo_read"
  ON messages FOR SELECT
  USING (true);
