# OmniStock · Sistema Gestor de Inventario para Supermercados y Perecederos (FEFO)

OmniStock es una plataforma moderna para el control de inventario de tiendas y supermercados, diseñada para resolver la gestión de productos perecederos mediante despacho FEFO (*First Expired, First Out*), categorización personalizable por departamento y cobro en cajas registradoras (POS) con bloqueo preventivo de caducidad.

---

## Características Principales

1. **Motor FEFO Automatizado**: Priorización automática del lote con fecha de vencimiento más próxima en cada venta o salida de mercancía.
2. **Bloqueo Preventivo en Caja POS**: Si un producto alcanza o supera su fecha de caducidad, el sistema bloquea inmediatamente la venta en caja y alerta al operador para su canalización a merma.
3. **Departamentos y Categorías Dinámicas**: Creación, edición y personalización en tiempo real de departamentos para adaptar el inventario al giro comercial específico de la tienda.
4. **Kardex y Libro Mayor Inmutable**: Registro de entradas, ventas POS y bajas por merma con saldo contable continuo y trazabilidad por lote.
5. **Generador de Etiquetas para Anaquel**: Impresión de etiquetas de precio estándar con código de barras EAN-13, código PLU para báscula, número de lote y fecha de vencimiento.
6. **Valuación Financiera y Exportador CSV**: Valuación en tiempo real a costo vs. precio de venta, cálculo de margen proyectado y descarga de reportes oficiales.
7. **Actas de Baja por Merma**: Registro formal categorizado de pérdidas operativas (caducidad vencida, ruptura de empaque, daño por manipulación, etc.).

---

## Stack Tecnológico

- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4.
- **Iconografía**: Lucide React.
- **Validación de Datos**: Zod.
- **Base de Datos**: PostgreSQL (Esquema DDL relacional con índices B-Tree y FEFO).
- **Diseño**: Basado en especificaciones de `DESIGN.md` (Paleta: `#F4F6F9`, `#0F172A`, `#008767`, esquinas `rounded-2xl`, soporte completo para Modo Oscuro).

---

## Instalación y Ejecución Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/TonyBrTs/omnistock.git
   cd omnistock
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## Estructura del Proyecto

```text
omnistock/
├── GEMINI.md                                  # Reglas de negocio y arquitectura
├── DESIGN.md                                  # Tokens y sistema de diseño visual
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── audit/report/route.ts          # Valuación y exportador CSV
│   │   │   ├── batches/route.ts               # Recepción de lotes FEFO
│   │   │   ├── categories/route.ts            # Gestión de departamentos dinámicos
│   │   │   ├── movements/route.ts             # Kardex de movimientos
│   │   │   ├── pos/sale/route.ts              # Ventas POS y bloqueo de caducos
│   │   │   ├── products/route.ts              # Catálogo maestro de productos
│   │   │   ├── products/[id]/route.ts         # Edición y eliminación de productos
│   │   │   └── shrinkage/route.ts             # Registro formal de mermas
│   │   ├── layout.tsx
│   │   └── page.tsx                           # Panel principal de control
│   ├── components/
│   │   ├── AppLayout.tsx                      # Barra lateral y cabecera
│   │   ├── AuditReportModal.tsx               # Modal de valuación financiera
│   │   ├── CreateProductModal.tsx             # Alta de artículos con categorías dinámicas
│   │   ├── DeleteProductModal.tsx             # Confirmación de baja de producto
│   │   ├── EditProductModal.tsx               # Edición de producto
│   │   ├── KardexAuditModal.tsx               # Modal de auditoría de movimientos
│   │   ├── ManageCategoriesModal.tsx          # Gestión y personalización de categorías
│   │   ├── MetricCards.tsx                    # Tarjetas de indicadores clave
│   │   ├── POSSimulatorModal.tsx              # Simulador de cobro en caja POS
│   │   ├── PriceTagGeneratorModal.tsx         # Generador de etiquetas para anaquel
│   │   ├── ReceiveBatchModal.tsx              # Recepción de mercancía de proveedor
│   │   ├── ShrinkageFormModal.tsx             # Registro de merma
│   │   └── SupermarketInventoryTable.tsx      # Tabla de inventario FEFO con filtros dinámicos
│   ├── database/migrations/
│   │   └── 001_initial_supermarket_schema.sql # Script SQL para PostgreSQL
│   ├── lib/
│   │   ├── repositories/                      # Lógica de dominio y motor FEFO
│   │   └── validators/                        # Esquemas de validación Zod
│   └── types/                                 # Definiciones TypeScript
└── package.json
```

---

## Autor

- TonyBrTs (`brts2461@gmail.com`)
