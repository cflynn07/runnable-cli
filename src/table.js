/**
 * Table creation and value coercion logic
 * @module lib/table
 * @exports Table
 */
'use strict'

require('colors')

const CLITable = require('cli-table')

const Output = require('./output')

class Table extends Output {
  /**
   * Instantiate cli-table
   * Add cli-table instance to this
   * @constructor
   * @param {Object} tops
   */
  constructor (opts) {
    super()
    this.table = new CLITable(opts)
  }

  /**
   * Add rows to table and coerce values to strings
   * @param {Array} row
   */
  _pushRow (row) {
    row = row.map((val) => {
      return this.colorize(val + '')
    })
    this.table.push(row)
  }

  /**
   * Output table string to stdout
   */
  output () {
    this.toStdOut(this.table.toString(), true)
  }
}

module.exports = Table
