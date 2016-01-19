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

const ErrorGitNoRepo = require('./errors/git-no-repo.js')

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
    return Promise.coroutine(function *() {
      const branch = yield this._simpleGit.revparse(['--abbrev-ref', 'HEAD'])
      const remotes = yield this._simpleGit.getRemotes(true)
      const originRemote = find(remotes, hasKeypaths({name: 'origin'}))
      if (!originRemote) { throw new Error('No "origin" remote found for repository') }
      const originRegexMatches = originRemote.refs.fetch
        .match(/(\:|\/)([A-z0-9-_]+)\/([A-z0-9-_]+)(\.git|)$/)
      return {
        branch: branch.replace(/\n$/, ''),
        orgName: originRegexMatches[2],
        repoName: originRegexMatches[3]
      }
    }.bind(this))()
      .catch(this._handleError)
  }

  /**
   * Check if a filepath is ignored by git according to .gitignore rules. Accounts for .gitignore
   * files in repository subdirectories.
   * @param {String} relativePath - relative path of file from repository root
   * @return Promise - will resolve Boolean
   */
  checkIgnore (relativePath) {
    return Promise.coroutine(function *() {
      const ignoredFiles = yield this._simpleGit.checkIgnore(relativePath)
      return compose(Boolean, pluck('length'))(ignoredFiles)
    }.bind(this))()
      .catch(this._handleError)
  }

  /**
   * @throws
   * @param {Error} err
   */
  _handleError (err) {
    if (/^fatal: Not a git repository/.test(err.message)) {
      throw new ErrorGitNoRepo(err.message)
    }
  }
}

module.exports = Git
