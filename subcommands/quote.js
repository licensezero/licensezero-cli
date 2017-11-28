module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var nickname = options['<nickname>']

  var inventory = require('../inventory')
  inventory(nickname, cwd, config, options, function (error, result) {
    /* istanbul ignore if */
    if (error) return done(error)
    var licensee = result.licensee
    var licensable = result.licensable
    var licensed = result.licensed
    var waived = result.waived
    var unlicensed = result.unlicensed
    var ignored = result.ignored
    var invalid = result.invalid
    if (licensable.length === 0) {
      stdout.write('No License Zero dependencies found.\n')
      return done(0)
    }
    stdout.write('License Zero Projects: ' + licensable.length + '\n')
    stdout.write('Licensed: ' + licensed.length + '\n')
    stdout.write('Waived: ' + waived.length + '\n')
    stdout.write('Ignored: ' + ignored.length + '\n')
    stdout.write('Unlicensed: ' + unlicensed.length + '\n')
    stdout.write('Invalid: ' + invalid.length + '\n')
    if (unlicensed.length === 0) return done(0)
    var request = require('../request')
    request({
      action: 'quote',
      projects: unlicensed.map(function (metadata) {
        return metadata.projectID
      })
    }, function (error, response) {
      /* istanbul ignore if */
      if (error) return done(error)
      var lamos = require('lamos')
      var projects = response.projects
      var formattedProjects = []
      var total = 0
      projects.forEach(function (project) {
        var licensor = project.licensor
        var price = project.pricing[licensee.tier]
        var formatted = {
          Project: project.projectID,
          Description: project.description,
          Repository: project.repository,
          Terms: unlicensed
            .find(function (metadata) {
              return metadata.projectID === project.projectID
            })
            .terms,
          Licensor: (
            licensor.name + ' [' + licensor.jurisdiction + ']'
          )
        }
        if (project.retracted) {
          formatted.Retracted = project.retracted
        } else {
          total += price
          formatted.Price = (
            currency(price) +
            ' (' + capitalize(licensee.tier) + ' License)'
          )
        }
        formattedProjects.push(formatted)
      })
      stdout.write(
        lamos.stringify({
          Projects: formattedProjects,
          Total: currency(total)
        }) + '\n'
      )
      done(0)
    })
  })
}

function currency (cents) {
  return '$' + (
    cents < 100
      ? '0.' + (cents < 10 ? '0' + cents : cents)
      : cents.toString().replace(/(\d\d)$/, '.$1')
  )
}

function capitalize (string) {
  return string[0].toUpperCase() + string.slice(1)
}
