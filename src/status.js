/**
 * @module lib/status
 * @exports Function
 */
'use strict'

const moment = require('moment')

const Table = require('./table')

class Status extends Table {
  /**
   * Define table formatting for parent class
   * @constructor
   * @param {InstanceModel}
   */
  constructor (instance) {
    super({
      chars: {
        'top': '-',
        'top-mid': '',
        'top-left': '',
        'top-right': '',
        'bottom': '-',
        'bottom-mid': '',
        'bottom-left': '',
        'bottom-right': '',
        'left': '',
        'left-mid': '',
        'mid': '',
        'mid-mid': '',
        'right': '',
        'right-mid': '',
        'middle': ' | '
      },
      style: { 'padding-left': 0, 'padding-right': 0 }
    })
    this.instance = instance
  }

  /**
   * Append rows for all instance status data
   * @param {InstanceModel} instance
   */
  _seedTableData (instance) {
    this._pushRow(['branch name', instance.get('contextVersion.appCodeVersions[0].branch')])
    this._pushRow(['cid', instance.get('container.dockerHost')])
    this._pushRow(['created by', instance.get('createdBy.username')])
    this._pushRow(['github commit', instance.get('contextVersion.appCodeVersions[0].commit')])
    this._pushRow(['open ports', Object.keys(instance.get('container.ports') || {}).join(', ')])
    this._pushRow(['status', instance.get('container.inspect.State.Status')])
    this._pushRow(['uptime',
                  moment.duration(instance.get('container.inspect.State.StartedAt')).humanize()])
  /* TODO
    if (options.E) {
      // Add ENV VARS to status output
      table = new Table(tableOpts)
      instance.get('env').forEach(function (env) {
        table.push(env.split('='))
      })
      table.map(function (arr) {
        arr[0] = arr[0].magenta
      })
      console.log('ENVIRONMENT VARIABLES'.magenta)
      console.log(table.toString())
    }
  */
  }

  /**
   * Output table to stdout
   */
  output () {
    this._seedTableData(this.instance)
    super.output()
  }
}

module.exports = Status
