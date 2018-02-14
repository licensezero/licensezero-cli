module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var inventory = require('../inventory')
  inventory(cwd, config, options, function (error, result) {
    /* istanbul ignore if */
    if (error) return done(error)
    var unlicensed = result.unlicensed
    var licensable = result.licensable
    var identity = result.identities[0]
    if (!identity) {
      return done('Create an identity with `licensezero identify`.')
    }
    var request = require('../request')
    if (licensable.length === 0) {
      stdout.write('No License Zero dependencies found.')
      return done(0)
    }
    if (unlicensed.length === 0) return done(0)
    request(
      {
        action: 'order',
        projects: unlicensed.map(function (metadata) {
          return metadata.projectID
        }),
        licensee: identity.name,
        jurisdiction: identity.jurisdiction,
        email: identity.email,
        person: 'I am a person, not a legal entity.'
      },
      function (error, response) {
        /* istanbul ignore if */
        if (error) return done(error)
        var url = 'https://licensezero.com' + response.location
        stdout.write(url + '\n')
        if (!options['--do-not-open']) {
          var openWebpage = require('../open-webpage')
          openWebpage(url)
        }
        done(0)
      }
    )
  })
}
