/**
 * @module lib/api
 * @exports {Object} API
 */
'use strict'

var Promise = require('bluebird')
var request = require('request')

var Git = require('./git')

class API {
  constructor () {
    var apiUrl = process.env.RUNNABLE_CLI_HOST || 'https://api.runnable.io'
    this._jar = request.jar()
    this._jar.setCookie(process.env.RUNNABLE_COOKIE, 'https://api.runnable.io')
    this._request = request.defaults({
      baseUrl: apiUrl,
      jar: this._jar,
      json: true
    })
    this._request = Promise.promisify(this._request)
    Promise.promisifyAll(this._request)
  }

  /**
   * Fetch instance object from API
   * @returns {Object} Promise, if successful, will resolve with object:
   *   - dockHost
   *   - containerId
   */
  fetchInstance () {
    var git = new Git()
    return git.fetchRepositoryInfo()
      .then((repoData) => {
        var instanceName = this._computeInstanceName(repoData.branch, repoData.repoName)
        return this._request({
          url: '/instances',
          qs: {
            githubUsername: repoData.orgName,
            name: instanceName
          }
        })
        .then((response) => {
          if (!response.body || !response.body.length) {
            throw new Error('Instance not found')
          }
          return response.body[0]
        })
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
      })
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
      })
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
      })
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
        var buildId = instance.build.id
        return this._request({
          method: 'POST',
          url: ['/builds/', buildId, '/actions/copy'].join(''),
          qs: {
            deep: true
          }
        })
      })
      .then((response) => {
        // build the copied build
        return this._request({
          method: 'POST',
          url: ['/builds/', response.body.id, '/actions/build'].join(''),
          body: {
            message: 'manual build',
            noCache: true
          }
        })
      })
      .then((response) => {
        // Update instance with the new build
        return this._request({
          method: 'PATCH',
          url: ['/instances/', _instance.id].join(''),
          body: {
            build: response.body.id
          }
        })
      })
  }

  /**
   * Generate Runnable instance name based on name pattern
   * @param {String} branch
   * @param {String} repo
   * @return String
   */
  _computeInstanceName (branch, repo) {
    if (branch === 'master') {
      return repo
    } else {
      return branch + '-' + repo
    }
  }
}

module.exports = new API()
