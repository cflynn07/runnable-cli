/**
 * Data model representing an instance resource
 * @module lib/models/instance
 * @exports Function
 */
'use strict'

var Immutable = require('seamless-immutable')

var BaseModel = require('./base')

/**
 * Functionality related to instance resources
 */
class InstanceModel extends BaseModel {
  attrs: null

  /**
   * Make properties immutable
   */
  constructor (data) {
    this.attrs = Immutable(data)
    Object.freeze(this.attrs)
  }
}

/**
 * Instantiate and return an InstanceModel from provided data
 * @returns @InstanceModel
 */
module.exports = (data) => {
  return new InstanceModel(data)
}
