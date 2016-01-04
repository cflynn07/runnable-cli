#!/usr/bin/env node

/**
 * @module lib/cli
 * @exports {Object} instanceOf CLI
 */
'use strict'

require('colors')

var open = require('open')
var program = require('commander')

var ContainerLogs = require('./container-logs')
var Git = require('./git')
var Terminal = require('./terminal')
var api = require('./api')
var packageJSON = require('../package.json')
var status = require('./status')

/**
 * Main CLI class. The constructor function is the program entry point.
 */
class CLI {
  constructor () {
    program.version(packageJSON.version)

    program
      .command('logs', null, 'Tail the stdout of a Runnable server')
      .action(this._cmdLogs)

    program
      .command('ssh', null, 'Open a remote terminal session in a Runnable server')
      .action(this._cmdSSH)

    program
    .command('start', null, 'Start a Runnable server')
      .action(this._cmdStart)

    program
      .command('stop', null, 'Stop a Runnable server')
      .action(this._cmdStop)

    program
      .command('restart', null, 'Restart a Runnable server')
      .action(this._cmdRestart)

    program
      .command('rebuild', null, 'Rebuild a Runnable server')
      .action(this._cmdRebuild)

    program
      .command('list')
      .action(this._cmdList)

    program
      .command('status', null, 'Show a Runnable server status')
      .option('-e', 'Show the Runnable server environment variables')
      .action(this._cmdStatus)

    program
      .command('browse [target]', null, 'Open a Runnable page in the default browser')
      .action(this._cmdBrowse)

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
      .then((response) => {
        var output = ['https://runnable.io',
          response.body.owner.username,
          response.body.lowerName].join('/') + '\n'
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
      .then((response) => {
        var output = ['https://runnable.io',
          response.body.owner.username,
          response.body.lowerName].join('/') + '\n'
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
      .then((response) => {
        var output = ['https://runnable.io',
          response.body.owner.username,
          response.body.lowerName].join('/') + '\n'
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
      .then((response) => {
        var output = ['https://runnable.io',
          response.body.owner.username,
          response.body.lowerName].join('/') + '\n'
        output += 'Rebuilding container...'
        console.log(output.magenta)
      })
      .catch((err) => {
        console.log(err.message, err.stack)
      })
  }

  /**
   * 
   */
  _cmdList () {
  }

  /**
   * Open a Runnable page in the default browser
   * @param {String} target - Optional, [Runnable, Server]
   */
  _cmdBrowse (target) {
    console.log('Opening a Runnable page in the default browser...'.magenta)
    api.fetchInstance()
      .then((instance) => {
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
        console.log(err.message, err.stack)
      })
  }

  /**
   * Show a Runnable server status
   */
  _cmdStatus (options) {
    api.fetchInstance()
      .then(status.bind(this, options))
      .catch((err) => {
        console.log(err.message, err.stack)
      })
  }
}

module.exports = new CLI()
