#!/bin/bash

# Kubernetes passes --key last which we translate into keyfile
ceph_key="${@: -1}"

if [[ "$ceph_key" =~ ^--key= ]] ; then
	echo "${@: -1}" | sed -e 's/--key=//g' > /tmp/rbd-keyfile
	/usr/bin/docker run -i --rm \
		--privileged \
		--pid host \
		--name rbd \
		--net host \
		--volume /dev:/dev \
		--volume /sys:/sys \
		--volume /etc/ceph:/etc/ceph \
		ceph/base rbd $@ --keyfile /tmp/rbd-keyfile
else
	/usr/bin/docker run -i --rm \
		--privileged \
		--pid host \
		--name rbd \
		--net host \
		--volume /dev:/dev \
		--volume /sys:/sys \
		--volume /etc/ceph:/etc/ceph \
		ceph/base rbd $@
fi
