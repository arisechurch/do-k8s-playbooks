#!/bin/bash

ansible-playbook -i inventories/digitalocean.sh create-node.yaml
ansible-playbook -i inventories/digitalocean.sh update-iptables.yaml
