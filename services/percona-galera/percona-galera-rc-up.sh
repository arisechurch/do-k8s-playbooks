#!/bin/bash

script_root=`dirname "${BASH_SOURCE}"`
discovery=$(curl -sL https://discovery.etcd.io/new)
password=$(uuidgen)

cat $script_root/percona-galera-rc-template.yaml | \
    sed -e "s,{{discovery}},$discovery,g" | \
    sed -e "s,{{password}},$password,g" | \
    kubectl create -f -
