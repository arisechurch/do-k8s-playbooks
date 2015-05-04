#!/usr/bin/env node

var async = require('async');
var provhost = require('provhost');
var nautical = require('nautical');
var argv = require('optimist')

  .alias('t', 'token')
  .default('token', process.env['DO_API_TOKEN'])

  .alias('n', 'namespace')
  .default('namespace', 'coreos-test')

  .argv;

var api = nautical.getClient({
  token: argv.token
});

var provhostOpts = {
  namespace: argv.namespace,
  groups: []
};
if (argv.master) {
  provhostOpts.groups.push('master');
} else {
  provhostOpts.groups.push('node');
}
var hostname = provhost.stringify(provhostOpts);

if (argv.k && !Array.isArray(argv.k)) {
  argv.k = [argv.k];
}

api.droplets.list(function(error, res) {
  if (error) {
    throw error;
  }

  var droplets = res.body.droplets.filter(function(droplet) {
    var namespace = provhost.parse(droplet.name).namespace;
    return argv.namespace === namespace;
  });

  async.each(droplets, function(droplet, next) {
    api.droplets.remove(droplet.id, next);
  }, function(error) {
    if (error) {
      throw error;
    }
  });
});
