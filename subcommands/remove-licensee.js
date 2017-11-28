module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var deleteLicensee = require('../delete/licensee')
  var nickname = options['<nickname>']
  deleteLicensee(config, nickname, done)
}
