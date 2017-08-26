module.exports = function (argv, cwd, config, stdout, stderr, done) {
  var options = require('./usage')([
    'Create a new licensee identity.',
    '',
    'Usage:',
    '  l0-create-identity <nickname> <name> <jurisdiction> <tier>',
    '  l0-create-identity -h | --help',
    '  l0-create-identity -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.'
  ]).apply(null, arguments)
  if (!options) return

  var validations = {
    nickname: require('../validate/nickname'),
    name: require('../validate/name'),
    jurisdiction: require('../validate/jurisdiction'),
    tier: require('../validate/tier')
  }
  var keys = Object.keys(validations)
  var newIdentity = {}
  for (var index = 0; index < keys.length; index++) {
    var key = keys[index]
    var value = newIdentity[key] = options['<' + key + '>']
    if (!validations[key](value)) return fail('invalid ' + key)
  }

  var ecb = require('ecb')
  var readIdentities = require('../read-identities')
  readIdentities(config, ecb(fail, function (identities) {
    var existing = identities.some(function (identity) {
      return identity.nickname === newIdentity.nickname
    })
    if (existing) return fail('nickname taken')
    var colliding = identities.find(function (existingIdentity) {
      return (
        existingIdentity.name === newIdentity.name &&
        existingIdentity.jurisdiction === newIdentity.jurisdiction
      )
    })
    if (colliding) return fail('identical to ' + colliding.nickname)
    var writeIdentity = require('../write-identity')
    writeIdentity(config, newIdentity, ecb(fail, function () {
      done(0)
    }))
  }))

  function fail (error) {
    /* istanbul ignore else */
    if (typeof error === 'string') {
      stderr.write(error + '\n')
    } else {
      stderr.write((error.userMessage || error.message) + '\n')
    }
    done(1)
  }
}
