@AGENTS.md

# CLAUDE.md — Instrucciones para Claude Code

Este archivo se carga automáticamente cuando trabajás en este repo con Claude Code. Contiene las convenciones del proyecto y los comandos clave.

## Contexto del proyecto

**Mango** — billetera virtual familiar para Argentina (tagline: "La plata de tu familia"). Movimientos, ahorros e inversiones en ARS + USD con cotización configurable, estética Ualá vibe (dark-first, violeta `#7B3FF2`). Ver `PROJECT_SPEC.md` para el detalle completo del producto y `schema.sql` para el modelo de datos.

Stack: **Next.js 16** (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Neon Postgres · Drizzle ORM · Neon Auth (Stack) · Recharts · Vercel.

> ⚠️ Next.js 16 tiene breaking changes respecto de versiones anteriores. Ver `AGENTS.md` y consultar `node_modules/next/dist/docs/` antes de tocar APIs de Next.

## Paso 0 — Bootstrap del proyecto (solo la primera vez)

Cuando arrancás desde cero, ejecutar en este orden:

```bash
# 1. Crear app Next.js con TypeScript, Tailwind, App Router y src/
npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint --no-import-alias --turbopack --use-npm

# 2. Drizzle + Neon
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit dotenv tsx

# 3. Neon Auth (Stack)
npx @stackframe/init-stack@latest

# 4. shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input label card dialog dropdown-menu \
  select textarea table tabs badge avatar separator sheet sonner \
  form calendar popover command

# 5. Utilidades
npm install recharts date-fns react-hook-form @hookform/resolvers zod \
  @paralleldrive/cuid2 lucide-react clsx tailwind-merge class-variance-authority
```

Después:

1. Pegar las variables de entorno en `.env.local` (las da Neon en el dashboard).
2. Aplicar `schema.sql` corriendo en Neon SQL Editor (más fácil) o con `psql $DATABASE_URL -f schema.sql`.
3. Generar el schema de Drizzle desde la base con `npx drizzle-kit pull` (o escribirlo a mano en `src/lib/db/schema.ts` siguiendo `schema.sql`).

## Convenciones de código

### Idioma

* UI en español rioplatense ("vos", "querés"). Mensajes de error y placeholders también.
* Código en inglés (nombres de variables, funciones, comentarios). No mezclar.
* Comentarios sólo donde el "por qué" no es obvio, no narrar el "qué".

### TypeScript

* `strict: true` activado. Nada de `any` salvo comentado con `// eslint-disable` y justificación.
* Tipos de DB vienen de Drizzle (`InferSelectModel`, `InferInsertModel`). No duplicar tipos a mano.
* Schemas de validación con zod en `src/lib/schemas/`. Reutilizar entre forms y API routes.

### Estructura de carpetas (dentro de `src/`)

```
app/
  (auth)/login, signup, invite/[token]
  (app)/dashboard, movimientos, inversiones, objetivos, reportes, config
  api/
components/
  ui/        ← shadcn (no editar manualmente, usar CLI)
  forms/
  charts/
  shared/
lib/
  db/
    client.ts
    schema.ts
    queries/
  auth/
  schemas/   ← zod
  utils/
    format.ts  ← formatARS, formatUSD, formatDate
    usd.ts     ← arsToUsd, usdToArs
    money.ts   ← suma/resta segura con numeric strings
  constants/
```

### Money — REGLA CRÍTICA

* Nunca usar `number` para montos en lógica de negocio. Postgres devuelve `numeric` como `string`. Mantener `string` y operar con una lib o con `BigInt` × 100 (centavos).
* Si se usa `number` para mostrar/chartear, convertir al final, nunca al medio del cálculo.
* Helper `formatARS(value)` → `$ 1.234.567,89`
* Helper `formatUSD(value)` → `US$ 1,234.56`
* `formatDate(date)` → `DD/MM/YYYY` siempre, salvo el dashboard que puede usar formato relativo ("hace 3 días").

### Doble moneda

* Toda fila de `movements` e `investments` ya tiene `amount_ars`, `amount_usd` y `usd_rate_used` persistidos. Los reportes históricos usan esos valores tal cual; no recalcular con la cotización actual.
* Para nuevos registros: el usuario carga UN monto + UNA moneda, y la app calcula el otro usando la cotización actual de la entidad. Guardar los tres campos.

### Server Components y queries

* Componentes son Server Components por default. Solo `'use client'` cuando hay interactividad.
* Queries en `src/lib/db/queries/<tabla>.ts`. Nunca queries inline en componentes.
* Toda query de datos del usuario DEBE filtrar por `entity_id`. Verificar pertenencia del user a la entity antes de cualquier mutación.

### Auth y autorización

* Helper `requireUser()` en `src/lib/auth/index.ts` que devuelve el user de Stack o redirige a `/login`.
* Helper `requireEntityMembership(entityId, minRole)` que valida que el user tenga al menos ese rol en la entity. Roles: `viewer < member < admin < owner`.
* Mutaciones siempre detrás de Server Actions o API routes con validación zod.

### Forms

* React Hook Form + zod resolver.
* Botón de submit debe deshabilitarse durante `isSubmitting` y mostrar spinner.
* Errores de servidor se muestran como toast (Sonner) Y arriba del form.

### Estilos

* Tailwind v4 con tokens de shadcn. Tema oscuro vía `class` en `<html>`.
* Mobile-first: empezar siempre por mobile y agregar `md:` / `lg:` para arriba.
* Espaciados consistentes: `gap-2`, `gap-4`, `gap-6`. Evitar valores arbitrarios `[27px]`.

## Comandos frecuentes

```bash
npm run dev                       # local en http://localhost:3000
npx drizzle-kit generate          # generar migration desde schema.ts
npx drizzle-kit migrate           # aplicar migrations
npx drizzle-kit studio            # GUI para ver la DB
npx shadcn@latest add <componente>
```

## Cómo pedir features (workflow recomendado)

Cuando me pidas implementar algo, voy a:

1. Confirmar entendimiento en 2-3 líneas (qué entendí que hay que hacer).
2. Listar los archivos que voy a crear/modificar.
3. Implementar en commits chicos y atómicos.
4. Probar que compila (`npm run build`) y correr lint.
5. Dejar un resumen al final con qué quedó hecho y qué probar manualmente.

Si una feature toca muchas cosas, sugerir dividirla en partes antes de empezar.

## Errores comunes a evitar

* ❌ Hardcodear el `entity_id` o asumir que hay uno solo
* ❌ Usar `parseFloat` sobre montos de la DB (perdés precisión)
* ❌ Calcular totales en JS sumando `Number(...)` — usar SQL `SUM()` siempre que se pueda
* ❌ Renderizar fechas con `toLocaleDateString()` sin pasar `'es-AR'`
* ❌ Olvidar el filtro `deleted_at IS NULL` en queries de listado
* ❌ Llamar a `dolarapi.com` desde el cliente (CORS) — usar API route como proxy
* ❌ `'use client'` en un componente que no lo necesita (rompe streaming y aumenta bundle)
