/**
 * Output command statuses and spinners to stdout
 * @module lib/output
 * @exports Function
 */
'use strict'

require('colors')

var Spinner = require('cli-spinner').Spinner
var exists = require('101/exists')

Spinner.setDefaultSpinnerString(Spinner.spinners[9])

var output = module.exports = {
  /**
   * @param {String} loadingMessage
   * @param {String|undefined} finalMessage
   * @param {Boolean|undefined} clear
   * @return Function
   */
  spinner: (loadingMessage, finalMessage, clear) => {
    loadingMessage = loadingMessage || '%s '
    var spinner = new Spinner(output.colorize(loadingMessage))
    spinner.start()
    var alreadyRan = false
    return (arg) => {
      if (alreadyRan) return arg
      alreadyRan = true
      spinner.stop((exists(clear)) ? clear : true)
      if (finalMessage) console.log(output.colorize(finalMessage))
      return arg // for use in .then()
    }
  },

  /**
   * @param {String} message
   */
  general: (message) => {
    console.log(output.colorize(message))
  },

  /**
   *
   */
  colorize: (str) => {
    return str.magenta
  },

  /**
   * Generate the url of the instance page on Runnable
   * @param {Object} instance
   * @return String
   */
  instanceWebURL: (instance) => {
    return [
      process.env.RUNNABLE_WEB_HOST,
      instance.owner.username,
      instance.lowerName
    ].join('/')
  },

  /**
   * Generate the url of the instance server
   * @param {Object} instance
   * @return String
   */
  instanceServerURL: (instance) => {
    return [
      'http://',
      instance.shortHash,
      '-',
      instance.contextVersion.appCodeVersions[0].lowerRepo.split('/')[1],
      '-staging-',
      instance.owner.username,
      process.env.RUNNABLE_CONTAINER_TLD
    ].join('')
  },

  /**
   * Generate Runnable instance name based on name pattern
   * @param {String} branch
   * @param {String} repo
   * @return String
   */
  instanceName: (branch, repo) => {
    if (branch === 'master') {
      return repo
    }
    return branch + '-' + repo
  }
}
