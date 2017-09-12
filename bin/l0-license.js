module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')([
    'Apply the License Zero Public License to an npm package.',
    '',
    'Usage:',
    '  l0-license <UUID> [--quiet]',
    '  l0-license -h | --help',
    '  l0-license -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.',
    '  -q, --quiet    Suppress output.'
  ]).apply(null, arguments)
  if (!options) return

  var projectID = options['<UUID>']

  var request = require('../request')
  request({
    action: 'project',
    projectID: projectID
  }, function (error, project) {
    if (error) return done(error)
    var readLicensor = require('../read/licensor')
    readLicensor(config, project.licensor.licensorID, function (error, licensor) {
      /* istanbul ignore next */
      if (error) return done(error)
      request({
        action: 'public',
        licensorID: licensor.licensorID,
        token: licensor.token,
        projectID: projectID
      }, function (error, response) {
        if (error) return done(error)
        var fs = require('fs')
        var path = require('path')
        var runParallel = require('run-parallel')
        runParallel([
          function modifyPackageJSON (done) {
            var metadata = response.metadata
            var packageJSON = path.join(cwd, 'package.json')
            var modifyJSONFile = require('../modify/json-file')
            modifyJSONFile(packageJSON, function (data) {
              data.set('license', metadata.license)
              var existing = data.get('licensezero')
              if (Array.isArray(existing)) {
                existing.push(metadata.licensezero)
              } else {
                existing = [metadata.licensezero]
              }
              data.set('licensezero', existing)
            }, function (error) {
              /* istanbul ignore next */
              if (error) return done(error)
              log('Modified ' + packageJSON + '.')
              done()
            })
          },
          function writeLICENSE (done) {
            var license = response.license
            var licenseFile = path.join(cwd, 'LICENSE')
            var content = (
              license.document +
              '---\n' +
              'Licensor:\n' +
              signatureLines(license.licensorSignature) + '\n' +
              'Agent:\n' +
              signatureLines(license.agentSignature) + '\n'
            )
            fs.writeFile(licenseFile, content, function (error) {
              /* istanbul ignore next */
              if (error) return done(error)
              log('Wrote ' + licenseFile + '.')
              done()
            })
          }
        ], function (error) {
          if (error) return done(error)
          done()
        })
      })
    })
  })

  function log (message) {
    if (!options['--quiet']) stdout.write(message + '\n')
  }
}

function signatureLines (signature) {
  return [
    signature.slice(0, 32),
    signature.slice(32, 64),
    signature.slice(64, 96),
    signature.slice(96)
  ].join('\n')
}
