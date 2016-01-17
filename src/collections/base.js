/**
 * @module lib/collections/base
 * @exports BaseCollection
 */
'use strict'

const binarySearchInsert = require('binary-search-insert')
const exists = require('101/exists')

const httpClient = require('../http-client')

class BaseCollection {
  /**
   * @param {Array} data
   * @param {Object} model
   */
  constructor (data, Model) {
    this.models = data.map((resource) => {
      return new Model(resource)
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

  /**
   * Centralized API collection request handling
   * @param {Object} queryOpts
   */
  static collectionResourceRequest (queryOpts) {
    return httpClient(queryOpts)
      .then((response) => {
        if (!exists(response) || response.statusCode === 404) {
          throw new Error(queryOpts)
        }
        if (!Array.isArray(response.body)) {
          throw new Error(queryOpts)
        }
        return response.body
      })
  }
}

module.exports = BaseCollection
