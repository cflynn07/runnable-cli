/**
 * @module lib/collections/instances
 */
'use strict'

const BaseCollection = require('./base')
const InstanceModel = require('../models/instance')

const basePath = '/instances'

class InstancesCollection extends BaseCollection {
  /**
   * Invoke superclass constructor method to set up collection of immutable instances
   */
  constructor (data) {
    super(data, InstanceModel)
  }

  /**
   * Factory method
   * Instantiate and return an InstancesCollection from provided data
   * @returns InstancesCollection
   */
  static instantiate (data) {
    return new InstancesCollection(data)
  }

  /**
   * Fetch instances collection from API
   * @param {String} githubUsername
   * @returns Promise - resolves:
   *   InstancesCollection
   */
  static fetch (githubUsername) {
    const queryOpts = {
      url: basePath,
      qs: {
        githubUsername: githubUsername.toLowerCase(),
        ignoredFields: 'contextVersions,build.log,contextVersion.build.log'
      }
    }
    return super.collectionResourceRequest(queryOpts)
      .then(InstancesCollection.instantiate)
  }
}

module.exports = InstancesCollection
