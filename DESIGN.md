# DESIGN.md - Sistema de Diseño: OmniStock / MorphCore (Basado en Referencia Dribbble)

## 1. Overview & Aesthetic
- **Estilo Visual**: SaaS Dashboard limpio, corporativo y minimalista de alta legibilidad.
- **Densidade**: Media-alta (optimizada para visualización densa de datos en tablas e inventarios).
- **Modo**: Light Mode dominante con superficies flotantes y contraste suave.

## 2. Color Palette
- **Background App**: `#F4F6F9` (Gris claro de fondo general)
- **Surface / Card**: `#FFFFFF` (Blanco puro para tarjetas y contenedores de datos)
- **Surface Sidebar (Dark Variant)**: `#0F172A` o `#1E293B` (Azul pizarra oscuro para barra lateral institucional)
- **Primary / Accent**: `#008767` / `#0D5C75` (Verde esmeralda institucional o Azul profundo para acciones principales)
- **Text Primary**: `#0F172A` (Slate 900 para títulos y datos principales)
- **Text Secondary**: `#64748B` (Slate 500 para etiquetas, subtítulos y metadatos)
- **Hairline Borders**: `#E2E8F0` (Slate 200 para separadores y bordes de tarjetas)
- **Badges / Estados**:
  - *Good / Activo*: Fondo `#DCFCE7`, Texto `#166534` (Verde)
  - *Low Stock / Advertencia*: Fondo `#FEF9C3`, Texto `#854D0E` (Amarillo)
  - *Expired / Peligro*: Fondo `#FEE2E2`, Texto `#991B1B` (Rojo)

## 3. Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Hierarquía**:
  - *Page Title*: `text-xl font-bold tracking-tight text-slate-900`
  - *Card Metric*: `text-2xl font-extrabold text-slate-900`
  - *Table Headers*: `text-xs font-semibold uppercase tracking-wider text-slate-500`
  - *Body / Rows*: `text-sm font-medium text-slate-700`

## 4. Layout & Spacing
- **Container Max-Width**: Fluid con un padding interno de `p-6` a `p-8`.
- **Sidebar**: Ancho fijo de `w-64`, diseño vertical con iconos a la izquierda y subtítulos agrupados (BI, ERP, CRM).
- **Cards de Métricas**: Grid de 4 columnas (`grid-cols-1 md:grid-cols-4 gap-4`), esquinas redondeadas de `rounded-2xl`, padding interno `p-5`.
- **Tablas**: Estructura limpia con filas espaciadas (`py-4 px-6`), bordes sutiles y menú contextual flotante en la última columna.

## 5. Elevation & Shapes
- **Border Radius**: 
  - Contenedores principales y tarjetas: `rounded-2xl` (16px)
  - Botones y inputs: `rounded-xl` (12px)
  - Badges de estado: `rounded-full`
- **Shadows**: Sutiles sombras de elevación (`shadow-sm` o `shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]`).