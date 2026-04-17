-- Ejecutar en el SQL Editor de Supabase
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Tabla de Productos
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    precio NUMERIC NOT NULL,
    costo NUMERIC NOT NULL,
    stock INTEGER NOT NULL,
    categoria TEXT,
    codigo_barras TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Ventas
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    items JSONB NOT NULL,
    total NUMERIC NOT NULL,
    ganancia NUMERIC NOT NULL,
    fecha TIMESTAMPTZ DEFAULT now()
);

-- Deshabilitar RLS para desarrollo inicial rápido
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;
