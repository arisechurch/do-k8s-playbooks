#!/bin/bash

script_dir="$(dirname "${BASH_SOURCE[0]}")"

export ENV="${1:-prod}"

$script_dir/percona-galera-svc-up.sh
$script_dir/percona-galera-rc-up.sh
