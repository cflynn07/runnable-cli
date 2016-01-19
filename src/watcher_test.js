/**
 * @module src/watcher_test
 */
'use strict'

const test = require('unit.js')

const Watcher = require('./watcher')

describe('src/watcher.js', () => {
  var watcher

  beforeEach(() => {
    watcher = new Watcher()
  })

  it('load', () => {
    test.function(Watcher).hasName('Watcher')
    test.object(new Watcher()).isInstanceOf(Watcher)
  })

  describe('Watcher class', () => {
    describe('constructor', () => {
      beforeEach(() => {
      })

      afterEach(() => {
      })
    })
  })
})
