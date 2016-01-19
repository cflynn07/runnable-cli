/**
 * @module lib/watcher
 * @exports {Class} Watcher
 */
'use strict'

const Promise = require('bluebird')
const fs = require('fs')
const nodeWatch = require('node-watch')
const path = require('path')

const Git = require('./git')
const Output = require('./output')

// const api = require('./api')

class Watcher extends Output {
  /**
   * @constructor
   * @param {InstanceModel} instance
   */
  constructor (instance) {
    super()
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

  /**
   * Watch pwd for file changes
   * When a file change is detected, run `git check-ignore` to see if the file is ignored by the
   * repository. Process the file if it is not ignored.
   */
  watch () {
    var git = new Git()
    var cwd = process.cwd()
    nodeWatch(process.cwd(), (filePath) => {
      var rel = path.relative(cwd, filePath)
      Promise.coroutine(function *() {
        const excluded = yield git.checkIgnore(rel)
        if (!excluded) {
          this._handleFileChange(rel)
        }
      }.bind(this))()
    })
  }

  /**
   * @param {String} filePath - relative filepath
   */
  _handleFileChange (filePath) {
    // var contents = '';
    const spinStringBase = [
      './',
      filePath,
      ' --> [remote]:',
      '/',
      this._instance.repositoryName(),
      '/',
      filePath
    ].join('')

    const stats = this._fetchContents(filePath)
    if (stats.deleted) {
      // spinString += ' DELETE'
      // spinner = new Spinner(spinString.magenta)
      // spinner.start()
      // spinner.stop()
    } else {
      const stopSpinner = this.spinner(spinStringBase + ' %s', spinStringBase + ' [complete]')
      Promise.coroutine(function *() {
        this._instance = yield this._instance.uploadFile(filePath, stats.contents)
        stopSpinner()
      }.bind(this))()
    }
  }

  /**
   * @return Object
   *   - deleted
   *   - isDir
   *   - contents
   */
  _fetchContents (filepath) {
    var contents
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
