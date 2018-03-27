module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var readJSONFile = require('../read/json-file')
  var path = require('path')
  readJSONFile(path.join(cwd, 'package.json'), function (error, packageData) {
    if (error) return done(error)
    var readProjectID = require('../read/project-id')
    var projectID = readProjectID(packageData)
    var readPublicTerms = require('../read/public-terms')
    var terms = readPublicTerms(packageData)
    var summary, availability
    if (terms === 'reciprocal') {
      summary = [
        'This package is free to use in open source ',
        'under the terms of the ',
        '[License Zero Reciprocal Public License](./LICENSE)'
      ].join('')
      availability = [
        'Licenses for use in closed software are available ',
        '[via licensezero.com][project].'
      ].join('')
    } else if (terms === 'noncommercial') {
      summary = [
        'This package is free to use for noncommercial purposes ',
        'under the terms of the ',
        '[License Zero Noncommercial Public License](./LICENSE)'
      ].join('')
      availability = [
        'Licenses for long-term commercial use are available ',
        '[via licensezero.com][project].'
      ].join('')
    } else {
      return done(new Error('invalid public terms metadata'))
    }
    var projectLink = 'https://licensezero.com/projects/' + projectID
    var badge = [
      '[',
      '![licensezero.com pricing](' + projectLink + '/badge.svg)',
      '][project]'
    ].join('')
    stdout.write('# Licensing\n')
    stdout.write('\n' + summary + '\n')
    stdout.write('\n' + availability + '\n')
    stdout.write('\n' + badge + '\n')
    stdout.write('\n[project]: ' + projectLink + '\n')
  })
}
