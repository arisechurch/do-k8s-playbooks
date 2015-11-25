#!/bin/bash

inventory="${1:-inventories/digitalocean.sh}"

ansible-playbook -i "${inventory}" setup-dns.yaml
