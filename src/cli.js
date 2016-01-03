#!/usr/bin/env node

/**
 * @module lib/cli
 * @exports {Object} instanceOf CLI
 */
'use strict'

var fs = require('fs')
var program = require('commander')

var ContainerLogs = require('./container-logs')
var api = require('./api')

class CLI {
  constructor () {
    //var packageJSON = JSON.parse(fs.readFileSync('../package.json'))
    //program.version(packageJSON.version)

    program
      .command('logs')
      .action(this._cmdLogs)

    program
      .command('stop')
      .action(this._cmdStop)

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
    api.fetchInstanceInfo() // TODO: Add org and name args here for manual specification
      .then((data) => {
        var containerLogs = new ContainerLogs(data.dockerHost, data.dockerContainer)
        containerLogs.fetchAndPipeToStdout()
      })
      .catch((err) => {
        console.log(err.message)
      });
  }
  _cmdStop () {
  }
}

module.exports = new CLI()
