/**
 * @module lib/status
 * @exports {Function}
 */

require('colors')
var Table = require('cli-table')
var keypather = require('keypather')()
var moment = require('moment')

/**
 * Create a formatted table from instance object property values. Output to stdout.
 * @param {Object} instance
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
  table.push(['branch name',
             keypather.get(instance, 'contextVersion.appCodeVersions[0].branch')])
  table.push(['cid',
             keypather.get(instance, 'container.dockerContainer')])
  table.push(['created by',
             keypather.get(instance, 'createdBy.username')])
  table.push(['github commit',
             keypather.get(instance, 'contextVersion.appCodeVersions[0].commit')])
  table.push(['open ports',
             Object.keys(keypather.get(instance, 'container.ports') || {}).join(', ')])
  table.push(['status',
             keypather.get(instance, 'container.inspect.State.Status')])
  table.push(['uptime',
             moment.duration(keypather.get(instance, 'container.inspect.State.StartedAt'))
             .humanize()])
  table.map(function (arr) {
    arr[0] = arr[0].magenta
  })
  console.log([
    'https://runnable.io/',
    keypather.get(instance, 'owner.username'),
    '/',
    keypather.get(instance, 'lowerName')].join('').magenta)
  console.log(table.toString())

  if (options.E) {
    // Add ENV VARS to status output
    table = new Table(tableOpts)
    keypather.get(instance, 'env').forEach(function (env) {
      table.push(env.split('='))
    })
    table.map(function (arr) {
      arr[0] = arr[0].magenta
    })
    console.log('ENVIRONMENT VARIABLES'.magenta)
    console.log(table.toString())
  }
}
