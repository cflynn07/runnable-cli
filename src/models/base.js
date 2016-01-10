/**
 * Base class for shared model logic
 */
'use strict'

var keypather = require('keypather')()

class BaseModel {
  /**
   * Return a value at a given keypath
   * @param {String} keyPath
   */
  get (keyPath) {
    return keypather.get(this.attrs, keyPath)
  }
}

module.exports = BaseModel
