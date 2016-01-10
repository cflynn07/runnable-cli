/**
 * @module lib/status
 * @exports Function
 */
'use strict'

require('colors')
var Table = require('cli-table')
var moment = require('moment')

var output = require('./output')

/**
 * Create a formatted table from instance object property values. Output to stdout.
 * @param {Object} options - Options passed from commander.js/cli arguments & flags
 * @param {Object} instance - Instance object from API
 */
module.exports = (options, instance) => {
  var tableOpts = {
    chars: {
      'top': '-',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      'bottom': '-',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      'left': '',
      'left-mid': '',
      'mid': '',
      'mid-mid': '',
      'right': '',
      'right-mid': '',
      'middle': ' | '
    },
    style: { 'padding-left': 0, 'padding-right': 0 }
  }
  var table = new Table(tableOpts)
  table.push([
    'branch name',
    instance.get('contextVersion.appCodeVersions[0].branch')
  ], [
    'cid',
    instance.get('container.dockerContainer')
  ], [
    'created by',
    instance.get('createdBy.username')
  ], [
    'github commit',
    instance.get('contextVersion.appCodeVersions[0].commit')
  ], [
    'open ports',
    Object.keys(instance.get('container.ports') || {}).join(', ')
  ], [
    'status',
    instance.get('container.inspect.State.Status')
  ], [
    'uptime',
    moment.duration(instance.get('container.inspect.State.StartedAt')).humanize()
  ])
  table.map(function (arr) {
    arr[0] = arr[0].magenta
  })

  console.log(instance.instanceWebURL(instance).magenta)
  console.log(table.toString())

  if (options.E) {
    // Add ENV VARS to status output
    table = new Table(tableOpts)
    instance.get('env').forEach(function (env) {
      table.push(env.split('='))
    })
    table.map(function (arr) {
      arr[0] = arr[0].magenta
    })
    console.log('ENVIRONMENT VARIABLES'.magenta)
    console.log(table.toString())
  }
}
