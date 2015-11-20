#!/usr/bin/env node
'use strict';

var argv = require('optimist')
  .default('token', process.env['DO_API_TOKEN'])
  .alias('n', 'namespace')
  .argv;

var provhost = require('provhost');
var nautical = require('nautical');
var api = nautical.getClient({
  token: argv.token
});

api.droplets.list(function(error, res) {
  if (error) {
    throw error;
  }

  var droplets = res.body.droplets.sort(function(a, b) {
    a = new Date(a.created_at);
    b = new Date(b.created_at);

    return a - b;
  });

  var dropletHash = {
    _meta: {
      hostvars: {}
    }
  };
  var hostvars = dropletHash._meta.hostvars;

  function addToNamespace(namespace, droplet, parent) {
    dropletHash[namespace] || (dropletHash[namespace] = {
      hosts: [],
      children: []
    });
    dropletHash[namespace].hosts.push(droplet.name);

    if (parent) {
      dropletHash[parent].children.push(namespace);
    }
  }

  droplets.forEach(function(droplet) {
    var meta = provhost.parse(droplet.name);
    var namespace = meta.id ? meta.namespace : 'all';

    if (argv.namespace && namespace !== argv.namespace) {
      return;
    }

    addToNamespace(namespace, droplet);

    meta.groups.forEach(function(group) {
      addToNamespace(group.name, droplet, namespace);
    });

    var networks = {};
    droplet.networks.v4.forEach(function(network) {
      networks[network.type] = network;
    });
    hostvars[droplet.name] = {
      ansible_ssh_host: networks.public.ip_address,
      private_ip_address: networks.private.ip_address
    };
  });

  console.log(JSON.stringify(dropletHash, null, 2));
});
