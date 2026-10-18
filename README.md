# OmniStock · Sistema Gestor de Inventario para Supermercados y Perecederos (FEFO)

**OmniStock** es una plataforma moderna para el control de inventario de tiendas y supermercados, diseñada para resolver la gestión de productos perecederos mediante despacho **FEFO (*First Expired, First Out*)**, control de cadena de frío por telemetría IoT y cobro en cajas registradoras (POS) con bloqueo automático de caducidad.

---

## 🚀 Características Principales

1. **Motor FEFO Automatizado**: Priorización automática del lote con fecha de vencimiento más próxima en cada venta o resurtido.
2. **Bloqueo Preventivo en Caja POS**: Si un producto alcanza o supera su fecha de caducidad, el sistema bloquea inmediatamente la venta y alerta al cajero para mandarlo a merma.
3. **Kardex y Libro Mayor Inmutable**: Registro de entradas, ventas POS, resurtidos a piso y mermas con saldo contable continuo.
4. **Generador de Cenefas para Góndola**: Impresión de etiquetas de precio estándar (100x50 mm) con código de barras EAN-13, código PLU para báscula, lote y fecha de vencimiento.
5. **Auditoría Financiera y Exportador CSV**: Valuación en tiempo real a costo vs. precio de venta, cálculo de margen proyectado y descarga de reportes oficiales.
6. **Telemetría de Cadena de Frío IoT**: Monitoreo de temperatura y humedad en 4 cámaras de refrigeración y congelación.
7. **Actas de Baja por Merma**: Registro categorizado de pérdidas (vencimiento, ruptura, daño o cadena de frío).

---

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS.
- **Validación de Datos**: Zod.
- **Base de Datos**: PostgreSQL (Esquema DDL relacional con índices B-Tree y FEFO).
- **Diseño**: Basado en especificaciones de `DESIGN.md` (Paleta: `#F4F6F9`, `#0F172A`, `#008767`, esquinas `rounded-2xl`).

---

## 💻 Instalación y Ejecución Local

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

## 📁 Estructura del Proyecto

```text
omnistock/
├── GEMINI.md                                  # Reglas de negocio y arquitectura
├── DESIGN.md                                  # Tokens y sistema de diseño visual
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── audit/report/route.ts          # Valuación y exportador CSV
│   │   │   ├── batches/route.ts               # Recepción de lotes FEFO
│   │   │   ├── cold-chain/route.ts            # Sensores IoT de frío
│   │   │   ├── movements/route.ts             # Kardex de movimientos
│   │   │   ├── pos/sale/route.ts              # Ventas POS y bloqueo de caducos
│   │   │   ├── products/route.ts              # Catálogo maestro de productos
│   │   │   └── shrinkage/route.ts             # Registro formal de mermas
│   │   ├── layout.tsx
│   │   └── page.tsx                           # Panel principal de control
│   ├── components/
│   │   ├── AppLayout.tsx                      # Barra lateral y cabecera
│   │   ├── AuditReportModal.tsx               # Modal de valuación financiera
│   │   ├── ColdChainMonitorModal.tsx          # Modal de telemetría IoT
│   │   ├── KardexAuditModal.tsx               # Modal de auditoría de movimientos
│   │   ├── MetricCards.tsx                    # Tarjetas de indicadores clave
│   │   ├── POSSimulatorModal.tsx              # Simulador de cobro en caja POS
│   │   ├── PriceTagGeneratorModal.tsx         # Generador de cenefas de góndola
│   │   ├── ReceiveBatchModal.tsx              # Recepción de mercancía de proveedor
│   │   ├── ShrinkageFormModal.tsx             # Acta de merma
│   │   └── SupermarketInventoryTable.tsx      # Tabla de inventario FEFO
│   ├── database/migrations/
│   │   └── 001_initial_supermarket_schema.sql # Script SQL para PostgreSQL
│   ├── lib/
│   │   ├── repositories/                      # Lógica de dominio y motor FEFO
│   │   └── validators/                        # Esquemas de validación Zod
│   └── types/                                 # Definiciones TypeScript
└── package.json
```

---

## 👤 Autor

- **Usuario**: TonyBrTs (`brts2461@gmail.com`)
