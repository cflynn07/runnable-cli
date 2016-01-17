/**
 * Data model representing a user resource
 * @module lib/models/user
 * @exports UserModel
 */
'use strict'

const BaseModel = require('./base')

const basePath = '/users'

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

  /**
   * Fetch a user object from API
   * @returns Promise - resolves:
   *   UserModel
   */
  static fetch () {
    const queryOpts = {
      url: [basePath, 'me'].join('/')
    }
    return super.resourceRequest(queryOpts)
      .then(UserModel.instantiate)
  }
}

module.exports = UserModel
