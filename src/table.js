/**
 * Table creation and value coercion logic
 * @module lib/table
 * @exports Table
 */
'use strict'

var CLITable = require('cli-table')

class Table {
  /**
   * Instantiate cli-table
   * Add cli-table instance to this
   * @constructor
   * @param {Object} tops
   */
  constructor (opts) {
    this.table = new CLITable(opts)
  }

  /**
   * Add rows to table and coerce values to strings
   * @param {Array} row
   */
  _pushRow (row) {
    row = row.map((val) => {
      return (val + '')
    })
    this.table.push(row)
  }

  /**
   * Output table string to stdout
   */
  output () {
    console.log(this.table.toString())
  }
}

module.exports = Table
