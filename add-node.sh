#!/bin/bash

inventory="${1:-inventories/digitalocean.sh}"

ansible-playbook -i "${inventory}" create-node.yaml
ansible-playbook -i "${inventory}" prepare-cluster.yaml
