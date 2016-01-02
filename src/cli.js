#!/usr/bin/env node

/**
 * @module bin/cli
 */
'use strict'

var fs = require('fs')
var program = require('commander')

class CLI {
  constructor () {
    var packageJSON = JSON.parse(fs.readFileSync('../package.json'))
    program.version(packageJSON.version)

    program
      .command('logs')
      .action(this._cmdLogs)

    program
      .command('*')
      .action(function () { program.help() })

    program.parse(process.argv)

    if (!program.args.length) {
      program.help()
    }
  }
  _cmdLogs () {
    console.log('hi!')
  }
}

module.exports = new CLI()

/*
program
  .command('logs [something]')
  .description('view logs')
  .action(function () {
    console.log('action', arguments)
  })
  .command('build-logs', 'view build logs')
  // .command('terminal', 'terminal', { isDefault: true })
  .command('status', 'container status')
  .command('list', 'list containers based on this repository')
  .command('rebuild', 'rebuild a container')
  // .command('upload', '')
  // .command('relaunch')
  .parse(process.argv)
*/
