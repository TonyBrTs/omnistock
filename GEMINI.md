# GEMINI.md - Reglas y Arquitectura de OmniStock Supermercado

## 1. Misión del Sistema
OmniStock es un sistema de gestión de inventario y punto de venta (POS/WMS) de alto rendimiento especializado en **Supermercados, Tiendas de Conveniencia y Abarrotes con Control de Perecederos**.

## 2. Reglas de Negocio Clave
- **Motor FEFO Obligatorio**: Todo despacho para venta POS o resurtido a góndola debe consumir primero el lote con fecha de caducidad más próxima (`expiration_date ASC`).
- **Bloqueo Preventivo en Cajas**: Si un lote alcanza su fecha de caducidad (`expiration_date <= TODAY`), el sistema lo bloquea para venta en POS y lo clasifica automáticamente como `EXPIRED` para retiro a merma.
- **Trazabilidad de Empaques y Báscula**: Todo producto cuenta con equivalencia de empaque de compra vs. unidad de venta (ej: 1 Caja = 12 Piezas) y soporte para pesaje mediante códigos PLU de 4 dígitos.

## 3. Identidad Visual y Estilo (`DESIGN.md`)
- **Fondo General**: `#F4F6F9` (Gris claro de baja fatiga visual)
- **Contenedores y Tarjetas**: `#FFFFFF` con esquinas redondeadas `rounded-2xl` y sombra suave `shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]`.
- **Barra Lateral Institucional**: `#0F172A` (Azul pizarra oscuro, w-64 colapsable a w-20).
- **Color de Acento Primario**: `#008767` (Verde esmeralda institucional) y `#0D5C75` (Azul profundo).
- **Semáforo de Lotes**:
  - *Óptimo en Góndola (`GOOD`)*: Fondo `#DCFCE7`, Texto `#166534`
  - *Resurtir / Por Vencer (`LOW_STOCK`)*: Fondo `#FEF9C3`, Texto `#854D0E`
  - *Caducado / Bloqueo POS (`EXPIRED`)*: Fondo `#FEE2E2`, Texto `#991B1B`
