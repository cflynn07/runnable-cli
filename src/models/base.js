/**
 * Base class for shared model logic
 * @module lib/models/base
 * @exports BaseModel
 */
'use strict'

var Immutable = require('seamless-immutable')
var keypather = require('keypather')()

const API = require('../api')

class BaseModel extends API {
  /**
   * Invoke superclass constructor method to set up immutable instance
   */
  constructor (data) {
    super()
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
}

module.exports = BaseModel
