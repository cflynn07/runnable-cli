/**
 * @module lib/status_test
 */

const test = require('unit.js')

const Status = require('./status')
const Table = require('./table')
const InstanceModel = require('./models/instance')

describe('lib/status.js', () => {
  var instance
  var status

  beforeEach(() => {
    instance = new InstanceModel({})
    status = new Status(instance)
  })

  it('load', () => {
    test
      .function(Status)
        .hasName('Status')
      .object(new Status())
        .isInstanceOf(Status)
        .isInstanceOf(Table)
  })

  describe('Status class', () => {
    describe('constructor', () => {
      it('should initialize instance properties', () => {
        test.object(status.instance).is(instance)
      })
    })

    describe('_seedTableData', () => {
      beforeEach(() => {
        test.stub(status, '_pushRow')
        test.stub(instance, 'get')
      })

      afterEach(() => {
        status._pushRow.restore()
        instance.get.restore()
      })

      it('should push rows with instance data onto table array', () => {
        status._seedTableData(instance)
        const instanceStatusKeys = [
          'branch name',
          'cid',
          'created by',
          'github commit',
          'open ports',
          'status',
          'uptime'
        ]
        test.sinon.assert.callCount(instance.get, instanceStatusKeys.length)
        test.sinon.assert.callCount(status._pushRow, instanceStatusKeys.length)
        instanceStatusKeys.forEach((val, i) => {
          test.sinon.assert.calledWith(instance.get.getCall(i, val))
          test.sinon.assert.calledWith(status._pushRow.getCall(i, val))
        })
      })
    })

    describe('output', () => {
      beforeEach(() => {
        test.stub(status, '_seedTableData')
      })

      afterEach(() => {
        status._seedTableData.restore()
      })

      it('should seed data and call the parent class output method', () => {
        status.output()
        test.sinon.assert.calledOnce(status._seedTableData)
        test.sinon.assert.calledWith(status._seedTableData, instance)
      })
    })
  })
})
