var ecb = require('ecb')
var formatError = require('../bin/format-error')
var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var rimraf = require('rimraf')
var streamBuffers = require('stream-buffers')

module.exports = function (callback) {
  fs.mkdtemp('/tmp/', ecb(fail, function (directory) {
    var config = path.join(directory, 'config')
    mkdirp(config, ecb(fail, function () {
      callback(
        directory,
        function run (cli, args, next) {
          var stdout = new streamBuffers.WritableStreamBuffer()
          var stderr = new streamBuffers.WritableStreamBuffer()
          cli(
            args, directory, config, stdout, stderr,
            function (error) {
              if (error) stderr.write(formatError(error))
              next(
                error ? 1 : 0,
                stdout.getContentsAsString('utf8') || '',
                stderr.getContentsAsString('utf8') || ''
              )
            }
          )
        },
        function rm (test) {
          rimraf(directory, ecb(fail, function () {
            test.end()
          }))
        }
      )
    }))
  }))
}

function fail (error) {
  console.error(error)
  process.exit(1)
}
