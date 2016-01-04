/**
 * @module lib/status
 * @exports {Function}
 */

var Table = require('cli-table')

var flat = require('flat')
var moment = require('moment')
var multiline = require('multiline')
var templateString = require('template-string')

/**
 * Produce template string of instance information and output to stdout
 * @param {Object} instance
 */
module.exports = (options, instance) => {
  var tableOpts = {
    chars: { 'top': '-' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
             , 'bottom': '-' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
             , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
             , 'right': '' , 'right-mid': '' , 'middle': ' | ' },
    style: { 'padding-left': 0, 'padding-right': 0 }
  }
  var table = new Table(tableOpts)
  table.push(['branch name', instance.contextVersion.appCodeVersions[0].branch])
  table.push(['cid', instance.container.dockerContainer])
  table.push(['created by', instance.createdBy.username])
  table.push(['github commit', instance.contextVersion.appCodeVersions[0].commit])
  table.push(['open ports', Object.keys(instance.container.ports).join(', ')])
  table.push(['status', instance.container.inspect.State.Status])
  table.push(['uptime', moment.duration(instance.container.inspect.State.StartedAt).humanize()])
  table.map(function (arr) {
    arr[0] = arr[0].magenta
  })
  console.log([
    'https://runnable.io/',
    instance.owner.username,
    '/',
    instance.lowerName].join('').magenta)
  console.log(table.toString())

  if (options.E) {
    // Add ENV VARS to status output
    table = new Table(tableOpts)
    instance.env.forEach(function (env) {
      table.push(env.split('='))
    })
    table.map(function (arr) {
      arr[0] = arr[0].magenta
    })
    console.log('ENVIRONMENT VARIABLES'.magenta)
    console.log(table.toString())
  }
}
