#!/usr/bin/env node

/**
 * @module lib/cli
 * @exports {Object} instanceOf CLI
 */
'use strict'

require('colors')

var Spinner = require('cli-spinner').Spinner
var open = require('open')
var program = require('commander')

var ContainerLogs = require('./container-logs')
var Git = require('./git')
var Terminal = require('./terminal')
var Watcher = require('./watcher')
var api = require('./api')
var list = require('./list')
var packageJSON = require('../package.json')
var status = require('./status')

/**
 * Main CLI class. The constructor function is the program entry point.
 */
class CLI {
  constructor () {
    program.version(packageJSON.version)

    Spinner.setDefaultSpinnerString(Spinner.spinners[9])
    this._spinner = new Spinner('%s '.magenta)

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
    api.startInstance()
      .then((instance) => {
        var output = ['https://runnable.io',
          instance.owner.username,
          instance.lowerName].join('/') + '\n'
        output += 'Starting container...'
        console.log(output.magenta)
      })
      .catch((err) => {
        console.log(err.message, err.stack)
      })
  }

  /**
   * Stop a Runnable server
   */
  _cmdStop () {
    api.stopInstance()
      .then((instance) => {
        var output = ['https://runnable.io',
          instance.owner.username,
          instance.lowerName].join('/') + '\n'
        output += 'Stopping container...'
        console.log(output.magenta)
      })
      .catch((err) => {
        console.log(err.message, err.stack)
      })
  }

  /**
   * Restart a Runnable server
   */
  _cmdRestart () {
    api.restartInstance()
      .then((instance) => {
        var output = ['https://runnable.io',
          instance.owner.username,
          instance.lowerName].join('/') + '\n'
        output += 'Restarting container...'
        console.log(output.magenta)
      })
      .catch((err) => {
        console.log(err.message, err.stack)
      })
  }

  /**
   * Rebuild a Runnable server
   */
  _cmdRebuild () {
    api.rebuildInstance()
      .then((instance) => {
        var output = ['https://runnable.io',
          instance.owner.username,
          instance.lowerName].join('/') + '\n'
        output += 'Rebuilding container...'
        console.log(output.magenta)
      })
      .catch((err) => {
        console.log(err.message, err.stack)
      })
  }

  /**
   * Fetch a list of Runnable servers
   */
  _cmdList (options) {
    this._spinner.start()
    api.fetchInstances()
      .then((instances) => {
        this._spinner.stop(true)
        return instances
      })
      .then(list.bind(list, options))
      .catch((err) => {
        this._spinner.stop(true)
        console.log(err.message, err.stack)
      })
  }

  /**
   * Open a Runnable page in the default browser
   * @param {String} target - Optional, [Runnable, Server]
   */
  _cmdBrowse (target) {
    // console.log('Opening a Runnable page in the default browser...'.magenta)
    // TODO handle ports
    this._spinner.start()
    api.fetchInstance()
      .then((instance) => {
        this._spinner.stop(true)
        if (!target || target.toLowerCase() === 'runnable') {
          open('https://runnable.io/' + instance.owner.username + '/' + instance.lowerName)
        } else if (target.toLowerCase() === 'server') {
          var url = 'http://' + instance.shortHash +
            '-' + instance.contextVersion.appCodeVersions[0].lowerRepo.split('/')[1] +
            '-staging-' +
            instance.owner.username + '.runnableapp.com'
          console.log(url)
          open(url)
        }
      })
      .catch((err) => {
        this._spinner.stop(true)
        console.log(err.message, err.stack)
      })
  }

  /**
   * Show a Runnable server status
   */
  _cmdStatus (options) {
    this._spinner.start()
    api.fetchInstance()
      .then((instance) => {
        this._spinner.stop(true)
        return instance
      })
      .then(status.bind(this, options))
      .catch((err) => {
        this._spinner.stop(true)
        console.log(err.message, err.stack)
      })
  }

  /**
   * Watch a repository and automatically upload changed files to a Runnable server
   */
  _cmdWatch () {
    this._spinner.start()
    api.fetchInstance()
      .then((instance) => {
        this._spinner.stop(true)
        var watcher = new Watcher(instance)
        watcher.watch()
      })
  }
}

module.exports = new CLI()
