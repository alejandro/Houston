#!/usr/bin/env node

/*
 * Houston
 * @date Sun Mar 25 2012 16:06:16 GMT-0600 (CST)
 * @author Alejandro Morales <vamg008@gmail.com>
 * @name server.js
 * @licence MIT
 * 
 */

/*jshint node:true, noempty:true, laxcomma:true, nonstandard:true, laxbreak:true */

"use strict";
var http    = require('http')
  , fs      = require('fs')
  , path    = require('path')
  , url     = require('url')
  , mime    = require('mime')
  , colors  = require('colors')
  , version = require(__dirname+'/../package.json').version
  , existsSync = fs.existsSync || path.existsSync
  , params  = {}
  ;


// Get the params
// Do it right. JSHint complain
var reg = new RegExp('--')
  , sir = new RegExp('-')
  , par = new RegExp('=.*','gi');

for (var key in process.argv){
  var attr = process.argv[key];

  if (/--/gi.test(attr) || /-/gi.test(attr)){
    var attri = attr.replace(reg,'')
                    .replace(sir,'')
                    .replace(par,'');
    if (par.test(attr)){
      var __path__  = attr.split('=')[1];
      params[attri] = __path__;
    } else {
      params[attri] = process.argv[++key];
    }
  }
}
// Default configuration

var cfg = {
  port :8000,
  path : process.env.PWD,
  browser:true
};

// Help function
function logHelp(){
  console.log(' ');
  console.log(' Houston :: A cool static files server');
  console.log(' ');
  console.log(' Available options:');
  console.log('\t --port, -p \t Listening port to Houston, default to 8000 ');
  console.log('\t --path, -d \t Dir of starting point to Houston, default to actual dir');
  console.log('\t --browser,-b \t open browser window, (true,false) default to true');
  console.log('\t --help, -h \t show this info');
  console.log('\t --version,-v \t Show the current version of Houston');
  console.log(' ');
  console.log(' :: end of help ::');
  process.kill(0);
}

Object.keys(params).map(function(key){
  switch (key){
    case 'port':
    case 'p':
      cfg.port = params[key];
      break;
    case 'path':
    case 'd':
      if (params[key] == '.' || !params[key])
        cfg.path = process.env.PWD;
      else 
        cfg.path = params[key];
      if (cfg.path.charAt(0) == '~')
        cfg.path = path.join(process.env.HOME, cfg.path.replace(/\~/,''));
      break;
    case 'browser':
    case 'b':
      cfg.browser = params[key];
      break;
    case 'v':
    case 'version':
      console.log('Houston '+ version);
      process.kill(0);
      break;
    case 'help':
    case 'h':
      logHelp();
      break;
    case 'silent':
    case 's':
      cfg.silent = 'true';
      break;
    default:
     break;
  }
});


// dummy (awful) logger 
var Csl = function(){
  var logo = '⢷⡾ Houston ➔'
    , bold  = colors.bold
    , green = colors.green
    , red   = colors.red
    , cyan  = colors.cyan;

  // Logos
  var s = logo.bold.green
    , s2 = logo.bold.red;

  this.log = function(msg,time){
    if (cfg.silent) return;
    if (!time) time = '';
    console.log(s, msg, time.cyan);
  };
  this.warn = function(msg){
    if (cfg.silent) return;
    console.warn(s2, msg);
  };
};

// I know stupy but it does its jobs
var csl = new Csl();


var template = fs.readFileSync(path.join(__dirname,'..','public','index.html'),'utf8');

var readDir = function(location){
  
  
  var dir = fs.readdirSync(location);
  var listOfFiles = '<ul class="list"><li class="return"><a href="#" id="return">'+
                    'return...</a><li><h2> Empty Dir</h2></li></ul>';

  if (dir.length >= 1){
    listOfFiles = '<ul class="list"><li class="return"><a href="#" id="return">return...</a></li>';
    listOfFiles += dir.sort().map(function(file){
      if (file[0]!=='.'){
        var relative = path.join(location, file).replace(cfg.path,'');
        var absolute = path.join(cfg.path, relative);
        if (existsSync(absolute)){
          var classEl = path.extname(absolute).substr(1);
          if (fs.statSync(absolute).isDirectory()){
              classEl = "dir";
          }
          if (relative[0] == '/') relative = relative.substr(1);
          return '<li class="'+ classEl+'"><a href="/'+relative+'">'+file+'</a></li>';
        } else {
          return '';
        }
      } else return '';
    }).join('');
    listOfFiles += '</ul>';
  } 
  return template.replace(/\{list\}/gi,listOfFiles)
                 .replace(/\{title\}/gi,location)
                 .replace(/\{version\}/gi, process.version)
                 .replace(/\{hversion\}/gi, version);

};

var pipeStream  = function (dir, res) {
  var stream = fs.createReadStream(dir);
  stream.on('error', function () {
    res.writeHeader(500, {'Content-type': 'text/plain'});
    res.end('500 :: Internal server error');
  });
  stream.once('fd', function () {
    res.writeHeader(200, {'Content-type': mime.lookup(dir)});
   });
  stream.pipe(res);
};

var app = http.createServer(function (req, res) {
  var startTime = process.hrtime();
  
  // Hack to make it work with weird paths and encoding types, especial
  // File names with spaces like "Hi world.pdf" or "niña.pdf"
  // Hat tip to @mathias
  req.url = url.parse(decodeURIComponent(escape(unescape(req.url)))).pathname;

  var absolute = path.join(cfg.path,req.url)
    , isPublic = req.url.substr(0,8) == '/public/'
    , rabpub = '';

  req.isPublic = isPublic;

  if (req.url == '/favicon.ico')
    return pipeStream(__dirname + '/../public/img.png', res);
  
  if (isPublic) rabpub = path.join(__dirname,'..',req.url);

  if (req.url === '/'){

    res.writeHeader(200, {'Content-type': 'text/html'});
    res.end(readDir(cfg.path));

  } else if (req.url !=='/favicon.icon' && !isPublic){

    if (existsSync(absolute)){

      if (fs.statSync(absolute).isDirectory()){

        res.writeHeader(200,{'Content-type':'text/html'});
        res.end(readDir(absolute));

      } else {

        pipeStream(absolute, res);

      }

      csl.log('GET '  + req.url, process.hrtime(startTime) + 'ms');

    } else {
      res.writeHeader(404);
      res.end('<not found>');
    }
  } else if (isPublic && existsSync(rabpub) && !fs.statSync(rabpub).isDirectory()) {

    pipeStream(rabpub, res);

  } else if (isPublic) {

    pipeStream(__dirname + '/../public/default.png', res);

  } else {

    res.writeHeader(404, {'Content-type':'text/plain'});
    res.end('<not found>');

  }
});

app.listen(cfg.port, function() {
  csl.log('Server running on port := ' + app.address().port );
  // Log the current configuration
  for (var key in cfg){
    csl.log(key +' : ' + cfg[key]);
  }

  if (cfg.browser){
    var browser;
    switch (process.platform) {
      case "win32": browser = "start"; break;
      case "darwin": browser = "open"; break;
      default: browser = "xdg-open"; break;
    }
    csl.warn('Opening a new browser window...');
    require('child_process').spawn(browser, ['http://localhost:' + app.address().port ]);
  } 
});

