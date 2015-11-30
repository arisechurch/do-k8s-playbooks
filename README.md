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
# Wait for apiserver to start
ansible-playbook -i inventories/digitalocean.sh setup-dns.yaml
fleetctl start services/node/*.service
ansible-playbook -i inventories/digitalocean.sh bootstrap-ceph.yaml
fleetctl start services/ceph/ceph-mon.service
# Wait for monitors to start
ansible-playbook -i inventories/digitalocean.sh create-ceph-osds.yaml
fleetctl start services/ceph/*
```


## Other tips

### Load balance http pods

A NGINX reverse proxy is run for you. You can balance your service using nginx
by adding some metadata:

```yaml
metadata:
  labels:
    nginx/type: http
  annotations:
    nginx/host: some.domain.com
```

Make sure to setup DNS for all of your nodes. It is recommended to create A
records for each node, with a wildcard CNAME.

The proxy repository can be found here: https://github.com/ARISEChurch/kubernetes-reverseproxy


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
ansible-playbook -i inventories/digitalocean.sh create-ceph-osds.yaml
fleetctl start services/ceph/*
```


### SSL keys and certs

Add your ssl certs to the `ssl/` directory which will be synced to each host.
You can then specify them using metadata:

```yaml
metadata:
  labels:
    nginx/type: http
  annotations:
    nginx/host: some.domain.com
    nginx/sslCrt: cert.crt
    nginx/sslKey: key.key
```
