-- ============================================================================
-- OMNISTOCK SUPERMARKET & STORE INVENTORY ENGINE
-- MIGRATION: 001_initial_supermarket_schema.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. DEPARTAMENTOS Y PASILLOS DE LA TIENDA
CREATE TABLE IF NOT EXISTS categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    default_aisle VARCHAR(50),
    requires_cold_chain BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. UBICACIONES FÍSICAS DE LA TIENDA
CREATE TABLE IF NOT EXISTS store_locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    zone_type VARCHAR(30) NOT NULL CHECK (zone_type IN ('SALES_FLOOR', 'COLD_ROOM', 'BACKROOM', 'QUARANTINE_MERMA')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATÁLOGO MAESTRO DE PRODUCTOS
CREATE TABLE IF NOT EXISTS products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) NOT NULL UNIQUE,
    barcode_ean13 VARCHAR(32) UNIQUE,
    plu_code VARCHAR(16) UNIQUE,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
    base_uom VARCHAR(20) NOT NULL DEFAULT 'Pza' CHECK (base_uom IN ('Pza', 'Kg', 'Litro', 'Paq')),
    purchase_pack_label VARCHAR(60) NOT NULL DEFAULT 'Unidad',
    units_per_pack NUMERIC(10, 2) NOT NULL DEFAULT 1.0 CHECK (units_per_pack > 0),
    storage_condition VARCHAR(40) NOT NULL DEFAULT 'Ambiente (Seco)' CHECK (
        storage_condition IN ('Ambiente (Seco)', 'Refrigerado (2°C a 6°C)', 'Congelado (-18°C)')
    ),
    is_perishable BOOLEAN NOT NULL DEFAULT TRUE,
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
    sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (sale_price >= 0),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 16.00 CHECK (tax_rate >= 0),
    min_stock_alert NUMERIC(12, 3) NOT NULL DEFAULT 10.0 CHECK (min_stock_alert >= 0),
    reorder_point NUMERIC(12, 3) NOT NULL DEFAULT 25.0 CHECK (reorder_point >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. LOTES DE INVENTARIO Y CADUCIDAD (FEFO)
CREATE TABLE IF NOT EXISTS inventory_batches (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES store_locations(location_id) ON DELETE RESTRICT,
    batch_number VARCHAR(60) NOT NULL,
    expiration_date DATE,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    quantity_on_hand NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    reserved_quantity NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    batch_status VARCHAR(20) NOT NULL DEFAULT 'GOOD' CHECK (batch_status IN ('GOOD', 'LOW_STOCK', 'EXPIRED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, location_id, batch_number)
);

-- 5. KARDEX Y MOVIMIENTOS DE INVENTARIO (AUDITORÍA INMUTABLE)
CREATE TABLE IF NOT EXISTS stock_movements (
    movement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    batch_id UUID NOT NULL REFERENCES inventory_batches(batch_id) ON DELETE RESTRICT,
    location_id UUID NOT NULL REFERENCES store_locations(location_id) ON DELETE RESTRICT,
    movement_type VARCHAR(30) NOT NULL CHECK (
        movement_type IN ('PURCHASE_RECEIPT', 'POS_SALE', 'SHELF_REPLENISHMENT', 'SHRINKAGE_EXPIRED', 'INVENTORY_COUNT_ADJ')
    ),
    quantity_delta NUMERIC(12, 3) NOT NULL,
    balance_after NUMERIC(12, 3) NOT NULL CHECK (balance_after >= 0),
    unit_cost_snapshot NUMERIC(12, 2) NOT NULL CHECK (unit_cost_snapshot >= 0),
    reference_document VARCHAR(100),
    operator_name VARCHAR(120) NOT NULL,
    notes TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ÍNDICES DE ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products (barcode_ean13) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_plu ON products (plu_code) WHERE plu_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_batches_fefo_dispatch 
    ON inventory_batches (product_id, expiration_date ASC NULLS LAST)
    WHERE quantity_on_hand > 0 AND batch_status <> 'EXPIRED';
CREATE INDEX IF NOT EXISTS idx_batches_expiry_monitor 
    ON inventory_batches (expiration_date ASC, batch_status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_history 
    ON stock_movements (product_id, occurred_at DESC);
