#!/usr/bin/env node

var fs = require('fs')

fs.writeFileSync('spacer.txt',
  '    a\n' +
  '\n' +
  '\tb\n' +
  ' \t   c = @"1"; c1 = @"2"\n' +
  '  d; d1\t; d2\n' +
  '\t  e\n' +
  '\t@"123"\n' +
  '    @"1\n' +
  '\t1\n' +
  '    2"\n' +
  'f\n' +
  '\n' +
  '    " @"\n' +
  '\tg\n' +
  '\n')

fs.writeFileSync('spacer2.txt',
  'a:\n' +
  '{\n' +
  '\tb: 1,\n' +
  '  c: 2,\n' +
  ' \t d:\t3\n' +
  ' }\n' +
  '\n')
