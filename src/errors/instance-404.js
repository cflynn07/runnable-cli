/**
 * Custom error class for instance not found error
 * @module src/errors/instance-404
 */
'use strict'

/**
 * No instance found for a query
 * @param {String|Object} queryData
 */
function Instance404 (queryData) {
  this.queryData = queryData
}

Instance404.prototype = Object.create(Error.prototype)

module.export = Instance404
