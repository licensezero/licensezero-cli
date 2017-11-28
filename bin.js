#!/usr/bin/env node
require('update-notifier')({pkg: require('./package.json')})
  .notify({defer: true})

var path = require('path')

// Build the command's usage lines programmatically, so we have a list
// of subcommands in memory to check later, to route to the right
// subcommand handler.
var subcommands = {
  'buy': '<nickname> [--do-not-open]',
  'create-licensee': '<nickname> <name> <jurisdiction> <tier>',
  'create-licensor': '<UUID>',
  'import-license': '<file>',
  'import-waiver': '<file>',
  'license': '<UUID> (--noncommercial | --reciprocal)',
  'list-licensees': '',
  'list-licensors': '',
  'offer': '-s CENTS -t CENTS -c CENTS -e CENTS [-p CENTS] [-l UUID]',
  'purchased': '<URL>',
  'quote': '<nickname> [--no-noncommercial] [--no-reciprocal]',
  'register-licensor': '<email> <name> <jurisdiction>',
  'remove-licensee': '<nickname>',
  'remove-licensor': '<UUID>',
  'reset-token': '<UUID> <email>',
  'retract': '',
  'show-licensee': '<nickname>',
  'sponsor': '<nickname> <UUID> [--do-not-open]',
  'waive': '<UUID> -b NAME -j CODE -d DAYS [-l UUID]'
}
var subcommandNames = Object.keys(subcommands)

/* eslint-disable max-len */
var usage = `Manage License Zero software projects.

Usage:
  licensezero (--help | --version)
${
  subcommandNames
    .map(function (name) {
      if (subcommands[name]) {
        return '  licensezero ' + name + ' ' + subcommands[name]
      } else {
        return '  licensezero ' + name
      }
    })
    .join('\n')
}

Options:
  -h, --help                    Print this screen to standard output.
  -v, --version                 Print version to standard output.
  --do-not-open                 Do not open the payment page in a browser.
  --no-noncommercial            Omit L0-NC projects from quotes and orders.
  --no-reciprocal               Omit L0-R projects from quotes and orders.
  -c CENTS, --company CENTS     Price for company licenses, in cents.
  -d DAYS, --days DAYS          Term in days or "forever".
  -e CENTS, --enterprise CENTS  Price for enterprise licenses, in cents.
  -j CODE, --jurisdiction CODE  Beneficiary jurisdiction (ISO 3166-2).
  -l UUID, --licensor UUID      Licensor offering licenses.
  -b NAME, --beneficiary NAME   Beneficiary name.
  -n, --noncommercial           Apply the Noncommercial Public License.
  -p CENTS, --relicense CENTS   Price for relicensing, in cents.
  -r, --reciprocal              Apply the Reciprocal Public License.
  -s CENTS, --solo CENTS        Price for solo licenses, in cents.
  -t CENTS, --team CENTS        Price for team licenses, in cents.
`
/* eslint-enable max-len */

function execute (argv, cwd, config, stdin, stdout, stderr, done) {
  try {
    var options = require('docopt').docopt(usage, {
      argv: argv,
      exit: false,
      help: false
    })
  } catch (error) {
    return done(error.message)
  }

  if (options['--help']) {
    stdout.write(usage)
    return done()
  }

  if (options['--version']) {
    stdout.write(require('./package.json').version + '\n')
    return done()
  }

  for (var index = 0; index < subcommandNames.length; index++) {
    var name = subcommandNames[index]
    if (options[name]) {
      return require('./subcommands/' + name)(
        options, cwd, config, stdin, stdout, stderr, done
      )
    }
  }
}

/* istanbul ignore else */
if (module.parent) {
  module.exports = execute
} else {
  execute(
    process.argv.slice(2),
    process.cwd(),
    path.join(
      require('xdg-basedir').config,
      require('./package.json').name
    ),
    process.stdin,
    process.stdout,
    process.stderr,
    function (error) {
      if (error) {
        var formatError = require('./format-error')
        process.stderr.write(formatError(error))
        process.exit(1)
      }
      process.exit(0)
    }
  )
}
