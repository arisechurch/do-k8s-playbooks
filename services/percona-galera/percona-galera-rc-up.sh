#!/bin/bash

script_root=`dirname "${BASH_SOURCE}"`
discovery=$(curl -sL https://discovery.etcd.io/new)

cat $script_root/percona-galera-rc-template.yaml | \
    sed -e "s,{{discovery}},$discovery,g" | \
    kubectl create -f -
