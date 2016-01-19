/**
 * @module lib/list_test
 */
'use strict'

const test = require('unit.js')

const List = require('./list')

describe('src/list.js', () => {
  it('load', () => {
    test.function(List).hasName('List')
    test.object(new List()).isInstanceOf(List)
  })

  describe('List class', () => {
    beforeEach(() => {
    })

    afterEach(() => {
    })

    it('', () => {
    })
  })
})
