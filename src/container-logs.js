/**
 * @module lib/container-logs
 * @exports {Class} ContainerLogs
 */
'use strict'

var socket = require('./socket')

class ContainerLogs {
  /**
   * @param {String} dockerHost
   * @param {String} dockerContainer
   */
  constructor (dockerHost, dockerContainer) {
    this._dockerHost = dockerHost
    this._dockerContainer = dockerContainer
    this._client = socket()
    this._logStream = this._client.substream(1)
  }

  /**
   * Fetch a running containers stdout stream and pipe to process.stdout
   */
  fetchAndPipeToStdout () {
    this._client.on('data', (data) => {
      if (!data.args) { return }
      if (parseInt(data.args.substr(0, 2), 16) < 31) { return }
      console.log(this._convertHexToASCII(data.args).replace(/\n$/, ''))
    })
    this._client.write({
      id: 1,
      event: 'log-stream',
      data: {
        substreamId: this._dockerContainer,
        dockHost: this._dockerHost,
        containerId: this._dockerContainer
      }
    })
  }

  /**
   * Converts string of bytes represented in hexadecimal format to ASCII
   * @param {String} hexString
   * @return String
   */
  _convertHexToASCII (hexString) {
    hexString = hexString.toString()
    var str = ''
    for (var i = 0, len = hexString.length; i < len; i += 2) {
      str += String.fromCharCode(parseInt(hexString.substr(i, 2), 16))
    }
    return str
  }
}

module.exports = ContainerLogs
