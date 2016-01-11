/**
 * Data model representing an instance resource
 * @module lib/models/instance
 * @exports InstanceModel
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

  /**
   * Generate Runnable instance name based on git data and naming pattern
   * @param {String} branch
   * @param {String} repo
   * @return String
   */
  static instanceName (branch, repo) {
    if (branch === 'master') {
      return repo
    }
    return branch + '-' + repo
  }

  /**
   * Factory method
   * Instantiate and return an InstanceModel from provided data
   * @returns InstanceModel
   */
  static instantiate (data) {
    return new InstanceModel(data)
  }
}

module.exports = InstanceModel
