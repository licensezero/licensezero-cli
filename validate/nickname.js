var RE = /^[a-z]+$/

module.exports = function (nickname) {
  return RE.test(nickname)
}
