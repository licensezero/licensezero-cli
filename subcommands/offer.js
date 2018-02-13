module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var readJSONFile = require('../read/json-file')
  var path = require('path')
  readJSONFile(path.join(cwd, 'package.json'), function (error, packageData) {
    /* istanbul ignore next */
    if (error) return done(error)
    if (typeof packageData.repository !== 'string') {
      return done(new Error('package.json missing repository property'))
    }
    var hostedGitInfo = require('hosted-git-info')
    var repository = hostedGitInfo.fromUrl(packageData.repository).browse()
    var readLicensor = require('../read/licensor')
    readLicensor(config, function (error, licensor) {
      /* istanbul ignore next */
      if (error) return done(error)
      var agreeToTerms = require('../agree-to-terms')
      agreeToTerms(stdin, stdout, true, function (error, accepted) {
        /* istanbul ignore if */
        if (error) return done(error)
        if (!accepted) return done('must accept terms')
        var request = require('../request')
        var pricing = {private: parseInt(options['--private'])}
        if (options['--relicense']) {
          pricing.relicense = parseInt(options['--relicense'])
        }
        var payload = {
          action: 'offer',
          licensorID: licensor.licensorID,
          token: licensor.token,
          repository: repository,
          pricing: pricing,
          description: packageData.description,
          terms: (
            'I agree to the agency terms at ' +
            'https://licensezero.com/terms/agency.'
          )
        }
        request(payload, function (error, response) {
          /* istanbul ignore if */
          if (error) return done(error)
          stdout.write('Project ID: ' + response.projectID + '\n')
          done()
        })
      })
    })
  })
}
