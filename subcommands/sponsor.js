module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var projectID = options['<project id>']

  var readIdentity = require('../read/identity')
  readIdentity(config, function (error, identity) {
    /* istanbul ignore if */
    if (error) return done(error)
    var request = require('../request')
    request(
      {
        action: 'sponsor',
        projectID: projectID,
        sponsor: identity.name,
        jurisdiction: identity.jurisdiction,
        email: identity.email
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
