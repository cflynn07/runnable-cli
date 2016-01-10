/**
 * @module lib/api
 * @exports {Object} API
 */
'use strict'

var Immutable = require('seamless-immutable')
var Promise = require('bluebird')
var compose = require('101/compose')
var pluck = require('101/pluck')
var request = require('request')

var Git = require('./git')
var InstanceModel = require('./models/instance')
var InstancesCollection = require('./collections/instances')
var output = require('./output')
var packageJSON = require('../package.json')

class API {
  constructor () {
    this._jar = request.jar()
    this._jar.setCookie(process.env.RUNNABLE_COOKIE, process.env.RUNNABLE_API_HOST)
    this._request = request.defaults({
      baseUrl: process.env.RUNNABLE_API_HOST,
      headers: {
        'User-Agent': ['Runnable CLI',  packageJSON.version].join(' ')
      },
      jar: this._jar,
      json: true,
      rejectUnauthorized: false,
      strictSSL: false
    })
    this._request = Promise.promisify(this._request)
    Promise.promisifyAll(this._request)
  }

  /**
   * Fetch an instance object from API
   * @returns Promise - resolves:
   *   Immutable<Map>
   */
  fetchInstance () {
    var git = new Git()
    var instanceName;
    return git.fetchRepositoryInfo()
      .then((repoData) => {
        instanceName = output.instanceName(repoData.branch, repoData.repoName)
        return this._request({
          url: '/instances',
          qs: {
            githubUsername: repoData.orgName.toLowerCase(),
            name: instanceName.toLowerCase()
          }
        })
        .then((response) => {
          if (!response.body || !response.body.length) {
            throw new Error('Instance not found: ' +
                            repoData.orgName.toLowerCase() + '/' + instanceName.toLowerCase())
          }
          return response
        }).then(compose(InstanceModel, pluck('body[0]')))
      })
  }

  /**
   * Fetch collection of instances from API
   * @return Promise - resolves:
   *   Immutable<Set>
   */
  fetchInstances () {
    var git = new Git()
    return git.fetchRepositoryInfo()
      .then((repoData) => {
        return this._request({
          url: '/instances',
          qs: {
            githubUsername: repoData.orgName.toLowerCase(),
            ignoredFields: 'contextVersions,build.log,contextVersion.build.log'
          }
        }).then(compose(InstancesCollection, pluck('body')))
      })
  }

  /**
   *
   */
  startInstance () {
    return this.fetchInstance()
      .then((instance) => {
        return this._request({
          method: 'PUT',
          url: ['/instances/', instance.id, '/actions/start'].join('')
        })
      }).then(compose(Immutable, pluck('body')))
  }

  /**
   *
   */
  stopInstance () {
    return this.fetchInstance()
      .then((instance) => {
        return this._request({
          method: 'PUT',
          url: ['/instances/', instance.id, '/actions/stop'].join('')
        })
      }).then(compose(Immutable, pluck('body')))
  }

  /**
   *
   */
  restartInstance () {
    return this.fetchInstance()
      .then((instance) => {
        return this._request({
          method: 'PUT',
          url: ['/instances/', instance.id, '/actions/restart'].join('')
        })
      }).then(compose(Immutable, pluck('body')))
  }

  /**
   *
   */
  rebuildInstance () {
    var _instance
    return this.fetchInstance()
      .then((instance) => {
        // Perform a deep copy of the build
        _instance = instance
        return this._request({
          method: 'POST',
          url: ['/builds/', instance.build.id, '/actions/copy'].join(''),
          qs: {
            deep: true
          }
        }).then(compose(Immutable, pluck('body')))
      })
      .then((body) => {
        // build the copied build
        return this._request({
          method: 'POST',
          url: ['/builds/', body.id, '/actions/build'].join(''),
          body: {
            message: 'manual build',
            noCache: true
          }
        }).then(compose(Immutable, pluck('body')))
      })
      .then((body) => {
        // Update instance with the new build
        return this._request({
          method: 'PATCH',
          url: ['/instances/', _instance.id].join(''),
          body: {
            build: body.id
          }
        }).then((response) => {
          if (response.body.statusCode > 300) {
            throw new Error(response.body)
          }
          return response
        }).then(compose(Immutable, pluck('body')))
      })
  }

  /**
   *
   */
  updateInstanceFile (instanceId, containerId, lowerRepoName, relativePath, contents) {
    return this._request({
      method: 'PATCH',
      url: ['instances', instanceId, 'containers', containerId,
        'files', lowerRepoName, relativePath].join('/'),
      body: {
        body: contents
      }
    })
  }

  /**
   *
   */
  deleteInstanceFile () {
  }
}

module.exports = new API()
