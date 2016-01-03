/**
 * @module lib/status
 * @exports {Function}
 */

var flat = require('flat')
var moment = require('moment')
var multiline = require('multiline')
var templateString = require('template-string')

/**
 *
 */
module.exports = (instance) => {
  var ports = Object.keys(instance.container.ports).join(', ')
  var uptime = moment.duration(instance.container.inspect.State.StartedAt).humanize()
  var flatInstance = flat(instance)
  flatInstance.ports = ports
  flatInstance.uptime = uptime
  var template = multiline.stripIndent(function () {/*
    cid: ${container.dockerContainer}
    status: ${container.inspect.State.Status}
    open ports: ${ports}
    branch name: ${contextVersion.appCodeVersions.0.branch}
    github commit: ${contextVersion.appCodeVersions.0.commit}
    uptime: ${uptime}
  */})
  console.log(templateString(template, flatInstance))
}
