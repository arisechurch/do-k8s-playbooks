#!/bin/bash

# Kubernetes passes --key last which we translate into keyfile
ceph_key="${@: -1}"

if [[ "$ceph_key" =~ ^--key= ]] ; then
	echo "${@: -1}" | sed -e 's/--key=//g' > /tmp/rbd-keyfile
	/usr/bin/docker run --rm --privileged --net=host \
		-v /dev:/dev \
		-v /etc/ceph:/etc/ceph \
		-v /var:/var \
		-v /tmp:/tmp \
		ceph/rbd $* --keyfile /tmp/rbd-keyfile
else
	/usr/bin/docker run --rm --privileged --net=host \
		-v /dev:/dev \
		-v /etc/ceph:/etc/ceph \
		-v /var:/var \
		ceph/rbd $*
fi
