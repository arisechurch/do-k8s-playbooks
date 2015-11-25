#!/usr/bin/env node
'use strict';

var provhost = require('provhost');
var argv = require('optimist')

  .alias('m', 'master')
  .default('master', false)

  .alias('n', 'namespace')
  .default('namespace', process.env.DO_NAMESPACE || 'coreos')

  .argv;

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

process.stdout.write(hostname);
