/**
 * @module lib/terminal_test
 */
var Code = require('code')
var Lab = require('lab')

var Terminal = require('./terminal')

var lab = exports.lab = Lab.script()

var afterEach = lab.afterEach
var beforeEach = lab.beforeEach
var describe = lab.describe
var expect = Code.expect
var it = lab.it

describe('lib/terminal.js', () => {
  var terminal

  beforeEach((done) => {
    terminal = new Terminal('http://0.0.0.0:4342', '123456789')
    done()
  })

  afterEach((done) => {
    done()
  })

  it('should set private properties on instance on initialization', (done) => {
    expect(terminal._dockerHost).to.equal('http://0.0.0.0:4342')
    expect(terminal._dockerContainer).to.equal('123456789')
    done()
  })

  it('should bind to all events and emit substream init data', (done) => {
    terminal.fetchAndPipeToStdout()
    done()
  })
})
