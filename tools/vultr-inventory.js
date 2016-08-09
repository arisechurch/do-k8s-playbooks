'use strict';

let argv = require('optimist')
  .alias('a', 'api-key')
    .default('api-key', process.env['VULTR_API_KEY'])
  .alias('n', 'namespace')
  .argv;

const Vultr = require('vultr');

const provhost = require('provhost');
const api = new Vultr(argv['api-key']);

api.server.list().then(function(servers) {
  return console.log(servers);

  let serverHash = {
    _meta: {
      hostvars: {}
    }
  };

  var hostvars = serverHash._meta.hostvars;

  function addToNamespace(namespace, server, parent) {
    serverHash[namespace] || (serverHash[namespace] = {
      hosts: [],
      children: []
    });
    serverHash[namespace].hosts.push(server.name);

    if (parent) {
      serverHash[parent].children.push(namespace);
    }
  }

  servers.forEach(function(server) {
    var meta = provhost.parse(server.name);
    var namespace = meta.id ? meta.namespace : 'all';

    if (argv.namespace && namespace !== argv.namespace) {
      return;
    }

    addToNamespace(namespace, server);

    meta.groups.forEach(function(group) {
      addToNamespace(group.name, server, namespace);
    });

    var networks = {};
    server.networks.v4.forEach(function(network) {
      networks[network.type] = network;
    });
    hostvars[server.name] = {
      ansible_ssh_host: networks.public.ip_address,
      private_ip_address: networks.private.ip_address
    };
  });

  console.log(JSON.stringify(serverHash, null, 2));
});
