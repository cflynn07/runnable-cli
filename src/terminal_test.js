/**
 * @module src/terminal_test
 */
'use strict'

const test = require('unit.js')

const Terminal = require('./terminal')

describe('src/terminal.js', () => {
  var terminal

  beforeEach(() => {
    terminal = new Terminal()
  })

  it('load', () => {
    test.function(Terminal).hasName('Terminal')
    test.object(new Terminal()).isInstanceOf(Terminal)
  })

  describe('Terminal class', () => {
    describe('constructor', () => {
      beforeEach(() => {
      })

      afterEach(() => {
      })
    })
  })
})
