#!/bin/bash

ENV=${ENV:-prod}
script_root=`dirname "${BASH_SOURCE[0]}"`

cat $script_root/percona-galera-svc-template.yaml | \
    sed -e "s,{{env}},$ENV,g" | \
    kubectl create -f -
