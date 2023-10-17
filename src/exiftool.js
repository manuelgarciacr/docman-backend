const exiftool = require('node-exiftool')
const exiftoolBin = require('dist-exiftool')

const ep = new exiftool.ExiftoolProcess(exiftoolBin)

const options = {
    // detached: true,
    // env: Object.assign({}, process.env, {
    //     ENVIRONMENT_VARIABLE: 1,
    // }),
    config: '.et_confi'
}

console.log("EXIFTOOL")
exports.process = (file, process) => {
    let pid = null;
    ep
        .open()
        .then(_pid => pid = _pid)
        .then((pid) => console.log('Started exiftool process %s', pid))
        // read and write metadata operations
        .then(() => file)
        .then(process)
        .then(() => file)
        .then(this.readOne)
        .catch(err => console.error("ERR", err))
        .finally(() => ep.close().then(() => console.log('Closed exiftool process %s', pid)))
        .catch(err => console.error("ERR", err))
}

exports.readOne = (file) => 
    ep.readMetadata(file, ['-File:all']).then(console.log);

exports.writeOne = (file) => 
    ep.writeMetadata(file, {
    'Keywords': ['keywordABC3'],
    'Author': 'Pericote1',
    'NewXMPxxxTag1': 'Val32',
    'NewXMPpdfTag1': 'Val39'
  }, ['overwrite_original']).then(console.log, console.error)
