/**
 * Custom error class for instance not found error
 * @module src/errors/git-not-repo
 */
'use strict'

function GitNoRepo () {}
GitNoRepo.prototype = Object.create(Error.prototype)
GitNoRepo.prototype.constructor = GitNoRepo
module.export = GitNoRepo
