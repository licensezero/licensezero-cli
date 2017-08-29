var RE = new RegExp(
  '^' +
  '[0-9a-f]{8}-' +
  '[0-9a-f]{4}-' +
  '4[0-9a-f]{3}-' +
  '[89ab][0-9a-f]{3}-' +
  '[0-9a-f]{12}' +
  '$'
)

module.exports = function (string) {
  return RE.test(string)
}
