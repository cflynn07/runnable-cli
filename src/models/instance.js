/**
 * Data model representing an instance resource
 * @module lib/models/instance
 * @exports InstanceModel
 */
'use strict'

const exists = require('101/exists')
const isString = require('101/is-string')

const BaseModel = require('./base')
const ErrorInstance404 = require('../errors/instance-404')

const basePath = '/instances'

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
  webURL () {
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
  serverURL () {
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
   * Extract and return an instance's repository name
   * @return String
   */
  repositoryName () {
    const repo = this.get('contextVersion.appCodeVersions[0].lowerRepo')
    if (!repo) { return '' }
    return repo.split('/')[1]
  }

  /**
   * Start this instance
   * Returns promise that will resolve with a new instance of InstanceModel if request successful
   * @returns Promise
   */
  start () {
    return this.constructor.instanceResourceRequest({
      method: 'PUT',
      url: [basePath, this.get('id'), 'actions/start'].join('/')
    })
    .then(InstanceModel.instantiate)
    .catch((err) => {
      console.log('err', err)
    })
  }

  /**
   * Stop this instance
   * Returns promise that will resolve with a new instance of InstanceModel if request successful
   * @returns Promise
   */
  stop () {
    return this.constructor.instanceResourceRequest({
      method: 'PUT',
      url: [basePath, this.get('id'), 'actions/stop'].join('/')
    })
    .then(InstanceModel.instantiate)
  }

  /**
   * Stop this instance
   * Returns promise that will resolve with a new instance of InstanceModel if request successful
   * @returns Promise
   */
  restart () {
    return this.constructor.instanceResourceRequest({
      method: 'PUT',
      url: [basePath, this.get('id'), 'actions/restart'].join('/')
    })
    .then(InstanceModel.instantiate)
  }

  /**
   * Rebuild this instance
   * Returns promise that will resolve with a new instance of InstanceModel if request successful
   * @returns Promise
   */
  rebuild () {
    return this.constructor.instanceResourceRequest({
      method: 'POST',
      url: ['/builds', this.get('build.id'), 'actions/copy'].join('/'),
      qs: {
        deep: true
      }
    })
    .then((build) => {
      // build the copied build
      return this.constructor.instanceResourceRequest({
        method: 'POST',
        url: ['/builds', build.id, 'actions/build'].join('/'),
        body: {
          message: 'manual build',
          noCache: true
        }
      })
    })
    .then((build) => {
      // Update instance with the new build
      return this.constructor.instanceResourceRequest({
        method: 'PATCH',
        url: [basePath, this.get('id')].join('/'),
        body: {
          build: build.id
        }
      }).then(InstanceModel.instantiate)
    })
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

  /**
   * Fetch an instance object from API
   * @param {String|Object} queryData
   * @returns Promise - resolves:
   *   InstanceModel
   */
  static fetch (queryData) {
    const queryOpts = {
      url: basePath
    }
    if (isString(queryData)) {
      // queryData is an instance shortHash
      queryOpts.url += '/' + queryData
    } else {
      let instanceName = InstanceModel.instanceName(queryData.branch, queryData.repoName)
      queryOpts.qs = {
        githubUsername: queryData.orgName.toLowerCase(),
        name: instanceName.toLowerCase()
      }
    }
    return super.instanceResourceRequest(queryOpts)
      .then(InstanceModel.instantiate)
      .catch((err) => {
        console.log('error?', err)
      })
  }
}

module.exports = InstanceModel
