module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var deleteLicensor = require('../delete/licensor')
  var licensorID = options['<UUID>']
  deleteLicensor(config, licensorID, done)
}
