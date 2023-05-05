CREATE TABLE request_record(
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
COMMENT ON COLUMN request_record.bridge_contract_address is '桥的信息: layer2BridgeAddress,layer3BridgeAddress';


-- CREATE TABLE notification(
--     id bigserial,
--     request_record_id BIGINT,
--     reg_id BIGINT NOT NULL,
--     type SMALLINT NOT NULL,
--     status SMALLINT default 0,
--     need boolean default true NOT NULL
-- );

-- COMMENT ON COLUMN notification.type is '1: zkrollup_contract 2: zkrollup_node 3: block_explorer 4: zkEvm_bridge';
-- COMMENT ON COLUMN notification.status is '0: 未通知 1: 部署通知 2:部署完成通知';
-- COMMENT ON COLUMN notification.need is '是否需要通知';

CREATE TABLE notification(
    id bigserial,
    request_record_id BIGINT PRIMARY KEY,
    reg_id BIGINT NOT NULL,
    zkrollup_contract SMALLINT default 0 NOT NULl,
    zkrollup_node SMALLINT default 0 NOT NULL,
    block_explorer SMALLINT default 0 NOT NULL,
    zkEvm_bridge SMALLINT default 0 NOT NULL,
    need boolean default true NOT NULL
);

COMMENT ON COLUMN notification.zkrollup_contract is '0: 未通知 1: 部署通知 2:部署完成通知';
COMMENT ON COLUMN notification.zkrollup_node is '0: 未通知 1: 部署通知 2:部署完成通知';
COMMENT ON COLUMN notification.block_explorer is '0: 未通知 1: 部署通知 2:部署完成通知';
COMMENT ON COLUMN notification.zkEvm_bridge is '0: 未通知 1: 部署通知 2:部署完成通知';
COMMENT ON COLUMN notification.need is '是否需要通知';

CREATE TABLE service_machine_manage(
    id bigserial,
    host varchar(50),
    status SMALLINT default 0,
    server_type varchar(5) default 0
);

COMMENT ON COLUMN service_machine_manage.server is '0:未部署  1:正在部署  2:部署成功';
COMMENT ON COLUMN service_machine_manage.server_type is '1:node 10:explorer 100:prover';
