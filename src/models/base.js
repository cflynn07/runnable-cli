/**
 * Base class for shared model logic
 * @module lib/models/base
 * @exports BaseModel
 */
'use strict'

const Immutable = require('seamless-immutable')
const exists = require('101/exists')
const keypather = require('keypather')()

const httpClient = require('../http-client')

class BaseModel {
  /**
   * Invoke superclass constructor method to set up immutable instance
   */
  constructor (data) {
    this.attrs = Immutable(data)
    Object.freeze(this.attrs)
  }

  /**
   * Return a value at a given keypath
   * @param {String} keyPath
   */
  get (keyPath) {
    return keypather.get(this.attrs, keyPath)
  }

  /**
   * Centralized API resource request handling
   * @param {Object} queryOpts
   */
  static instanceResourceRequest (queryOpts) {
    return httpClient(queryOpts)
      .then((response) => {
        if (!exists(response) || response.statusCode === 404) {
          throw new Error(queryOpts)
        }
        return (Array.isArray(response.body)) ? response.body[0] : response.body
      })
  }
}

module.exports = BaseModel
