/**
 * @module lib/container-logs
 * @exports {Function} ContainerLogs
 */
'use strict'

var Primus = require('primus')
var Promise = require('bluebird')
var http = require('http')
var substream = require('substream')

class ContainerLogs {
  /**
   * @param {String} dockerHost
   * @param {String} dockerContainer
   */
  constructor (dockerHost, dockerContainer) {
    this._dockerHost = dockerHost
    this._dockerContainer = dockerContainer
    var server = http.createServer()
    var primus = new Primus(server, {
      transformer: 'websockets',
      parser: 'JSON',
      plugin: {
        substream: substream
      }
    })
    this._client = new primus.Socket('https://api.runnable.io?token=' +
                                     process.env.RUNNABLE_SOCKET_TOKEN)
    this._logStream = this._client.substream(1)
  }
  /**
   * Fetch a running containers stdout stream and pipe to process.stdout
   * @param {String} dockerHost
   * @param {String} dockerContainer
   */
  fetchAndPipeToStdout () {
    this._client.on('data', (data) => {
      if (!data.args) { return; }
      process.stdout.write(this._convertHexToASCII(data.args))
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
    for(var i = 0, len = hexString.length; i < len; i += 2) {
      str += String.fromCharCode(parseInt(hexString.substr(i, 2), 16))
    }
    return str
  }
}

module.exports = ContainerLogs
