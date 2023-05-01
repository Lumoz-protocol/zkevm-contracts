CREATE TABLE block_status(
    block_number BIGINT NOT NULL,
    created_at   timestamp with time zone not null default now(),
    updated_at   timestamp with time zone not null default now(),
);
