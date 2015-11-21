# do-k8s-playbooks

Manage a Kubernetes cluster on Digitalocean using Ansible.


## Prepare

1. `npm install`
2. `export DO_API_TOKEN=xxx`
3. `ansible-galaxy install defunctzombie.coreos-bootstrap`

## Configuration

Copy `group_vars/all.sample` to `group_vars/all` and edit.

## Create a 3 node cluster

```sh
ansible-playbook -i inventories/digitalocean.sh create-master.yaml; ./add-node.sh; ./add-node.sh; ./add-node.sh
export FLEETCTL_TUNNEL=<master-ip>
fleetctl start services/master/*.service
fleetctl start services/node/*.service
ansible-playbook -i inventories/digitalocean.sh reboot.yaml
```

## Other tips

### Load balance http pods

```sh
ssh core@<master-ip>
etcdctl set /vulcand/backends/default-<pod name>/backend '{"Type": "http"}'
etcdctl set /vulcand/frontends/default-<pod name>/frontend '{"Type": "http", "BackendId": "default-<pod name>", "Route": "Host(`host.domain.com`)"}'
```

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

```sh
mkdir ssl-certs
cp /tmp/my-cert.crt ssl-certs/
cp /tmp/my-key.key ssl-certs/
ansible-playbooks -i inventories/digitalocean prepare-cluster.yaml
```

You can then update your `kubernetes-reverseproxy` annotation with your ssl
keys.
