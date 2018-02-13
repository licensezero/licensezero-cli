var eea = require('./enoent-empty-array')
var fs = require('fs')
var path = require('path')
var readWaiver = require('./waiver')
var runParallel = require('run-parallel')

module.exports = function (config, callback) {
  var directory = path.join(config, 'waivers')
  fs.readdir(directory, eea(callback, function (entries) {
    runParallel(entries.map(function (projectID) {
      return readWaiver.bind(null, config, projectID)
    }), function (error, waivers) {
      /* istanbul ignore if */
      if (error) return callback(error)
      callback(null, waivers.filter(function (waiver) {
        return !expired(waiver)
      }))
    })
  }))
}

var ONE_DAY = 24 * 60 * 60 * 1000
var TODAY = new Date()

function expired (waiver) {
  var manifest
  try {
    manifest = JSON.parse(waiver.manifest)
  } catch (error) {
    return true
  }
  if (!manifest.hasOwnProperty('term')) return true
  if (manifest.term === 'forever') return false
  var term = parseInt(manifest.term)
  var date = new Date(manifest.date)
  if (isNaN(date)) return true
  return (TODAY - date) < (term * ONE_DAY)
}
