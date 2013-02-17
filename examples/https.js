var fs = require('fs');
var options =  { 
  path : __dirname, // to serve files from public folder
  port : 443, // the port that houston will bind to listen
  https : { // To create an spdy server (npm install spdy), this can be https too
    key: fs.readFileSync(__dirname + '/keys/spdy-key.pem'),
    cert: fs.readFileSync(__dirname + '/keys/spdy-cert.pem'),
    ca: fs.readFileSync(__dirname + '/keys/spdy-csr.pem')
  },
  verbose : true // Log options: false as default
}

var houston = require('../lib/server');

var server  = houston.createServer(options);
