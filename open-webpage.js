module.exports = process.env.NODE_ENV === 'test'
  ? (function () {
    var EventEmitter = require('events').EventEmitter
    var emitter = new EventEmitter()
    var returned = function (url) {
      emitter.emit('open', url)
    }
    returned.events = emitter
    return returned
  })()
  : /* istanbul ignore next */ (function () {
    var opener = require('opener')
    return function (url) {
      var child = opener(url)
      child.unref()
      child.stdin.unref()
      child.stdout.unref()
      child.stderr.unref()
    }
  })()
