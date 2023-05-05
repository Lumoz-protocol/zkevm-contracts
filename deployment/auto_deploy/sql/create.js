const pg = require('../deployment/utils/pg');

if (process.env.PG_URL === undefined || process.env.PG_URL === '') {
    throw new Error('PG_URL is empty');
}

(async () => {
    const pgClient = await pg.pgConnect(process.env.PG_URL);

    await pgClient.query(`CREATE TABLE request_record(
    id bigserial,
    record_id varchar(100) NOT NUll,
    admin_address varchar(50) NOT NULL,
    whitelist_address text,
    permissionless boolean NOT NULL,
    customize_gasname varchar(50),
    customize_gasaddress varchar(50),
    sequencer_address varchar(50),
    network_url varchar(256),
    rentPeriod SMALLINT,
    register_time BIGINT,
    expired_time BIGINT,
    zkevm_type varchar(50),
    img text,
    transaction_status SMALLINT,
    transaction_hash text PRIMARY KEY,
    zkrollup_contract_status  SMALLINT default 0,
    zkrollup_node_status      SMALLINT default 0,
    block_explorer_status    SMALLINT default 0,
    zkEvm_bridge_status      SMALLINT default 0,
    rpc_address varchar(256),
    explorer_address varchar(256),
    bridge_contract_address varchar(256),
    created_at   timestamp with time zone not null default now(),
    updated_at   timestamp with time zone not null default now()
);

COMMENT ON COLUMN request_record.transaction_status is '0:未支付      1支付中     2支付成功    3支付失败';
COMMENT ON COLUMN request_record.zkrollup_contract_status is '0待部署       1部署中       2部署成功       3 部署失败';
COMMENT ON COLUMN request_record.zkrollup_node_status is '0待部署       1部署中       2部署成功       3 部署失败';
COMMENT ON COLUMN request_record.block_explorer_status is '0待部署       1部署中       2部署成功       3 部署失败';
COMMENT ON COLUMN request_record.zkEvm_bridge_status is '0待部署       1部署中       2部署成功       3 部署失败';
COMMENT ON COLUMN request_record.bridge_contract_address is '桥的信息: layer2BridgeAddress,layer3BridgeAddress';`);
})();
