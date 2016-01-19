/**
 * @module lib/socket_test
 */
'use strict'

const test = require('unit.js')

const Primus = require('primus')
const http = require('http')
const socket = require('./socket')

describe('src/socket.js', () => {
  it('load', () => {
    test.value(socket).isFunction()
  })

  describe('export function ', () => {
    beforeEach(() => {
      test.stub(http, 'createServer').returns({})
    })

    afterEach(() => {
      http.createServer.restore()
    })

    it('should return new instance of primus Socket', () => {
      socket()
      test.sinon.assert.calledOnce(http.createServer)
    })
  })
})
