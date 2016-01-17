/**
 * Shared instance of request.js with project-specific configuration options
 * @module src/http-client
 */
'use strict'

require('loadenv')()

const Promise = require('bluebird')
const request = require('request')

const packageJSON = require('../package.json')

const jar = request.jar()
jar.setCookie(process.env.RUNNABLE_COOKIE, process.env.RUNNABLE_API_HOST)
const baseRequest = Promise.promisify(request.defaults({
  baseUrl: process.env.RUNNABLE_API_HOST,
  headers: {
    'User-Agent': ['Runnable CLI', packageJSON.version].join(' ')
  },
  jar: jar,
  json: true,
  rejectUnauthorized: false,
  strictSSL: false
}))
Promise.promisifyAll(baseRequest)

module.exports = baseRequest
