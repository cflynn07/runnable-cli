/**
 * @module lib/watcher
 * @exports {Class} Watcher
 */
'use strict'

require('colors')

var Spinner = require('cli-spinner').Spinner
var fs = require('fs')
var nodeWatch = require('node-watch')
var path = require('path')

var Git = require('./git')
var api = require('./api')

class Watcher {
  /**
   * @param {Object} instance - immutable
   */
  constructor (instance) {
    this._instance = instance

  }

  // EDIT: PATCH https://api.runnable.io/instances/55d3aa87b222f91c0036b2c3/containers/85af5a0438b1b82dc4a3b6515546f770cf2fc62270bcc350b3eb5a6d1c624963/files/api/README.md
  //   - body: <string>
  //
  // CREATE: PATCH https://api.runnable.io/instances/55d3aa87b222f91c0036b2c3/containers/85af5a0438b1b82dc4a3b6515546f770cf2fc62270bcc350b3eb5a6d1c624963/files/newFile
  //   - isDir: <boolean>
  //   - name: <string>
  //
  // RENAME: PATCH https://api.runnable.io/instances/55d3aa87b222f91c0036b2c3/containers/85af5a0438b1b82dc4a3b6515546f770cf2fc62270bcc350b3eb5a6d1c624963/files/tempfile
  //   NOTE: tempfile --> screwit
  //   - isDir: <boolean>
  //   - name: <string>

  watch () {
    var git = new Git()
    var cwd = process.cwd()

    nodeWatch(process.cwd(), (filepath) => {
      var rel = path.relative(cwd, filepath)
      git.checkIgnore(rel).then((excluded) => {
        if (!excluded) { this._handleFileChange(rel) }
      })
    })
  }

  /**
   * @param {String} filepath - relative filepath
   */
  _handleFileChange (filepath) {
    var contents = '';
    var spinString = '%s ' + filepath
    var spinner;

    var stats = this._fetchContents(filepath)
    if (stats.deleted) {
      spinString += ' DELETE'
      spinner = new Spinner(spinString.magenta)
      spinner.start()
      spinner.stop()
    } else {
      spinString += ' UPDATE'
      spinner = new Spinner(spinString.magenta)
      spinner.start()
      api.updateInstanceFile(this._instance.id,
        this._instance.container.dockerContainer,
        this._instance.contextVersion.appCodeVersions[0].lowerRepo.split('/')[1],
        filepath,
        contents.toString())
      .then((response) => {
        spinner.stop(true)
        console.log(filepath.magenta)
      })
    }
  }

  /**
   * @return Object
   *   - deleted
   *   - isDir
   *   - contents
   */
  _fetchContents (filepath) {
    var contents;
    try {
      contents = fs.readFileSync(filepath)
    } catch (e) {
      if (e.code === 'ENOENT') {
        // file deleted
        return {
          deleted: true
        }
      }
      if (e.code === 'EISDIR') {
        // it's a dir not a file
        return {
          deleted: false,
          isDir: true,
          contents: ''
        }
      }
    }
    return {
      deleted: false,
      isDir: false,
      contents: contents.toString()
    }
  }
}

module.exports = Watcher