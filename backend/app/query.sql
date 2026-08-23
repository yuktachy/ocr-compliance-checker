create extension if not exists pgcrypto;

create table products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    category text,                 -- food/cosmetics/electronics etc.
    brand text,
    net_quantity numeric,
    net_quantity_unit text,        -- g | kg | ml | l | N
    image_path text,               -- supabase storage path
    created_at timestamptz default now()
);

create table inspections (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references products(id) on delete set null,
    image_path text not null,
    ocr_engine_used text,
    language_detected text[],
    raw_ocr_text text,
    extracted_json jsonb,          -- jsonb, not text — queryable
    overall_confidence numeric,
    status text default 'pending', -- pending|processing|completed|failed
    created_at timestamptz default now(),
    processed_at timestamptz
);

create table rules (
    id uuid primary key default gen_random_uuid(),
    rule_code text unique,         -- e.g. 'LM-PC-6(1)(a)'
    field_name text,
    description text,
    legal_reference text,
    severity text                  -- critical|major|minor
);

create table violations (
    id uuid primary key default gen_random_uuid(),
    inspection_id uuid references inspections(id) on delete cascade,
    rule_id uuid references rules(id),
    field_name text,
    expected text,
    found text,
    severity text,
    explanation text,
    created_at timestamptz default now()
);

create table reports (
    id uuid primary key default gen_random_uuid(),
    inspection_id uuid references inspections(id) on delete cascade,
    format text,                   -- pdf|json
    file_path text,
    generated_at timestamptz default now()
);

create index idx_inspections_product on inspections(product_id);
create index idx_inspections_status on inspections(status);
create index idx_violations_inspection on violations(inspection_id);