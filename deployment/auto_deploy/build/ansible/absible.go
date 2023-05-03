package ansible

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"path"

	"github.com/apenella/go-ansible/pkg/execute"
	"github.com/apenella/go-ansible/pkg/options"
	"github.com/apenella/go-ansible/pkg/playbook"
	"github.com/apenella/go-ansible/pkg/stdoutcallback/results"
)

/*
   需要准备的文件：
     prover.config.json -- 这个可以不变化

     每个slot不通的文件：
       node.config.toml
       sequencer.keystore
       aggregator.keystore
       genesis.config.json
     docker文件设置：
     ZKEVM_NODE_AGGREGATOR_SENDER_ADDRESS --  对应aggregator.keystore
     ZKEVM_NODE_SEQUENCER_SENDER_ADDRESS -- 对应sequencer.keystore
*/

type DeployResult struct {
	Name             string
	Failed           bool
	Skipped          bool
	FailedWhenResult bool
	SkipReason       string
	Stdout           interface{}
	Cmd              interface{}
	Msg              interface{}
}

// results, err = ansible.Deploy(host, "", cfg.NodeDockerFile, cfg.BirdgeDockerFile, cfg.TargetImagePath, cfg.TargetZkevmPath, zkevmFiles, []string{cfg.PlaybookFile})
// if err != nil {
// 	fmt.Println(err)
// 	db.Save(&tmp)
// 	return err
// }

func Deploy(host, user, nodeImageFile, birdgeFile, targetImagePath, tragerZkevmPath string, zkevmFiles, playbooks []string) ([]DeployResult, error) {
	var err error
	var res *results.AnsiblePlaybookJSONResults

	buff := new(bytes.Buffer)

	ansiblePlaybookConnectionOptions := &options.AnsibleConnectionOptions{
		// Connection: "127.0.0.1",
		// User:       "root",
	}

	// 获取zkevmFile的问题名
	nodeImageFileName := path.Base(nodeImageFile)
	targetImageFile := path.Join(targetImagePath, nodeImageFileName)
	birdgeImageFile := path.Join(targetImagePath, path.Base(birdgeFile))
	fmt.Println(targetImageFile)

	ansiblePlaybookOptions := &playbook.AnsiblePlaybookOptions{
		ExtraVars: map[string]interface{}{
			"host":            host,
			"user":            user,
			"path":            nodeImageFile,
			"birdgeFile":      birdgeFile,
			"birdgeImageFile": birdgeImageFile,
			"targetImagePath": targetImagePath, // 上传镜像到服务器
			"targetImageFile": targetImageFile, // 加载镜像
			"prover_config":   zkevmFiles[0],   // proverConfig,       // 上传prover配置文件到服务器
			"node_config":     zkevmFiles[1],   //nodeConfig,       // 上传node配置文件到服务器
			"sequencer":       zkevmFiles[2],   //sequencer,       // 上传sequencer keystore到服务器
			"aggregator":      zkevmFiles[3],   //aggregator,       // 上传aggregator keystore到服务器
			"genesis":         zkevmFiles[4],   //genesis,       // 上传genesis文件到服务器
			"docker_compose":  zkevmFiles[5],   //dockerCompose, // 上传dockerCompose文件到服务器
			"tragerZkevmPath": tragerZkevmPath,
		},
	}

	execute := execute.NewDefaultExecute(
		execute.WithWrite(io.Writer(buff)),
	)

	playbook := &playbook.AnsiblePlaybookCmd{
		Playbooks:         playbooks,
		Exec:              execute,
		ConnectionOptions: ansiblePlaybookConnectionOptions,
		Options:           ansiblePlaybookOptions,
		StdoutCallback:    "json",
	}

	err = playbook.Run(context.TODO())
	if err != nil {
		return nil, err
	}

	res, err = results.ParseJSONResultsStream(io.Reader(buff))
	if err != nil {
		return nil, err
	}

	deployResults := make([]DeployResult, 0)
	for _, play := range res.Plays {
		for _, task := range play.Tasks {
			result := task.Hosts[host]
			deployResults = append(deployResults, DeployResult{
				Name:             task.Task.Name,
				Failed:           result.Failed,
				Skipped:          result.Skipped,
				FailedWhenResult: result.FailedWhenResult,
				SkipReason:       result.SkipReason,
				Stdout:           result.Stdout,
				Cmd:              result.Cmd,
			})
		}
	}

	return deployResults, nil
}

func DeployWithlaybookOptions(host string, playbooks []string, ansiblePlaybookOptions *playbook.AnsiblePlaybookOptions) ([]DeployResult, error) {
	var err error
	var res *results.AnsiblePlaybookJSONResults

	buff := new(bytes.Buffer)

	ansiblePlaybookConnectionOptions := &options.AnsibleConnectionOptions{
		// Connection: "127.0.0.1",
		// User:       "root",
	}

	execute := execute.NewDefaultExecute(
		execute.WithWrite(io.Writer(buff)),
	)

	playbook := &playbook.AnsiblePlaybookCmd{
		Playbooks:         playbooks,
		Exec:              execute,
		ConnectionOptions: ansiblePlaybookConnectionOptions,
		Options:           ansiblePlaybookOptions,
		StdoutCallback:    "json",
	}

	err = playbook.Run(context.TODO())
	if err != nil {
		return nil, err
	}

	res, err = results.ParseJSONResultsStream(io.Reader(buff))
	if err != nil {
		return nil, err
	}

	deployResults := make([]DeployResult, 0)
	for _, play := range res.Plays {
		for _, task := range play.Tasks {
			result := task.Hosts[host]
			deployResults = append(deployResults, DeployResult{
				Name:             task.Task.Name,
				Failed:           result.Failed,
				Skipped:          result.Skipped,
				FailedWhenResult: result.FailedWhenResult,
				SkipReason:       result.SkipReason,
				Stdout:           result.Stdout,
				Cmd:              result.Cmd,
				Msg:              result.Msg,
			})
		}
	}

	return deployResults, nil
}
