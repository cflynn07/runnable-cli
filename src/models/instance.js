/**
 * Data model representing an instance resource
 * @module lib/models/instance
 * @exports Function
 */
'use strict'

var BaseModel = require('./base')

/**
 * Functionality related to instance resources
 */
class InstanceModel extends BaseModel {
  /**
   * Make properties immutable
   */
  constructor (data) {
    super(data)
  }

  /**
   * Generate the url of the instance page on Runnable
   * @return String
   */
  instanceWebURL () {
    return [
      process.env.RUNNABLE_WEB_HOST,
      this.get('owner.username'),
      this.get('lowerName')
    ].join('/')
  }

  /**
   * Generate the url of the instance server
   * @return String
   */
  instanceServerURL () {
    var lowerRepo = this.get('contextVersion.appCodeVersions[0].lowerRepo')
    lowerRepo = lowerRepo.split('/')[1]

    return [
      'http://',
      this.get('shortHash'),
      '-',
      lowerRepo,
      '-staging-',
      this.get('owner.username'),
      process.env.RUNNABLE_CONTAINER_TLD
    ].join('')
  }
}



/**
 * Instantiate and return an InstanceModel from provided data
 * @returns InstanceModel
 */
module.exports = (data) => {
  return new InstanceModel(data)
}
