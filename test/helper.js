var PassThrough = require('stream').PassThrough
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
          var stdin = new PassThrough()
          var stdout = new streamBuffers.WritableStreamBuffer()
          // FIXME: Ugly hack to avoid https://github.com/npm/read/issues/23
          stdout.end = function () { }
          var stderr = new streamBuffers.WritableStreamBuffer()
          cli(
            args, directory, config, stdin, stdout, stderr,
            function (error) {
              if (error) stderr.write(formatError(error))
              next(
                error ? 1 : 0,
                stdout.getContentsAsString('utf8') || '',
                stderr.getContentsAsString('utf8') || ''
              )
            }
          )
          return stdin
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
