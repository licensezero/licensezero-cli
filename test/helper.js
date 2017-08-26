var ecb = require('ecb')
var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var rimraf = require('rimraf')
var streamBuffers = require('stream-buffers')

module.exports = function (callback) {
  fs.mkdtemp('/tmp/', ecb(fail, function (tmp) {
    var config = path.join(tmp, 'config')
    mkdirp(config, ecb(fail, function () {
      callback(
        tmp,
        function run (cli, args, next) {
          var stdout = new streamBuffers.WritableStreamBuffer()
          var stderr = new streamBuffers.WritableStreamBuffer()
          cli(
            args, tmp, config, stdout, stderr,
            function (error) {
              var status
              if (error) {
                stderr.write(
                  typeof error === 'string'
                    ? error + '\n'
                    : error.userMessage || error.message
                )
                status = 1
              } else {
                status = 0
              }
              next(
                status,
                stdout.getContentsAsString('utf8') || '',
                stderr.getContentsAsString('utf8') || ''
              )
            }
          )
        },
        function rm (test) {
          rimraf(tmp, ecb(fail, function () {
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
