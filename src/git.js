/**
 * @module lib/git
 * @exports {Function} Git
 */
'use strict'

var Promise = require('bluebird')
var find = require('101/find')
var hasKeypaths = require('101/has-keypaths')
var simpleGit = require('simple-git')

class Git {
  constructor () {
    this._simpleGit = simpleGit(process.cwd())
    this._simpleGit.getRemotes = Promise.promisify(this._simpleGit.getRemotes)
    this._simpleGit.revparse = Promise.promisify(this._simpleGit.revparse)
  }
  /**
   * Fetch repository info of cwd, returns formatted object with selected properties
   * @param {Function} cb
   * @returns {Object} Promise, if successful, will resolve with object:
   *   - branch: {String
   *   - orgName: {String}
   *   - repoName: {String}
   */
  fetchRepositoryInfo () {
    var fetchBranch = this._simpleGit.revparse(['--abbrev-ref', 'HEAD'])
      .then((status) => {
        return status.replace(/\n$/, '')
      })

    var fetchRemote = this._simpleGit.getRemotes(true)
      .then((remotes) => {
        var originRemote = find(remotes, hasKeypaths({name: 'origin'}))
        if (!originRemote) {
          throw new Error('No "origin" remote found for repository')
        }
        var matches = originRemote.refs.fetch.match(/(\:|\/)([A-z0-9-_]+)\/([A-z0-9-_]+)\.git$/)
        return {
          orgName: matches[2],
          repoName: matches[3]
        }
      })

    return Promise.join(fetchBranch, fetchRemote, (branch, remote) => {
      remote.branch = branch
      return remote
    })
  }
}

module.exports = Git
