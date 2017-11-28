module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var nickname = options['<nickname>']
  var projectID = options['<UUID>']

  var readLicensee = require('../read/licensee')
  readLicensee(config, nickname, function (error, licensee) {
    /* istanbul ignore if */
    if (error) return done(error)
    var request = require('../request')
    request({
      action: 'sponsor',
      projectID: projectID,
      sponsor: licensee.name,
      jurisdiction: licensee.jurisdiction
    }, function (error, response) {
      /* istanbul ignore if */
      if (error) return done(error)
      var url = 'https://licensezero.com' + response.location
      stdout.write(url + '\n')
      if (!options['--do-not-open']) {
        var openWebpage = require('../open-webpage')
        openWebpage(url)
      }
      done(0)
    })
  })
}
