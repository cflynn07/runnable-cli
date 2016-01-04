/**
 * @module lib/socket_test
 */

var Code = require('code')
var Lab = require('lab')

var socket = require('./socket')

var lab = exports.lab = Lab.script()

var describe = lab.describe
var expect = Code.expect
var it = lab.it

describe('lib/socket.js', () => {
  it('should return instance of Primus socket', (done) => {
    var sock = socket()
    expect(sock.constructor.name).to.equal('Primus')
    done()
  })
})
