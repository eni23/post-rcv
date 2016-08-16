var http = require('http')
var fs   = require('fs-extra')
var yaml = require('js-yaml')
var formidable = require('formidable')
var moment = require('moment');

try {
  var config = yaml.safeLoad(fs.readFileSync('./config/config.yaml', 'utf8'));
  if (!config['incoming-directory']) {
    console.log("ERROR: config.incoming-directory needs to be defined")
    process.exit()
  }
  if (!config['port']){
    config.port = 3008
  }
} catch (e) {
  console.log("ERROR: cannot load config: ")
  console.log(e)
  process.exit()
}


console.log("running post-rcv on port: " + config.port);
http.createServer(function (req, res) {
  if (req.url == "/upload" && req.method == 'POST') {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      form._fields = fields
      if (fields.hostname){
        res.writeHead(200, {'content-type': 'text/plain'});
        res.end();
      }
      else {
        res.writeHead(500, {'content-type': 'text/plain'});
        res.end("no hostname given\n");
      }
    });
    form.on('end', function(fields, files) {
      if (this._fields.hostname){
        var temp_path = this.openedFiles[0].path
        var ts = moment().format("YYYYMMDD-HHmmss_")
        var dir = config['incoming-directory']+"/"+this._fields.hostname
        var file = dir + "/" + ts + this.openedFiles[0].name
        // create directory with hostname
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }
        // save file
        fs.copy(temp_path, file, function(err) {
          if (err) {
            console.error("ERROR: error in rcv");
            console.log(err);
          } else {
            console.log(file)
          }
        });

      }
    });
    return;
  } else {
    res.writeHead( 200, {
      'Content-Type': 'text/plain'
    })
    res.write("#!/bin/bash\n\ncurl -F file=@$1 -F hostname=$(hostname) "+config['public-url'] + "/upload\n")
    res.end()
  }
}).listen(config.port)
