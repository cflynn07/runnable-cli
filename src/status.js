/**
 * @module lib/status
 * @exports {Function}
 */

var flat = require('flat')
var moment = require('moment')
var multiline = require('multiline')
var templateString = require('template-string')

/**
 * Produce template string of instance information and output to stdout
 * @param {Object} instance
 */
module.exports = (options, instance) => {
  var ports = Object.keys(instance.container.ports).join(', ')
  var uptime = moment.duration(instance.container.inspect.State.StartedAt).humanize()
  var flatInstance = flat(instance)
  flatInstance.ports = ports
  flatInstance.uptime = uptime
  var template = multiline.stripIndent(function () {/*
    https://runnable.io/${owner.username}/${lowerName}/
    --------------------------------------------------------
    cid: ${container.dockerContainer}
    status: ${container.inspect.State.Status}
    open ports: ${ports}
    branch name: ${contextVersion.appCodeVersions.0.branch}
    github commit: ${contextVersion.appCodeVersions.0.commit}
    uptime: ${uptime}
    --------------------------------------------------------
  */})
  if (options.E) {
    // Add ENV VARS to status ouput
    var envString = instance.env.join('\n')
    flatInstance.envString = envString
    template += '\n' + multiline.stripIndent(function () {/*
      Environment Variables
      --------------------------------------------------------
      ${envString}
      --------------------------------------------------------
    */})
  }
  console.log(templateString(template, flatInstance))
}
