#!/usr/bin/env node

/**
 * @module lib/cli
 * @exports {Object} instanceOf CLI
 */
'use strict'

require('babel-polyfill')
require('loadenv')()

const defaults = require('101/defaults')
defaults(process.env, {
  RUNNABLE_API_HOST: 'https://api.runnable.io',
  RUNNABLE_WEB_HOST: 'https://runnable.io',
  RUNNABLE_CONTAINER_TLD: '.runnableapp.com'
})

const Promise = require('bluebird')
const isString = require('101/is-string')
const open = require('open')
const program = require('commander')

const ContainerLogs = require('./container-logs')
const ErrorGitNoRepo = require('./errors/git-no-repo.js')
const ErrorInstance404 = require('./errors/instance-404')
const Git = require('./git')
const InstanceModel = require('./models/instance')
const InstancesCollection = require('./collections/instances')
const List = require('./list')
const Output = require('./output')
const Status = require('./status')
const Terminal = require('./terminal')
const UserModel = require('./models/user')
const Watcher = require('./watcher')
const error = require('./error')
const packageJSON = require('../package.json')

/**
 * Main CLI class. The constructor function is the program entry point.
 */
class CLI extends Output {
  constructor () {
    super()

    program.version(packageJSON.version)

    program
      .command('logs [id]')
      .description('Tail the stdout of a Runnable server')
      .action(this._cmdLogs.bind(this))

    program
      .command('ssh [id]')
      .description('Open a remote terminal session in a Runnable server')
      .action(this._cmdSSH.bind(this))

    program
      .command('start [id]')
      .description('Start a Runnable server')
      .action(this._cmdStart.bind(this))

    program
      .command('stop [id]')
      .description('Stop a Runnable server')
      .action(this._cmdStop.bind(this))

    program
      .command('restart [id]')
      .description('Restart a Runnable server')
      .action(this._cmdRestart.bind(this))

    program
      .command('rebuild [id]')
      .description('Rebuild a Runnable server')
      .action(this._cmdRebuild.bind(this))

    program
      .command('list')
      .description('Fetch a list of Runnable servers')
      .action(this._cmdList.bind(this))

    program
      .command('status [id]')
      .description('Show a Runnable server status')
      .option('-e', 'Show the Runnable server environment variables')
      .action(this._cmdStatus.bind(this))

    program
      .command('watch')
      .description('Watch a repository and automatically upload changed files to a Runnable server')
      .action(this._cmdWatch.bind(this))

    program
      .command('browse [id] [runnable | server]')
      .description('Open a Runnable page in the default browser')
      .action(this._cmdBrowse.bind(this))

    program
      .command('*')
      .action(function () { program.help() })

    program.parse(process.argv)

    if (!program.args.length) {
      program.help()
    }
  }

  /**
   * Tail the stdout of a Runnable server.
   */
  _cmdLogs () {
    var stopSpinner = this.spinner()
    this._fetchInstance()
      .then((instance) => {
        stopSpinner()
        new ContainerLogs(instance.get('container.dockerHost'),
                          instance.get('container.dockerContainer'))
          .fetchAndPipeToStdout()
      })
      .catch(error)
      .finally(stopSpinner)
  }

  /**
   * Open a remote terminal session in a Runnable server
   * @param {String|undefined} id - instance shortHash
   */
  _cmdSSH (id) {
    var stopSpinner = this.spinner()
    this._fetchInstance(id)
      .then((instance) => {
        stopSpinner()
        new Terminal(instance.get('container.dockerHost'),
                     instance.get('container.dockerContainer'))
          .fetchAndPipeToStdout()
      })
      .catch(error)
      .finally(stopSpinner)
  }

  /**
   * Start a Runnable server
   * @param {String|undefined} id - instance shortHash
   */
  _cmdStart (id) {
    var stopSpinner = this.spinner()
    this._fetchInstance(id)
      .then((instance) => {
        return instance.start()
      })
      .then((instance) => {
        stopSpinner()
        this.toStdOut([
          instance.webURL(),
          'Starting server...'
        ].join('\n'))
      })
      .catch(error)
      .finally(stopSpinner)
  }

  /**
   * Stop a Runnable server
   * @param {String|undefined} id - instance shortHash
   */
  _cmdStop (id) {
    var stopSpinner = this.spinner()
    this._fetchInstance(id)
      .then((instance) => {
        return instance.stop()
      })
      .then((instance) => {
        stopSpinner()
        this.toStdOut([
          instance.webURL(),
          'Stopping server...'
        ].join('\n'))
      })
      .catch(error)
      .finally(stopSpinner)
  }

  /**
   * Restart a Runnable server
   * @param {String|undefined} id - instance shortHash
   */
  _cmdRestart (id) {
    var stopSpinner = this.spinner()
    this._fetchInstance(id)
      .then((instance) => {
        return instance.restart()
      })
      .then((instance) => {
        stopSpinner()
        this.toStdOut([
          instance.webURL(),
          'Restarting server...'
        ].join('\n'))
      })
      .catch(error)
      .finally(stopSpinner)
  }

  /**
   * Rebuild a Runnable server
   * @param {String|undefined} id - instance shortHash
   */
  _cmdRebuild (id) {
    var stopSpinner = this.spinner()
    this._fetchInstance(id)
      .then((instance) => {
        return instance.rebuild()
      })
      .then((instance) => {
        stopSpinner()
        this.toStdOut([
          instance.webURL(),
          'Rebuilding server...'
        ].join('\n'))
      })
      .catch(error)
      .finally(stopSpinner)
  }

  /**
   * Fetch a list of Runnable servers
   */
  _cmdList (options) {
    var stopSpinner = this.spinner()
    var git = new Git()
    git.fetchRepositoryInfo()
      .catch(Git.errors.NotAGitRepoError, () => {
        return UserModel.fetch()
      })
      .then((data) => {
        if (data instanceof UserModel) {
          // catch handler for fetchRepositoryInfo invoked, returned UserModel fetch promise
          return data.get('accounts.github.username')
        } else {
          return data.orgName
        }
      })
      .then(InstancesCollection.fetch)
      .then((instances) => {
        stopSpinner()
        new List(instances).output()
      })
      .catch(error)
      .finally(stopSpinner)
  }

  /**
   * Open a Runnable page in the default browser
   * @param {String} target - Optional, [Runnable, Server]
   */
  _cmdBrowse (id, target) {
    if (id) {
      let lowerID = id.toLowerCase()
      if (lowerID === 'server' || lowerID === 'runnable') {
        target = id
        id = null
      }
    }
    // console.log('Opening a Runnable page in the default browser...'.magenta)
    // TODO handle ports
    var stopSpinner = this.spinner()
    this._fetchInstance(id)
      .then((instance) => {
        stopSpinner()
        var url
        if (!target || target.toLowerCase() === 'runnable') {
          url = instance.webURL()
        } else if (target.toLowerCase() === 'server') {
          url = instance.serverURL()
        }
        open(url)
        this.toStdOut(url)
      })
      .catch(error)
      .finally(stopSpinner)
  }

  /**
   * Show a Runnable server status
   * @param {String|undefined} id - instance shortHash
   */
  _cmdStatus (id, options) {
    var stopSpinner = this.spinner()
    this._fetchInstance(id)
      .then((instance) => {
        stopSpinner()
        var status = new Status(instance)
        status.output()
      })
      .catch(error)
      .finally(stopSpinner)
  }

  /**
   * Watch a repository and automatically upload changed files to a Runnable server
   */
  _cmdWatch () {
    var stopSpinner = this.spinner()
    this._fetchInstance()
      .then((instance) => {
        stopSpinner()
        var watcher = new Watcher(instance)
        watcher.watch()
      })
  }

  /**
   * Fetch instance from cli-supplied instance shorthHash or local repository data
   * @param {String|undefined} id - instance shortHash
   * @returns Promise
   */
  _fetchInstance (id) {
    const handleErrorGitNoRepo = (err) => {
      this.toStdOut('Not a git repository: ' + process.cwd())
      throw err
    }

    const handleErrorInstance404 = (err) => {
      var instanceIdentifier = (isString(err.queryData)) ? err.queryData
        : [
          err.queryData.orgName,
          InstanceModel.instanceName(err.queryData.branch, err.queryData.repoName)
        ].join('/')
      this.toStdOut('Instance not found: ' + instanceIdentifier)
      throw err
    }

    return Promise.coroutine(function*() {
      const git = new Git()
      const instanceQuery = yield git.fetchRepositoryInfo()
        .catch(Git.errors.NotAGitRepoError, (err) => {
          // If this is not a git repo, and no branch was specified, throw error
          if (!id) throw err
          return id
        })
      return InstanceModel.fetch(instanceQuery)
    })()
    .catch(ErrorGitNoRepo, handleErrorGitNoRepo)
    .catch(ErrorInstance404, handleErrorInstance404)
  }
}

module.exports = new CLI()
