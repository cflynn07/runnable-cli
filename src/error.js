/**
 * Basic error handling and reporting module
 * @module lib/error
 */
'use strict'

/**
 * Catch, log and report errors
 * @param {Error} err
 */
module.exports = (err) => {
  console.log(err, err.stack)
}
