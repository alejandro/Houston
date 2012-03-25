#!/usr/bin/env node

/*
 * server
 * @date:Sun Mar 25 2012 16:06:16 GMT-0600 (CST)
 * @name: server.js
 * @licence: MIT
*/


var http = require('http');

var app = http.createServer(function(req,res){
   res.end('I\'m server, and you');
});


function run(port) {
  port = port || 8000;
  app.listen(port, function() {
    console.log('running on port: '+port);
  });
};
module.exports.run = run;
