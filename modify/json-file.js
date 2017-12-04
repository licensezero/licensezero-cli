var fs = require('fs')
var preserveIndent = require('json-preserve-indent')

module.exports = function (file, modifier, done) {
  fs.readFile(file, function (error, buffer) {
    /* istanbul ignore if */
    if (error) return done(error)
    var content = preserveIndent(buffer.toString())
    modifier(content)
    fs.writeFile(file, content.format(), done)
  })
}
