#!/bin/bash

source /etc/ceph-environment

mkdir -p /mnt/cephfs

while true; do
	mount -t ceph ${CEPH_MONITORS}:/ /mnt/cephfs \
		-o mount_timeout=10,name=admin,secret=${CEPH_ADMIN_SECRET}

	if [ $? -eq 0 ]; then
		exit 0
	fi

	sleep 5
done
