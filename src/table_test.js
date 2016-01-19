/**
 * @module src/table_test
 */
'use strict'

const test = require('unit.js')

const Table = require('./table')

describe('src/table.js', () => {
  var table

  beforeEach(() => {
    table = new Table()
  })

  it('load', () => {
    test.function(Table).hasName('Table')
    test.object(new Table()).isInstanceOf(Table)
  })

  describe('Table class', () => {
    describe('constructor', () => {
      beforeEach(() => {
      })

      afterEach(() => {
      })
    })
  })
})
