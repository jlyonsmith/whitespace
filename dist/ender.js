'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ender = undefined;

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _concatStream = require('concat-stream');

var _concatStream2 = _interopRequireDefault(_concatStream);

var _autoBind = require('auto-bind2');

var _autoBind2 = _interopRequireDefault(_autoBind);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Ender {
  constructor(log) {
    (0, _autoBind2.default)(this);
    this.log = log;
  }

  async readLineEndingInfo() {
    return new Promise((resolve, reject) => {
      const readable = !this.inputFilename ? process.stdin : _fs2.default.createReadStream(this.inputFilename, { encoding: 'utf8' });

      // Read the entire file && determine all the different line endings
      this.numCR = 0;
      this.numLF = 0;
      this.numCRLF = 0;
      this.numLines = 1;

      readable.on('error', err => {
        reject(err);
      });
      let writeable = (0, _concatStream2.default)(fileContents => {
        this.fileContents = fileContents;
        let i = 0;
        while (i < fileContents.length) {
          const c = fileContents[i];

          if (c == '\r') {
            if (i < fileContents.length - 1 && fileContents[i + 1] == '\n') {
              this.numCRLF += 1;
              i += 1;
            } else {
              this.numCR += 1;
            }

            this.numLines += 1;
          } else if (c == '\n') {
            this.numLF += 1;
            this.numLines += 1;
          }
          i += 1;
        }

        this.numEndings = (this.numCR > 0 ? 1 : 0) + (this.numLF > 0 ? 1 : 0) + (this.numCRLF > 0 ? 1 : 0);
        resolve();
      });
      readable.pipe(writeable);
    });
  }

  async writeNewFile() {
    return new Promise((resolve, reject) => {
      let newNumLines = 1;

      if (this.newLineEnding === 'cr' && this.numCR + 1 === this.numLines || this.newLineEnding === 'lf' && this.numLF + 1 === this.numLines || this.newLineEnding === 'crlf' && this.numCRLF + 1 === this.numLines) {
        // We're not changing the line endings; nothing to do
        return resolve();
      }

      const newlineChars = this.newLineEnding === 'cr' ? '\r' : this.newLineEnding === 'lf' ? '\n' : '\r\n';
      const writeable = _fs2.default.createWriteStream(this.outputFilename, { flags: 'w', encoding: 'utf8' });

      writeable.on('finish', () => {
        resolve();
      });
      writeable.on('error', err => {
        reject();
      });

      let i = 0;
      while (i < this.fileContents.length) {
        const c = this.fileContents[i];

        if (c == '\r') {
          if (i < this.fileContents.length - 1 && this.fileContents[i + 1] == '\n') {
            i += 1;
          }

          newNumLines += 1;
          writeable.write(newlineChars);
        } else if (c == '\n') {
          newNumLines += 1;
          writeable.write(newlineChars);
        } else {
          writeable.write(c);
        }

        i += 1;
      }
      writeable.end();
      this.newNumLines = newNumLines;
    });
  }

  async run(argv) {
    const options = {
      string: ['new-line-ending', 'output-file'],
      boolean: ['help', 'version'],
      alias: {
        'o': 'output-file',
        'n': 'new-line-ending'
      },
      default: {
        'new-line-ending': 'auto'
      }
    };
    let args = (0, _minimist2.default)(argv, options);

    if (args.help) {
      this.log.info(`
Line ending fixer. Defaults to reading from stdin.

-o, --output-file <file>        The output file. Can be the same as the input file.
-n, --new-line-ending <ending>  The new line ending, either 'auto', 'cr', 'lf', 'crlf'.  'auto' will use the most
                                commonly occurring ending.
--help                          Displays help
--version                       Displays version
`);
      return 0;
    }

    this.inputFilename = args['_'].length > 0 ? args['_'][0] : null;
    this.outputFilename = args['output-file'];
    this.newLineEnding = args['new-line-ending'];

    if (this.inputFilename && !_fs2.default.existsSync(this.inputFilename)) {
      this.log.error(`File '${this.inputFilename}' does not exist`);
      return -1;
    }

    let msg = '';

    await this.readLineEndingInfo();

    msg += `"${this.inputFilename}", ${this.numEndings > 1 ? 'mixed' : this.numCR > 0 ? 'cr' : this.numLF > 0 ? 'lf' : 'crlf'}, ${this.numLines} lines`;

    if (!this.outputFilename) {
      this.log.error(msg);
      return 0;
    }

    if (this.newLineEnding === 'auto') {
      // Find the most common line ending && make that the automatic line ending
      this.newLineEnding = 'lf';
      let n = this.numLF;

      if (this.numCRLF > n) {
        this.newLineEnding = 'crlf';
        n = this.numCRLF;
      }

      if (this.numCR > n) {
        this.newLineEnding = 'cr';
      }
    }

    await this.writeNewFile();

    msg += ` -> "${this.outputFilename}", ${this.newLineEnding}, ${this.newNumLines} lines`;
    this.log.error(msg);
    return 0;
  }
}

exports.Ender = Ender;
const ender = new Ender(console);
ender.run(process.argv.slice(2)).then(exitCode => {
  process.exit(exitCode);
}).catch(err => {
  console.error(err);
});
//# sourceMappingURL=ender.js.map