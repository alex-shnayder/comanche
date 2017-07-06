const assert = require('assert')
const { formatColumns } = require('../utils')


describe('formatColumns', () => {
  it('works', () => {
    let rows = [
        ['-n, --num', 'Not very long description'],
        ['-b, --b', 'This option is boolean. It means it can be either true or false. "1", "true", "yes" and "y" are considered truthy, "0", "false", "no" and "n" are falsy. Everything else will cause an error.'],
        ['--help, -h, --helpmepls, --ineedhelp, --howthehelldoesitwork, --wtf, --info', 'Show help'],
    ]
    let expectedResult = [
      '  -n, --num                         Not very long description                   ',
      '  -b, --b                           This option is boolean. It means it can be  ',
      '                                    either true or false. "1", "true", "yes" and',
      '                                    "y" are considered truthy, "0", "false",    ',
      '                                    "no" and "n" are falsy. Everything else will',
      '                                    cause an error.                             ',
      '  --help, -h, --helpmepls,          Show help                                   ',
      '  --ineedhelp,                                                                  ',
      '  --howthehelldoesitwork, --wtf,                                                ',
      '  --info                                                                        ',
    ].join('\n')
    let result = formatColumns(rows, {
      padding: 2,
      columnWidths: [30],
    })

    assert(result === expectedResult)
  })
})
