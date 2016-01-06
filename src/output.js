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

/**
 * @param {String} loadingMessage
 * @param {String|undefined} finalMessage
 * @param {Boolean|undefined} clear
 * @return Function
 */
module.exports = (loadingMessage, finalMessage, clear) => {
  loadingMessage = loadingMessage || '%s '
  var spinner = new Spinner(loadingMessage.magenta)
  spinner.start()
  var alreadyRan = false
  return (arg) => {
    if (alreadyRan) return arg
    alreadyRan = true
    spinner.stop((exists(clear)) ? clear : true)
    if (finalMessage) console.log(finalMessage.magenta)
    return arg // for use in .then()
  }
}
