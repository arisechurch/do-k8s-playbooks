# do-k8s-playbooks

Manage a Kubernetes cluster on Digitalocean using Ansible.

Comes with https://github.com/ARISEChurch/kubernetes-reverseproxy running on all
nodes to load balance your services with `nginx`. Read the README.md for usage
detail. It works best with round-robin DNS pointing to all your Kubernetes
nodes!

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
fleetctl start services/ceph/*
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
