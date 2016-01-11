/**
 * @module lib/collections/base
 * @exports BaseCollection
 */
'use strict'

var binarySearchInsert = require('binary-search-insert')

class BaseCollection {
  /**
   * @param {Array} data
   * @param {Object} model
   */
  constructor (data, model) {
    this.models = data.map((resource) => {
      return new model(resource)
    })
    Object.freeze(this.models)
  }

  /**
   * Return a sorted copy of the collection
   * @param {Function} comparator
   * @return Array<InstanceModel>
   */
  sort (comparator) {
    var sorted = []
    this.models.forEach(binarySearchInsert.bind(this, sorted, comparator))
    return sorted
  }
}

module.exports = BaseCollection
