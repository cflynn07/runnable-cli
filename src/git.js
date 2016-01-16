/**
 * @module lib/git
 * @exports {Function} Git
 */
'use strict'

const Promise = require('bluebird')
const compose = require('101/compose')
const find = require('101/find')
const hasKeypaths = require('101/has-keypaths')
const pluck = require('101/pluck')
const simpleGit = require('simple-git')

class Git {
  constructor () {
    this._simpleGit = simpleGit(process.cwd())
    this._simpleGit.checkIgnore = Promise.promisify(this._simpleGit.checkIgnore)
    this._simpleGit.getRemotes = Promise.promisify(this._simpleGit.getRemotes)
    this._simpleGit.revparse = Promise.promisify(this._simpleGit.revparse)
  }
  /**
   * Fetch repository info of cwd, returns formatted object with selected properties
   * @param {Function} cb
   * @returns Promise - will resolve object:
   *   - branch: {String
   *   - orgName: {String}
   *   - repoName: {String}
   */
  fetchRepositoryInfo () {
    var fetchBranch = this._simpleGit.revparse(['--abbrev-ref', 'HEAD'])
      .then((status) => {
        return status.replace(/\n$/, '')
      }, this._handleError)

    var fetchRemote = this._simpleGit.getRemotes(true)
      .then((remotes) => {
        var originRemote = find(remotes, hasKeypaths({name: 'origin'}))
        if (!originRemote) {
          throw new Error('No "origin" remote found for repository')
        }
        var matches = originRemote.refs.fetch.match(/(\:|\/)([A-z0-9-_]+)\/([A-z0-9-_]+)(\.git|)$/)
        return {
          orgName: matches[2],
          repoName: matches[3]
        }
      }, this._handleError)

    return Promise.join(fetchBranch, fetchRemote, (branch, remote) => {
      remote.branch = branch
      return remote
    })
  }

  /**
   * Check if a filepath is ignored by git according to .gitignore rules. Accounts for .gitignore
   * files in repository subdirectories.
   * @param {String} relativePath - relative path of file from repository root
   * @return Promise - will resolve Boolean
   */
  checkIgnore (relativePath) {
    return this._simpleGit.checkIgnore(relativePath)
      .then(compose(Boolean, pluck('length')))
  }

  /**
   * @throws
   * @param {Error} err
   */
  _handleError (err) {
    if (/^fatal: Not a git repository/.test(err.message)) {
      throw new NotAGitRepoError(err.message)
    }
  }
}

/**
 * Command run in a directory that is not a git repository
 * @param {String} message
 */
function NotAGitRepoError (message) {
  this.message = message
}
NotAGitRepoError.prototype = Object.create(Error.prototype)

module.exports = Git
module.exports.errors = Object.freeze({
  NotAGitRepoError: NotAGitRepoError
})
