module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var nickname = options['<nickname>']

  var readLicensee = require('../read/licensee')
  readLicensee(config, nickname, function (error, licensee) {
    if (error) return done(error)
    var runParallel = require('run-parallel')
    var readLicenses = require('../read/licenses')
    var readWaivers = require('../read/waivers')
    runParallel({
      licenses: readLicenses.bind(null, config, nickname),
      waivers: readWaivers.bind(null, config, nickname)
    }, function (error, results) {
      if (error) return done(error)
      var lamos = require('lamos')
      stdout.write(
        lamos.stringify({
          'Nickname': licensee.nickname,
          'Legal Name': licensee.name,
          'Jurisdiction': licensee.jurisdiction,
          'License Tier': licensee.tier,
          'Licenses': results.licenses.length === 0
            ? 'None'
            : results.licenses.map(formatDocument),
          'Waivers': results.waivers.length === 0
            ? 'None'
            : results.waivers.map(formatDocument)
        }) + '\n'
      )
      return done()
      function formatDocument (argument) {
        var manifest = JSON.parse(argument.manifest)
        return {
          'Project': argument.projectID,
          'Description': manifest.project.description,
          'Repository': manifest.project.repository
        }
      }
    })
  })
}
