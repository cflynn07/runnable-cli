/**
 * Base class for shared model logic
 */
'use strict'

var Immutable = require('seamless-immutable')
var keypather = require('keypather')()

class BaseModel {
  /**
   *
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
}

module.exports = BaseModel
