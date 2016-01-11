/**
 * Data model representing a user resource
 * @module lib/models/user
 * @exports UserModel
 */
'use strict'

var BaseModel = require('./base')

/**
 * Functionality related to instance resources
 */
class UserModel extends BaseModel {
  /**
   * Make properties immutable
   */
  constructor (data) {
    super(data)
  }

  /**
   * Factory method
   * Instantiate and return an InstanceModel from provided data
   * @returns InstanceModel
   */
  static instantiate (data) {
    return new UserModel(data)
  }
}

module.exports = UserModel
