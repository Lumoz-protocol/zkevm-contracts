'''json
{
    "node_docker_file": "/Users/marius/work/opside/opside-deploy-zkrollup/cmd/ansible/playbook.yaml", -- 上传文件的镜像路径，绝对路径
    "bridge_docker_file": "/Users/marius/work/opside/opside-deploy-zkrollup/cmd/ansible/playbook.yaml", -- 上传文件的镜像路径，绝对路径
    "target_image_path": "/Users/marius/work/opside/opside-deploy-zkrollup/cmd/a", -- 服务器上的路径，绝对路径
    "playbook_file": "./ansible/playbook.yaml", -- 不管，老版本的
    "playbook": { -- 每个功能的配置文件，固定的
       "playbook_image": "./ansible/playbook_docker_image.yaml", 
        "playbook_zkevm_config": "./ansible/playbook_zkevm_config.yaml",
        "playbook_run_db": "./ansible/playbook_run_db.yaml",
        "playbook_run_prover": "./ansible/playbook_run_prover.yaml",
        "playbook_run_zksync": "./ansible/playbook_run_zksync.yaml",
        "playbook_run_node": "./ansible/playbook_run_node.yaml",
        "playbook_run_broadcast": "./ansible/playbook_run_broadcast.yaml",
        "playbook_run_bridge": "./ansible/playbook_run_bridge.yaml",
        "playbook_run_explorer_l2": "./ansible/playbook_run_explorer_l2.yaml"
    },
    "zkevm_config_root_path": "/Users/marius/work/opside/opside-deploy-zkrollup/cmd/build", -- 配置文件的root目录: 比如 /root/reg_id/，填写root
    "target_zkevm_path": "/Users/marius/work/opside/opside-deploy-zkrollup/cmd/a/a", -- 配置文件上传到服务器的绝对路径
    "test_env": true, -- 是否测试
    "db": {
        "host": "192.168.213.235",        
        "user": "node",
        "password": "123456",
        "dbname": "state_db",
        "port": 5432
    }
}
...

# 命令行
./depoly_zkrollup -c config.json --id {reg_id} --poe_addr poe合约地址 --exit_mana_addr 退出合约地址 --gen_blocknumber 区块高度 --sequencer address  --aggregator address --bridge_addr address --l2bridge_addrs address1,address2

# js的调用方法
start.js
