This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Base de datos: Supabase (opcional)

El proyecto puede usar [Supabase](https://supabase.com) como base de datos real. Si no configuras Supabase, la app sigue funcionando con los datos mock en `src/lib/data.ts` (todas las capas hacen fallback automáticamente).

### 1. Crear un proyecto Supabase gratis

1. Ve a https://supabase.com/dashboard → **Sign in with GitHub**.
2. Click **New project**:
   - **Name**: `maquinaria-app`
   - **Region**: South America (São Paulo) — la más cercana a Chile
   - **Database password**: genera una y guárdala (Supabase la necesita internamente; no la usarás desde la app)
3. Espera ~1 min a que se provisione.

### 2. Copiar credenciales

En el dashboard del proyecto → **Settings → API** copia:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (es segura para exponer en el cliente)
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (**secreta**, solo server-side / seed)

### 3. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
JWT_SECRET=una-string-larga-y-aleatoria
```

> ⚠️ Nunca commitees `.env.local`. La `service_role` key tiene permisos totales sobre la DB.

### 4. Crear el schema

En el dashboard Supabase → **SQL Editor** → **New query**, pega y ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql). Esto crea las tablas `users`, `listings`, `messages` y `operator_availability` con policies RLS laxas para demo.

### 5. Cargar los datos mock en Supabase

Con `.env.local` ya configurado, desde la raíz del repo:

```bash
npm run supabase:seed
```

Esto limpia las tablas e inserta los usuarios, listings, mensajes y disponibilidades de `src/lib/data.ts` en tu proyecto Supabase. Es idempotente — puedes correrlo múltiples veces.

### 6. Levantar la app

```bash
npm run dev
```

Abre http://localhost:3000. Si configuraste Supabase, la app lee de la DB real; si no, usa los mocks automáticamente. Puedes verificar en el panel Supabase (**Table editor**) que las filas existen.

### Cómo se usa en el código

- `src/lib/supabase/client.ts` — cliente para Client Components (browser)
- `src/lib/supabase/server.ts` — cliente para Server Components / API routes (con cookies)
- `src/lib/supabase/admin.ts` — cliente admin (service_role) para seed scripts
- `src/lib/db.ts` — capa de acceso unificada con fallback a mocks (`getListings`, `getUsers`, `getMessages`, `getOperatorAvailability`, etc.)
- `src/app/api/db/*` — endpoints REST para consumo desde Client Components

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
