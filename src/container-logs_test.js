/**
 * @module lib/container-logs_test
 */
'use strict'

const test = require('unit.js')

const ContainerLogs = require('./container-logs')

describe('src/container-logs.js', () => {
  it('load', () => {
    test.function(ContainerLogs).hasName('ContainerLogs')
    test.object(new ContainerLogs()).isInstanceOf(ContainerLogs)
  })

  describe('ContainerLogs class', () => {
    beforeEach(() => {
    })

    afterEach(() => {
    })

    it('', () => {
    })
  })
})
