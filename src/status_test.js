/**
 * @module lib/status_test
 */

var test = require('unit.js')

var Status = require('./status')
var Table = require('./table')

// var instanceMock = require('../test-mocks/instance')

describe('lib/status.js', () => {
  it('load', () => {
    test
      .function(Status)
        .hasName('Status')
      .object(new Status())
        .isInstanceOf(Table)
  })

  describe('Status class', () => {
    describe('constructor', () => {
      var status = new Status({})
      test.object(status.instance).is({})
    })

    describe('_seedTableData', () => {
    })

    describe('output', () => {
    })
  })
/*
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
*/
})
