/**
 * @module lib/collections/instances
 */
'use strict'

var BaseCollection = require('./base')
var InstanceModel = require('../models/instance')

class InstancesCollection extends BaseCollection {
  /**
   * Invoke superclass constructor method to set up collection of immutable instances
   */
  constructor (data) {
    super(data, InstanceModel)
  }
}

/**
 * Instantiate and return an InstancesCollection from provided data
 * @returns InstancesCollection
 */
module.exports = (data) => {
  return new InstancesCollection(data)
}
