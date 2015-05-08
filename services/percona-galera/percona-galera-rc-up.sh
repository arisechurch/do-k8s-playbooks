#!/bin/bash

ENV=${ENV:-prod}
script_root=`dirname "${BASH_SOURCE[0]}"`
discovery=$(curl -sL https://discovery.etcd.io/new)
password=$(uuidgen)

cat $script_root/percona-galera-rc-template.yaml | \
    sed -e "s,{{discovery}},$discovery,g" | \
    sed -e "s,{{password}},$password,g" | \
    sed -e "s,{{env}},$ENV,g" | \
    kubectl create -f -
