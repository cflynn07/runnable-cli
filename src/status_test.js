/**
 * @module lib/status_test
 */

require('colors')

var Lab = require('lab')
var clone = require('101/clone')
var moment = require('moment')
var sinon = require('sinon')

var status = require('./status')
var instanceMock = require('../test-mocks/instance')

var lab = exports.lab = Lab.script()

var afterEach = lab.afterEach
var beforeEach = lab.beforeEach
var describe = lab.describe
var it = lab.it

describe('lib/status.js', () => {
  beforeEach((done) => {
    sinon.stub(console, 'log')
    sinon.stub(moment, 'duration').returns({
      humanize: sinon.stub().returns('an hour')
    })
    done()
  })

  afterEach((done) => {
    console.log.restore()
    moment.duration.restore()
    done()
  })

  it('should output formatted table from instance object', (done) => {
    status({}, instanceMock)
    sinon.assert.calledTwice(console.log)
    sinon.assert.calledWith(console.log.firstCall,
                            'https://runnable.io/CodeNow/websocket-logic-logs-api'.magenta)
    sinon.assert.calledWith(console.log.secondCall, sinon.match.string)
    done()
  })

  it('should output formatted table from instance object if no ports specified', (done) => {
    var i2 = clone(instanceMock)
    delete i2.container.ports
    status({}, i2)
    sinon.assert.calledTwice(console.log)
    sinon.assert.calledWith(console.log.firstCall,
                            'https://runnable.io/CodeNow/websocket-logic-logs-api'.magenta)
    sinon.assert.calledWith(console.log.secondCall, sinon.match.string)
    done()
  })

  it('should output formatted table for instance and instance-envs if E flag spec', (done) => {
    status({ E: true }, instanceMock)
    sinon.assert.callCount(console.log, 4)
    sinon.assert.calledWith(console.log.firstCall,
                            'https://runnable.io/CodeNow/websocket-logic-logs-api'.magenta)
    sinon.assert.calledWith(console.log.secondCall, sinon.match.string)
    sinon.assert.calledWith(console.log.thirdCall, 'ENVIRONMENT VARIABLES'.magenta)
    sinon.assert.calledWith(console.log.getCall(3), sinon.match.string)
    done()
  })
})
