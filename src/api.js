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

var InstanceModel = require('./models/instance')
var InstancesCollection = require('./collections/instances')
var UserModel = require('./models/user')
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
   * Fetch a user object from API
   * @return Promise - resolves:
   *   UserModel
   */
  fetchUser () {
    return this._request({
      url: '/users/me'
    })
    .then((response) => {
      if (!exists(response.body) || response.body.statusCode === 404) {
        throw new UserNotFoundError()
      }
      return response.body
    })
    .then(UserModel.instantiate)
  }

  /**
   * Fetch an instance object from API
   * @param {String|Object} queryData
   * @returns Promise - resolves:
   *   InstanceModel
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
      response = (Array.isArray(response.body)) ? response.body[0] : response.body
      if (!exists(response) || response.statusCode === 404) {
        throw new InstanceNotFoundError('Instance not found', queryData)
      }
      return response
    })
    .then(InstanceModel.instantiate)
  }

  /**
   * Fetch collection of instances from API
   * @param {String} githubUsername
   * @return Promise - resolves:
   *   InstanceCollection
   */
  fetchInstances (githubUsername) {
    return this._request({
      url: '/instances',
      qs: {
        githubUsername: githubUsername.toLowerCase(),
        ignoredFields: 'contextVersions,build.log,contextVersion.build.log'
      }
    }).then(compose(InstancesCollection.instantiate, pluck('body')))
  }

  /**
   * @param {InstanceModel} instance
   */
  startInstance (instance) {
    return this._request({
      method: 'PUT',
      url: ['/instances/', instance.get('id'), '/actions/start'].join('')
    }).then(compose(InstanceModel.instantiate, pluck('body')))
  }

  /**
   * @param {InstanceModel} instance
   */
  stopInstance (instance) {
    return this._request({
      method: 'PUT',
      url: ['/instances/', instance.get('id'), '/actions/stop'].join('')
    }).then(compose(InstanceModel.instantiate, pluck('body')))
  }

  /**
   * @param {InstanceModel} instance
   */
  restartInstance (instance) {
    return this._request({
      method: 'PUT',
      url: ['/instances/', instance.get('id'), '/actions/restart'].join('')
    }).then(compose(InstanceModel.instantiate, pluck('body')))
  }

  /**
   * @param {InstanceModel} instance
   */
  rebuildInstance (instance) {
    return this._request({
      method: 'POST',
      url: ['/builds/', instance.get('build.id'), '/actions/copy'].join(''),
      qs: {
        deep: true
      }
    })
    .then(compose(Immutable, pluck('body')))
    .then((build) => {
      // build the copied build
      return this._request({
        method: 'POST',
        url: ['/builds/', build.id, '/actions/build'].join(''),
        body: {
          message: 'manual build',
          noCache: true
        }
      }).then(compose(Immutable, pluck('body')))
    })
    .then((build) => {
      // Update instance with the new build
      return this._request({
        method: 'PATCH',
        url: ['/instances/', instance.get('id')].join(''),
        body: {
          build: build.id
        }
      }).then((response) => {
        if (response.body.statusCode > 300) {
          throw new Error(response.body)
        }
        // Return original instance
        return instance
      })
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

/**
 * No user found (unauthenticated)
 * @param {String} message
 */
function UserNotFoundError (message) {
  this.message = message
}

InstanceNotFoundError.prototype = Object.create(Error.prototype)
UserNotFoundError.prototype = Object.create(Error.prototype)

module.exports = API
module.exports.errors = Object.freeze({
  InstanceNotFoundError: InstanceNotFoundError,
  UserNotFoundError: UserNotFoundError
})
