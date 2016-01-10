/**
 * @module lib/collections/base
 * @exports BaseCollection
 */
'use strict'

class BaseCollection {
  /**
   * @param {Array} data
   * @param {Object} model
   */
  constructor (data, model) {
    this.models = data.map((resource) => {
      return model(resource)
    })
    Object.freeze(this.models)
  }
}

module.exports = BaseCollection
