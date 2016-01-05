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
   * Fetch an instance object from API
   * @returns Promise - resolves:
   *   Immutable<Map>
   */
  fetchInstance () {
    var git = new Git()
    var instanceName;
    return git.fetchRepositoryInfo()
      .then((repoData) => {
        instanceName = this._computeInstanceName(repoData.branch, repoData.repoName)
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
        }).then(compose(Immutable, pluck('body[0]')))
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
        }).then(compose(Immutable, pluck('body')))
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
          url: ['/instances/', instance.get('id'), '/actions/start'].join('')
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
          url: ['/instances/', instance.get('id'), '/actions/stop'].join('')
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
          url: ['/instances/', instance.get('id'), '/actions/restart'].join('')
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
        var buildId = instance.get('build').get('id')
        return this._request({
          method: 'POST',
          url: ['/builds/', buildId, '/actions/copy'].join(''),
          qs: {
            deep: true
          }
        }).then(compose(Immutable, pluck('body')))
      })
      .then((body) => {
        // build the copied build
        return this._request({
          method: 'POST',
          url: ['/builds/', body.get('id'), '/actions/build'].join(''),
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
          url: ['/instances/', _instance.get('id')].join(''),
          body: {
            build: body.get('id')
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
