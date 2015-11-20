#!/usr/bin/env node

var async = require('async');
var provhost = require('provhost');
var nautical = require('nautical');
var argv = require('optimist')

  .alias('t', 'token')
  .default('token', process.env['DO_API_TOKEN'])

  .argv;

var api = nautical.getClient({
  token: argv.token
});

api.keys.list(function(error, res) {
  if (error) {
    throw error;
  }

  console.log(res.body.ssh_keys);
});
