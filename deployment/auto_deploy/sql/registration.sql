CREATE TABLE registration(
    id bigserial,
    reg_id BIGINT NOT NULL PRIMARY KEY,
    value  varchar(100) NOT NULL,
    manager varchar(50) NOT NULL,
    adapter varchar(50) default '0x0000000000000000000000000000000000000000',
    deposit varchar(50) default '0x0000000000000000000000000000000000000000',
    chain_id integer,
    slot_id BIGINT,
    status SMALLINT default 0,
    process boolean default '0' NOT NULL,
    transaction_hash text,
    created_at   timestamp with time zone not null default now(),
    updated_at   timestamp with time zone not null default now()
);

COMMENT ON COLUMN registration.status is '0:init 1: Created 2: Ready 3: Running 4: Paused 5: Stopped';

DROP SEQUENCE IF EXISTS chain_id;
CREATE SEQUENCE chain_id START 1100;
