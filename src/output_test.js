/**
 * @module src/output_test
 */
'use strict'

const Spinner = require('cli-spinner').Spinner
const test = require('unit.js')

const Output = require('./output')

describe('src/output.js', () => {
  var output

  beforeEach(() => {
    output = new Output()
  })

  it('load', () => {
    test.function(Output).hasName('Output')
    test.object(new Output()).isInstanceOf(Output)
  })

  describe('Output class', () => {
    describe('constructor', () => {
      beforeEach(() => {
        test.stub(Spinner, 'setDefaultSpinnerString')
      })

      afterEach(() => {
        Spinner.setDefaultSpinnerString.restore()
      })

      it('should set default spinner', () => {
        test.object(new Output()).isInstanceOf(Output)
        test.sinon.assert.calledOnce(Spinner.setDefaultSpinnerString)
        test.sinon.assert.calledWith(Spinner.setDefaultSpinnerString, Spinner.spinners[9])
      })
    })

    describe('Output.prototype.spinner', () => {
      beforeEach(() => {
        test.stub(Spinner.prototype, 'start')
        test.stub(Spinner.prototype, 'stop')
        test.stub(console, 'log')
      })

      afterEach(() => {
        Spinner.prototype.start.restore()
        Spinner.prototype.stop.restore()
        console.log.restore()
      })

      it('should start a spinner and return a spinner cancel function', () => {
        const stopSpin = output.spinner('%s')
        test.sinon.assert.calledOnce(Spinner.prototype.start)
        test.value(output.currentSpinnerStop).is(stopSpin)
        test.sinon.assert.notCalled(Spinner.prototype.stop)
      })

      it('cancel function should stop spinner, optionally clear, only run one time', () => {
        const stopSpin = output.spinner('%s', 'final message', true)

        // stopSpin returns arguments that were passed to it
        var arg1 = {}
        var stopSpinResponseArg = stopSpin(arg1)
        test.value(stopSpinResponseArg).is(arg1)
        test.sinon.assert.calledOnce(Spinner.prototype.stop)
        test.sinon.assert.calledWith(Spinner.prototype.stop, true)
        test.sinon.assert.calledOnce(console.log)
        test.sinon.assert.calledWith(console.log, test.sinon.match.string)

        // stopSpin shouldn't cancel spinner or output more than once
        arg1 = {}
        stopSpinResponseArg = stopSpin(arg1)
        test.value(stopSpinResponseArg).is(arg1)
        test.sinon.assert.calledOnce(Spinner.prototype.stop)
        test.sinon.assert.calledOnce(console.log)
      })
    })

    describe('Output.prototype.toStdOut', () => {
    })

    describe('Output.prototype.colorize', () => {
    })
  })
})
