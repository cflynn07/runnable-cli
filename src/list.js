/**
 * @module lib/list
 * @exports {Function}
 */

var Table = require('cli-table')
var binarySearchInsert = require('binary-search-insert')
var hasKeypaths = require('101/has-keypaths')
var keypather = require('keypather')()
var moment = require('moment')

var output = require('./output')

/**
 * Create a formatted table from a collection of instances
 * @param {Object} options - Options passed from commander.js/cli arguments & flags
 * @param {Object} instance - Collection of instance objects from API
 */
var list = module.exports = (options, instances) => {
  var tableOpts = {
    head: [
      'REPO',
      'BRANCH',
      'STATUS',
      'OWNER'
    ].map((s) => { return s.white.bold }),
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
  // Repository Name  |  Branch Name  |  Status  |  Uptime  |  Shorthash  |  CreatedBy

  /* TODO pass in repo info
  .filter(hasKeypaths({
    'contextVersion.appCodeVersions[0].repo': instance.appCodeVersions[0].repo
  }))
  */

  list._sortInstances(instances).forEach((instance) => {
    var propFetch = instancePropertyFetch(instance)
    table.push([
      propFetch('contextVersion.appCodeVersions[0].repo'),
      propFetch('contextVersion.appCodeVersions[0].branch'),
      propFetch('container.inspect.State.Status'),
      propFetch('createdBy.username')
    ])
  })

/*
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
*/
  console.log(table.toString())
}

/**
 * TODO move to wrapper model??
 * @param {Array<objects>} instances - immutable
 * @return Array
 */
module.exports._sortInstances = (instances) => {
  var sortedInstances = []
  var compareKeypath = 'contextVersion.appCodeVersions[0].repo'
  var comparator = function (a, b) {
    return keypather.get(a, compareKeypath) > keypather.get(b, compareKeypath)
  }
  instances.forEach(binarySearchInsert.bind(this, sortedInstances, comparator))
  return sortedInstances
}



/**
 * Temporary
 */
function instancePropertyFetch (instance) {
  return function (keypath) {
    var val = keypather.get(instance, keypath)
    var valString = keypather.get(val, 'toString()')
    if (!valString) return output.colorize('-')
    return output.colorize(valString)
  }
}
