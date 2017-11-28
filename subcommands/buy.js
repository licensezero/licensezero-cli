module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var nickname = options['<nickname>']

  var inventory = require('../inventory')
  inventory(nickname, cwd, config, options, function (error, result) {
    /* istanbul ignore if */
    if (error) return done(error)
    var unlicensed = result.unlicensed
    var licensable = result.licensable
    var licensee = result.licensee
    var request = require('../request')
    if (licensable.length === 0) {
      stdout.write('No License Zero dependencies found.')
      return done(0)
    }
    if (unlicensed.length === 0) return done(0)
    request({
      action: 'order',
      projects: unlicensed.map(function (metadata) {
        return metadata.projectID
      }),
      licensee: licensee.name,
      jurisdiction: licensee.jurisdiction,
      tier: licensee.tier
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
