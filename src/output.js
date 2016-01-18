/**
 * Output command statuses and spinners to stdout
 * @module src/output
 * @exports Class
 */
'use strict'

require('colors')

const Spinner = require('cli-spinner').Spinner
const exists = require('101/exists')

class Output {
  /**
   * @constructor
   * Set default spinner pattern
   */
  constructor () {
    Spinner.setDefaultSpinnerString(Spinner.spinners[9])
  }

  /**
   * Create and start a new CLI spinner. Returns a function that clears the spinner when invoked.
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
