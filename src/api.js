/**
 * @module lib/api
 * @exports {Function} API
 */
'use strict'

var Promise = require('bluebird')
var keypather = require('keypather')()
var path = require('path')
var request = require('request')

var Git = require('./git')

class API {
  constructor () {
    var apiUrl = process.env.RUNNABLE_CLI_HOST || 'https://api.runnable.io';
    this._jar = request.jar()
    this._jar.setCookie('connect.sid=s%3AyJNlxIhdkGgRCfpQEeai-V7KXIMDXC4r.xE4zX4GSZKL76N97M5gndfoU270BydeqRaHKMN3co3k; Domain=api.runnable.io; Path=/;', 'https://api.runnable.io')
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
  fetchInstanceInfo () {
    var git = new Git()

    return git.fetchRepositoryInfo()
      .then((repoData) => {
        return this._request({
          url: '/instances',
          qs: {
            githubUsername: repoData.orgName,
            name: repoData.branch + '-' + repoData.repoName
          }
        })
        .then((response) => {
          if (!response.body || !response.body.length) {
            throw new Error('Instance not found')
          }
          var instance = response.body[0]
          var instanceData = {
            dockerContainer: keypather.get(instance, 'container.dockerContainer'),
            dockerHost: keypather.get(instance, 'container.dockerHost')
          }
          if (!instanceData.dockerContainer) {
            throw new Error('Instance does not have a container')
          }
          return instanceData
        })
      })
  }
}

module.exports = new API()