/**
 * @module lib/git_test
 */
'use strict'

const test = require('unit.js')

const Git = require('./git')

describe('src/git.js', () => {
  it('load', () => {
    test.function(Git).hasName('Git')
    test.object(new Git()).isInstanceOf(Git)
  })

  describe('Git class', () => {
    beforeEach(() => {
    })

    afterEach(() => {
    })

    it('', () => {
    })
  })
})
