/**
 * @module lib/terminal
 * @exports {Class} Terminal
 */
'use strict'

var Promise = require('bluebird')
var keypress = require('keypress')
var keypather = require('keypather')()
var uuid = require('uuid')

var socket = require('./socket')

class Terminal {
  /**
   * @param {String} dockerHost
   * @param {String} dockerContainer
   */
  constructor (dockerHost, dockerContainer) {
    this._dockerHost = dockerHost
    this._dockerContainer = dockerContainer

    this._terminalSubstreamId = dockerContainer + uuid.v4()
    this._terminalEventsSubstreamId = this._terminalSubstreamId + 'events'

    this._client = socket()
    this._terminalSubstream = this._client.substream(this._terminalSubstreamId)
  }

  /**
   * Attach to tty of remote container and pipe input/output between stdin and stdout
   */
  fetchAndPipeToStdout () {
    this._terminalSubstream.on('data', (data) => {
      process.stdout.write(data)
    })

    keypress(process.stdin)

    process.stdin.on('keypress', (ch, key) => {
      //console.log(key)
      var data = ''
      if (key && key.sequence) {
        data = key.sequence
      } else if (ch) {
        data = ch
      } else {
        console.log('error?', arguments)
      }
      this._terminalSubstream.write(data)
    })

    process.stdin.setRawMode(true)
    process.stdin.resume()

    this._client.on('data', (data) => {
      if (keypather.get(data, 'args') === 'substream::end') {
        process.exit(0)
      }
    })
    this._client.write({
      id: 1,
      event: 'terminal-stream',
      data: {
        dockHost: this._dockerHost,
        type: 'filibuster',
        containerId: this._dockerContainer,
        terminalStreamId: this._terminalSubstreamId,
        eventStreamId: this._terminalEventsSubstreamId
      }
    })
  }
}

module.exports = Terminal
