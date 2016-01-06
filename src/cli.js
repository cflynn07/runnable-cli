#!/usr/bin/env node

/**
 * @module lib/cli
 * @exports {Object} instanceOf CLI
 */
'use strict'

require('colors')

var defaults = require('101/defaults')
defaults(process.env, {
  RUNNABLE_API_HOST: 'https://api.runnable.io',
  RUNNABLE_WEB_HOST: 'https://runnable.io',
  RUNNABLE_CONTAINER_TLD: '.runnableapp.com'
})

var open = require('open')
var program = require('commander')

var ContainerLogs = require('./container-logs')
var Git = require('./git')
var Terminal = require('./terminal')
var Watcher = require('./watcher')
var api = require('./api')
var list = require('./list')
var output = require('./output')
var packageJSON = require('../package.json')
var status = require('./status')

/**
 * Main CLI class. The constructor function is the program entry point.
 */
class CLI {
  constructor () {
    program.version(packageJSON.version)

    program
      .command('logs')
      .description('Tail the stdout of a Runnable server')
      .action(this._cmdLogs)

    program
      .command('ssh')
      .description('Open a remote terminal session in a Runnable server')
      .action(this._cmdSSH)

    program
      .command('start')
      .description('Start a Runnable server')
      .action(this._cmdStart)

    program
      .command('stop')
      .description('Stop a Runnable server')
      .action(this._cmdStop)

    program
      .command('restart')
      .description('Restart a Runnable server')
      .action(this._cmdRestart)

    program
      .command('rebuild')
      .description('Rebuild a Runnable server')
      .action(this._cmdRebuild)

    program
      .command('list')
      .description('Fetch a list of Runnable servers')
      .action(this._cmdList.bind(this))

    program
      .command('status')
      .description('Show a Runnable server status')
      .option('-e', 'Show the Runnable server environment variables')
      .action(this._cmdStatus.bind(this))

    program
      .command('watch')
      .description('Watch a repository and automatically upload changed files to a Runnable server')
      .action(this._cmdWatch.bind(this))

    program
      .command('browse [runnable | server]')
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
    api.fetchInstance() // TODO: Add org and name args here for manual specification
      .then((instance) => {
        var containerLogs = new ContainerLogs(instance.container.dockerHost,
                                              instance.container.dockerContainer)
        containerLogs.fetchAndPipeToStdout()
      })
      .catch((err) => {
        console.log(err.message)
      })
  }

  /**
   * Open a remote terminal session in a Runnable server
   */
  _cmdSSH () {
    api.fetchInstance()
      .then((instance) => {
        var terminal = new Terminal(instance.container.dockerHost,
                                    instance.container.dockerContainer)
        terminal.fetchAndPipeToStdout()
      })
      .catch((err) => {
        console.log(err.message, err.stack)
      })
  }

  /**
   * Start a Runnable server
   */
  _cmdStart () {
    var stopSpinner = output.spinner()
    api.startInstance()
      .then(stopSpinner)
      .then((instance) => {
        output.general(output.instanceWebURL(instance) + '\n' + 'Starting container...')
      })
      .catch((err) => {
        console.log(err.message, err.stack)
      })
  }

  /**
   * Stop a Runnable server
   */
  _cmdStop () {
    var stopSpinner = output.spinner()
    api.stopInstance()
      .then(stopSpinner)
      .then((instance) => {
        output.general(output.instanceWebURL(instance) + '\n' + 'Stopping container...')
      })
      .catch((err) => {
        console.log(err.message, err.stack)
      })
  }

  /**
   * Restart a Runnable server
   */
  _cmdRestart () {
    var stopSpinner = output.spinner()
    api.restartInstance()
      .then(stopSpinner)
      .then((instance) => {
        output.general(output.instanceWebURL(instance) + '\n' + 'Restarting container...')
      })
      .catch((err) => {
        console.log(err.message, err.stack)
      })
  }

  /**
   * Rebuild a Runnable server
   */
  _cmdRebuild () {
    var stopSpinner = output.spinner()
    api.rebuildInstance()
      .then(stopSpinner)
      .then((instance) => {
        output.general(output.instanceWebURL(instance) + '\n' + 'Rebuilding container...')
      })
      .catch((err) => {
        console.log(err.message, err.stack)
      })
  }

  /**
   * Fetch a list of Runnable servers
   */
  _cmdList (options) {
    var stopSpinner = output.spinner()
    api.fetchInstances()
      .then(stopSpinner)
      .then(list.bind(list, options))
      .catch((err) => {
        console.log(err.message, err.stack)
      })
      .finally(stopSpinner)
  }

  /**
   * Open a Runnable page in the default browser
   * @param {String} target - Optional, [Runnable, Server]
   */
  _cmdBrowse (target) {
    // console.log('Opening a Runnable page in the default browser...'.magenta)
    // TODO handle ports
    var stopSpinner = output.spinner()
    api.fetchInstance()
      .then(stopSpinner)
      .then((instance) => {
        if (!target || target.toLowerCase() === 'runnable') {
          open(output.instanceWebURL(instance))
        } else if (target.toLowerCase() === 'server') {
          open(output.instanceServerURL(instance))
        }
      })
      .catch((err) => {
        console.log(err.message, err.stack)
      })
      .finally(stopSpinner)
  }

  /**
   * Show a Runnable server status
   */
  _cmdStatus (options) {
    var stopSpinner = output.spinner()
    api.fetchInstance()
      .then(stopSpinner)
      .then(status.bind(this, options))
      .catch((err) => {
        console.log(err.message, err.stack)
      })
      .finally(stopSpinner)
  }

  /**
   * Watch a repository and automatically upload changed files to a Runnable server
   */
  _cmdWatch () {
    var stopSpinner = output.spinner()
    api.fetchInstance()
      .then(stopSpinner)
      .then((instance) => {
        var watcher = new Watcher(instance)
        watcher.watch()
      })
  }
}

module.exports = new CLI()
