/**
 * @module lib/api
 * @exports {Object} API
 */
'use strict'

var Immutable = require('seamless-immutable')
var Promise = require('bluebird')
var compose = require('101/compose')
var exists = require('101/exists')
var isString = require('101/is-string')
var pluck = require('101/pluck')
var request = require('request')

var Git = require('./git')
var InstanceModel = require('./models/instance')
var InstancesCollection = require('./collections/instances')
var packageJSON = require('../package.json')

class API {
  constructor () {
    this._jar = request.jar()
    this._jar.setCookie(process.env.RUNNABLE_COOKIE, process.env.RUNNABLE_API_HOST)
    this._request = request.defaults({
      baseUrl: process.env.RUNNABLE_API_HOST,
      headers: {
        'User-Agent': ['Runnable CLI', packageJSON.version].join(' ')
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
   * @param {String|Object} queryData
   * @returns Promise - resolves:
   *   Immutable<Map>
   */
  fetchInstance (queryData) {
    var url = '/instances/'
    var qs = {}
    if (isString(queryData)) {
      url += queryData
    } else {
      let instanceName = InstanceModel.instanceName(queryData.branch, queryData.repoName)
      qs = {
        githubUsername: queryData.orgName.toLowerCase(),
        name: instanceName.toLowerCase()
      }
    }
    return this._request({
      url: url,
      qs: qs
    })
    .then((response) => {
      var response = (Array.isArray(response.body)) ? response.body[0] : response.body
      if (!exists(response) || response.statusCode === 404) {
        throw new InstanceNotFoundError('Instance not found', queryData)
      }
      return response
    })
    .then(InstanceModel.instantiate)
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
        }).then(compose(InstancesCollection.instantiate, pluck('body')))
      })
  }

  /**
   *
   */
  startInstance (instance) {
    return this._request({
      method: 'PUT',
      url: ['/instances/', instance.get('id'), '/actions/start'].join('')
    }).then(compose(InstanceModel.instantiate, pluck('body')))
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

/**
 * No instance found for a given query
 * @param {String} message
 * @param {String|Object} queryData
 */
function InstanceNotFoundError (message, queryData) {
  this.message = message
  this.queryData = queryData
}
InstanceNotFoundError.prototype = Object.create(Error.prototype)

module.exports = API
module.exports.errors = Object.freeze({
  InstanceNotFoundError: InstanceNotFoundError
})
