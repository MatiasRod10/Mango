# Mango — Especificación de Producto

> **Mango — La plata de tu familia.**
> App web para llevar las cuentas de la familia argentina: ingresos, gastos, ahorros e inversiones, todo en ARS y USD con cotización configurable.

---

## 1. Objetivo

Permitir que los miembros de una familia (o un solo usuario) carguen ingresos, gastos, ahorros e inversiones, visualicen el balance en pesos y dólares, sigan el progreso de objetivos de ahorro, y vean reportes/gráficos de evolución.

---

## 2. Stack técnico

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Estilos**: Tailwind CSS v4 + shadcn/ui
- **Base de datos**: Neon Postgres (serverless)
- **ORM**: Drizzle ORM
- **Auth**: Neon Auth (Stack Auth) — multi-usuario con email/password y OAuth (Google)
- **Gráficos**: Recharts
- **Deploy**: Vercel
- **Fechas**: date-fns
- **Forms**: react-hook-form + zod

---

## 3. Modelo de datos (resumen)

Una **entidad** (típicamente "Familia García") tiene muchos **miembros**, y cada miembro carga **movimientos** (ingreso/gasto/ahorro/inversión), **objetivos de ahorro**, **inversiones** y opcionalmente **presupuestos** mensuales. El detalle completo del schema está en `schema.sql`.

Conceptos clave:

- **Doble moneda**: cada movimiento e inversión se guarda con `amountARS`, `amountUSD` y el `usdRateUsed` al momento de la carga. Esto permite ver totales históricos correctamente sin recalcular con la cotización actual.
- **Cotización configurable**: la entidad tiene un `usdRate` actual (blue por defecto) que se usa como sugerencia al cargar nuevos movimientos. Se actualiza manualmente o vía API de `dolarapi.com`.
- **Multi-tenant lógico**: todas las queries filtran por `entityId`. Un usuario puede pertenecer a varias entidades (ej. "Familia" y "Empresa") pero arrancamos con una sola por usuario.

---

## 4. Features de la V1 (prioridad)

### 4.1 Auth y onboarding

- Login con email/password y Google (vía Neon Auth)
- Al primer login, crear automáticamente una entidad "Mi Familia" con el usuario como `owner`
- Pantalla para invitar miembros por email (envía link con token de invitación)

### 4.2 Dashboard principal

- Resumen del mes en curso: ingresos, gastos, balance, ahorro, inversiones
- Toggle ARS / USD (toda la app respeta este toggle)
- Cotización del dólar actual (con fecha de actualización y botón para refrescar)
- Gráfico de evolución de los últimos 6 meses (ingresos vs gastos vs ahorro)
- Top 5 categorías de gasto del mes

### 4.3 Movimientos (ingresos/gastos/ahorros/inversiones-cash)

- Formulario rápido de carga (≤ 5 campos visibles, el resto colapsable)
- Lista con filtros: mes, tipo, categoría, miembro, método de pago, prioridad, búsqueda libre
- Edición y eliminación (soft delete)
- Vista de calendario opcional
- Categorías y subcategorías predefinidas + custom por entidad
- Etiquetas (tags) libres
- Recurrencia (único/semanal/mensual/anual) — para V1 solo guardar el campo, generación automática se difiere

### 4.4 Inversiones

- Listado de instrumentos (dólares, plazo fijo, FCI, acciones, CEDEARs, cripto, bonos, inmuebles)
- Para cada uno: fecha de compra, monto invertido (ARS y USD), valor actual (ARS y USD), ganancia/pérdida absoluta y %
- Cotización de compra vs cotización actual (para separar ganancia real de cambio de cotización)
- Tarjeta resumen del portfolio: total invertido, valor actual, profit total en ambas monedas

### 4.5 Reportes

- Evolución mensual (línea): ingresos, gastos, ahorro, patrimonio neto
- Composición de gastos por categoría (donut/pie del mes seleccionado)
- Necesidad vs Deseo vs Inversión familiar (barras apiladas por mes)
- Ratio de ahorro mensual (línea)
- Comparativa últimos 12 meses
- Exportar reportes a CSV

### 4.6 Configuración

- Datos de la entidad
- Miembros y roles (owner/admin/member/viewer)
- Cotización del dólar: tipo (blue/oficial/mep/ccl/manual) y valor actual
- Categorías custom
- Tema claro/oscuro

---

## 5. Features fuera de V1 (backlog)

- Objetivos de ahorro con barra de progreso (lo dejamos para V1.1 — los datos ya se modelan)
- Presupuestos mensuales con alertas
- Generación automática de movimientos recurrentes
- Importación desde CSV de banco
- Notificaciones por email
- App móvil / PWA
- API pública

---

## 6. Convenciones de UX

- **Idioma**: español (Argentina). "Vos" no "tú". Formato de fecha `DD/MM/YYYY`.
- **Formato de números**: separador de miles `.`, decimal `,`. Ejemplo: `$ 1.234.567,89`. Dólares: `US$ 1,234.56`.
- **Vacíos**: nunca mostrar "0" o "—" sin contexto. Mostrar mensajes guía ("Aún no cargaste ingresos este mes").
- **Carga rápida**: la acción "Nuevo movimiento" debe estar a un click desde cualquier pantalla (botón flotante o atajo de teclado `N`).
- **Mobile-first**: toda la app debe ser usable cómodamente desde el celular.
- **Estética**: Ualá vibe — dark-first, accent violeta `#7B3FF2`, cards `rounded-2xl`, hero balance grande con `tabular-nums`, bottom-nav en mobile, FAB para Nuevo movimiento.

---

## 7. Estructura sugerida de carpetas

```
finanzas-familiares/
├── src/
│   ├── app/
│   │   ├── (auth)/login, signup, invite/[token]
│   │   ├── (app)/dashboard, movimientos, inversiones, objetivos, reportes, config
│   │   ├── api/
│   │   │   ├── movements/route.ts
│   │   │   ├── investments/route.ts
│   │   │   ├── usd-rate/route.ts  (proxy a dolarapi)
│   │   │   └── ...
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/  (shadcn)
│   │   ├── forms/
│   │   ├── charts/
│   │   └── shared/
│   └── lib/
│       ├── db/
│       │   ├── client.ts   (drizzle + neon)
│       │   ├── schema.ts   (drizzle schema)
│       │   └── queries/    (queries reutilizables)
│       ├── auth/
│       ├── utils/
│       │   ├── format.ts   (formatARS, formatUSD, formatDate)
│       │   └── usd.ts      (conversiones ARS<->USD)
│       └── constants/
└── drizzle/  (migrations generadas)
```

---

## 8. Variables de entorno

```
# Neon
DATABASE_URL=postgresql://...neon.tech/...?sslmode=require

# Neon Auth (Stack)
NEXT_PUBLIC_STACK_PROJECT_ID=
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=
STACK_SECRET_SERVER_KEY=

# Opcional para producción
NEXT_PUBLIC_APP_URL=https://finanzas.misitio.com
```

---

## 9. Cómo trabajar con Claude Code en este proyecto

1. Iniciar el proyecto desde cero ejecutando los comandos del Paso 0 de `CLAUDE.md`.
2. Aplicar el schema de `schema.sql` a la base de Neon.
3. Pedirle a Claude Code que vaya feature por feature siguiendo el orden de la sección 4.
4. Después de cada feature: probar localmente con `npm run dev`, commit y push.

---

## 10. Roadmap sugerido

| Sprint | Entregable |
|--------|------------|
| 1 | Setup, schema, auth funcionando, layout y navegación |
| 2 | Movimientos: CRUD completo + filtros |
| 3 | Dashboard + cotización USD + gráfico evolución |
| 4 | Inversiones: CRUD + portfolio resumen |
| 5 | Reportes y exportación |
| 6 | Configuración, miembros, invitaciones |
| 7 | Pulido, mobile, deploy a Vercel |
