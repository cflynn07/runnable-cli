#!/usr/bin/env node

/**
 * @module lib/cli
 * @exports {Object} instanceOf CLI
 */
'use strict'

// Mutates String.prototype globally, only require once in init module
require('colors')

var fs = require('fs')
var program = require('commander')

var ContainerLogs = require('./container-logs')
var Terminal = require('./terminal')
var api = require('./api')
var status = require('./status')

class CLI {
  constructor () {
    //var packageJSON = JSON.parse(fs.readFileSync('../package.json'))
    //program.version(packageJSON.version)

    program
      .command('logs')
      .action(this._cmdLogs)

    program
      .command('terminal')
      .action(this._cmdTerminal)

    program
      .command('start')
      .action(this._cmdStart)

    program
      .command('stop')
      .action(this._cmdStop)

    program
      .command('restart')
      .action(this._cmdRestart)

    program
      .command('rebuild')
      .action(this._cmdRebuild)

    program
      .command('list')
      .action(this._cmdList)

    program
      .command('status')
      .option('-e', 'Show environment variables')
      .description('description foo here')
      .action(this._cmdStatus)

    program
      .command('browse')
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
   * Tail the CMD logs of a container on Runnable.
   * Attempts to determine which container to use from the origin remote of the current git repo
   */
  _cmdLogs () {
    // Fetch instance from API
    // codenow: 
    // Ex: http://api.runnable.io/instances/?githubUsername=codenow&name=api
    api.fetchInstance() // TODO: Add org and name args here for manual specification
      .then((instance) => {
        var containerLogs = new ContainerLogs(instance.container.dockerHost,
                                              instance.container.dockerContainer)
        containerLogs.fetchAndPipeToStdout()
      })
      .catch((err) => {
        console.log(err.message)
      });
  }

  /**
   *
   */
  _cmdTerminal () {
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
   *
   */
  _cmdStart () {
    api.startInstance()
      .then((response) => {
        var output = ['https://runnable.io',
          response.body.owner.username,
          response.body.lowerName].join('/') + '\n'
        output += 'Starting your container...'
        console.log(output.magenta)
      })
      .catch((err) => {
        console.log(err.message, err.stack)
      })
  }

  /**
   *
   */
  _cmdStop () {
  }

  /**
   *
   */
  _cmdRestart () {
  }

  /**
   *
   */
  _cmdRebuild () {
  }

  /**
   *
   */
  _cmdList () {
  }

  /**
   *
   */
  _cmdBrowse () {
  }

  /**
   * @param {Array} subVars optional variadic arguments
   *   - env
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
