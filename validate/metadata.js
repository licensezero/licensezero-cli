var nacl = require('tweetnacl')
var request = require('../request')
var runParallel = require('run-parallel')
var stringify = require('json-stable-stringify')

module.exports = function (metadata, callback) {
  runParallel({
    agent: function (done) {
      request({
        action: 'key'
      }, function (error, response) {
        if (error) return done(error)
        done(null, response.key)
      })
    },
    licensor: function (done) {
      request({
        action: 'project',
        projectID: metadata.license.projectID
      }, function (error, response) {
        if (error) return done(error)
        done(null, response.licensor.publicKey)
      })
    }
  }, function (error, results) {
    if (error) return callback(error)
    var validLicensorSignature = validSignature(
      stringify(metadata.license),
      metadata.licensorSignature,
      results.licensor
    )
    if (!validLicensorSignature) return callback(null, false)
    var validAgentSignature = validSignature(
      stringify({
        license: metadata.license,
        licensorSignature: metadata.licensorSignature
      }),
      metadata.agentSignature,
      results.agent
    )
    if (!validAgentSignature) return callback(null, false)
    callback(null, true)
  })
}

function validSignature (message, signature, key) {
  return nacl.sign.detached.verify(
    Buffer.from(message, 'utf8'),
    Buffer.from(signature, 'hex'),
    Buffer.from(key, 'hex')
  )
}
