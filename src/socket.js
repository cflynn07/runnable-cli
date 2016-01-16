/**
 * Create new Primus client instance
 * @module lib/socket
 * @exports {Function}
 */

const Primus = require('primus')
const http = require('http')
const substream = require('substream')

/**
 * Creates new Primus client instance
 * @return Object primus instance
 */
module.exports = () => {
  var server = http.createServer()
  var primus = new Primus(server, {
    transformer: 'websockets',
    parser: 'JSON',
    plugin: {
      substream: substream
    }
  })
  return new primus.Socket('https://api.runnable.io?token=' +
                            process.env.RUNNABLE_SOCKET_TOKEN)
}
