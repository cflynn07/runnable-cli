/**
 * Output command statuses and spinners to stdout
 * @module lib/output
 * @exports Function
 */
'use strict'

require('colors')

var Spinner = require('cli-spinner').Spinner
var exists = require('101/exists')

class Output {
  /**
   *
   */
  constructor () {
    Spinner.setDefaultSpinnerString(Spinner.spinners[9])
  }

  /**
   * @param {String} loadingMessage
   * @param {String|undefined} finalMessage
   * @param {Boolean|undefined} clear
   * @return Function
   */
  spinner (loadingMessage, finalMessage, clear) {
    loadingMessage = loadingMessage || '%s '
    var spinner = new Spinner(this.colorize(loadingMessage))
    spinner.start()
    var alreadyRan = false
    this.currentSpinnerStop = (arg) => {
      if (alreadyRan) return arg
      alreadyRan = true
      spinner.stop((exists(clear)) ? clear : true)
      if (finalMessage) console.log(this.colorize(finalMessage))
      return arg // for use in .then()
    }
    return this.currentSpinnerStop
  }

  /**
   * @param {String} message
   * @param {Boolean} noColorize
   */
  toStdOut (message, noColorize) {
    if (!noColorize) {
      message = this.colorize(message)
    }
    if (this.currentSpinnerStop) this.currentSpinnerStop()
    console.log(message)
  }

  /**
   * @param {String} message
   */
  colorize (message) {
    return message.magenta
  }
}

module.exports = Output
