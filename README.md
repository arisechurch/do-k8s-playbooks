# do-k8s-playbooks

Manage a Kubernetes cluster on Digitalocean using Ansible.


## Prepare

1. `npm install`
2. `export DO_API_TOKEN=xxx`
3. `ansible-galaxy install defunctzombie.coreos-bootstrap`


## Configuration

Copy `group_vars/all.sample` to `group_vars/all` and edit.


## Create a simple 3 node cluster

```sh
ansible-playbook -i inventories/digitalocean.sh create-master.yaml; ./add-node.sh; ./add-node.sh; ./add-node.sh
export FLEETCTL_TUNNEL=<master-ip>
fleetctl start services/master/*.service
fleetctl start services/node/*.service
ansible-playbook -i inventories/digitalocean.sh reboot.yaml
```


## Create a 3 node cluster with dns and ceph

```sh
ansible-playbook -i inventories/digitalocean.sh create-master.yaml; ./add-node.sh; ./add-node.sh; ./add-node.sh
export FLEETCTL_TUNNEL=<master-ip>
fleetctl start services/master/*.service
ssh -nNTL 8080:127.0.0.1:8080 core@<master-ip>
./setup-dns.sh
fleetctl start services/node/*.service
ansible-playbook -i inventories/digitalocean.sh bootstrap-ceph.yaml
fleetctl start services/ceph/ceph-mon.service
ansible-playbook -i inventories/digitalocean.sh create-ceph-osds.yaml
fleetctl start services/ceph/ceph-osd.service
fleetctl start services/ceph/ceph-mds.service
# Once mds has bootstraped cephfs
fleetctl start services/ceph/mnt-cephfs.mount
```


## Other tips

### Load balance http pods

Vulcand and romulus is run for you. You can load balance your service by adding
some metadata to your service definition:

```yaml
metadata:
  labels:
    romulus/type: external
  annotations:
    romulus/host: some.domain.com
```

Make sure to setup DNS for all of your nodes. It is recommended to create A
records for each node, with a wildcard CNAME.

The romulus repository can be found here: https://github.com/timelinelabs/romulus


### Forward the master api port

```sh
ssh -nNTL 8080:127.0.0.1:8080 core@<master-ip>
```


### Setup cluster DNS

First forward the master api port as above.

```sh
./setup-dns.sh
ansible-playbook -i inventories/digitalocean.sh reboot.yaml
```


### Setup ceph cluster

First create a 3 node cluster

```sh
ansible-playbook -i inventories/digitalocean.sh bootstrap-ceph.yaml
fleetctl start services/ceph/ceph-mon.service
# Create 3 OSD's using ceph/base image on one of the nodes
fleetctl start services/ceph/ceph-osd.service
fleetctl start services/ceph/ceph-mds.service
# After setting up cephfs
fleetctl start services/ceph/mnt-cephfs.mount
```


### SSL keys and certs

HTTP proxy layer is handled by `vulcand`. You can view there documentation
around SSL certs here: http://vulcand.io/proxy.html#managing-certificates

