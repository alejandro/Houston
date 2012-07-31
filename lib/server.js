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

var domain  = require('domain')
  , http    = require('http')
  , https   = require('https')
  , fs      = require('fs')
  , path    = require('path')
  , url     = require('url')
  , qs      = require('querystring')
  , os      = require('os').type()
  , mime    = require('mime')
  , colors  = require('colors')
  , pkg     = require(__dirname + '/../package.json')
  , version = pkg.version
  , runningTime = Date.now()
  , existsSync  = fs.existsSync || path.existsSync
  , params  = {}
  , actions = {}
  , template, csl
  ;

// Default configuration

var cfg = {
  port : 8000,
  path : process.env.PWD,
  browser : false
};


function load () {
  // 
  // Only launched on cli mode
  // Get the params
  // Do it right (?) so JSHint  can't complain
  //
  var reg = new RegExp('--')
    , sir = new RegExp('-')
    , par = new RegExp('=.*','gi');

  // Cli config
  cfg.path = cfg.path || process.env.PWD;
  cfg.safe = cfg.safe || 'false';
  cfg.verbose = cfg.verbose || true;
  cfg.browser = cfg.browser || true;

  for (var key in process.argv){
    var attr = process.argv[key];

    if (/--/gi.test(attr) || /-/gi.test(attr)){
      var attri = attr.replace(reg,'')
                      .replace(sir,'')
                      .replace(par,'');
      if (par.test(attr)){
        params[attri] = attr.split('=')[1];
      } else {
        params[attri] = process.argv[++key];
      }
    }
  }
  // Default configuration

  // Help function
  function logHelp () {
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
        cfg.verbose = true;
        break;
      default:
       break;
    }
  });

  template = fs.readFileSync(path.join(__dirname, '..', 'public/index.html'), 'utf8');
}

// dummy (awful) logger 
function Logger (){
  var logo = '⢷⡾ Houston ➔';

  // Logos
  var s = logo.bold.green
    , s2 = logo.bold.red;

  var self = this;

  self.log = function(msg,time){
    if (!cfg.verbose) return;
    if (!time) time = '';
    console.log(s, msg, time.cyan);
  };

  self.warn = function(msg){
    if (!cfg.verbose) return;
    console.warn(s2, msg);
  };
}

function readContents (location, req, res) {
  var dir = fs.readdirSync(location)
    , showIndex = req.query.houston;
  
  if (~dir.indexOf('index.html') && !showIndex)
    return pipeStream(path.join(location, 'index.html'), req, res);
  
  var html = readDir(location), code = 200;
  if (~html.search('Unauthorized')) code = 401;
  var stats = {
    size: html.length,
    mtime: new Date(runningTime)
  };
  if (!checkEtags(req, res, stats)) {
    res.statusCode = code;
    res.setHeader('Content-type', 'text/html');
    return res.end(html);
  }
}

//
// readDir
// Depending on the mode this function is able to read the dir
// and return the html with the files for that dir
//
function readDir (location) {
  if (cfg.cli) cfg.safe = false;
  if (cfg.safe) {
    return '<div style="text-align:center"><h1> 401 - Unauthorized </h1><hr>' +
      '<p> node-' + process.version + ' running on ' + cfg.port + '</p></div>' ;
  }

  var dir = location
    , start = '<ul class="list"><li class="return"><a href="#" id="return">return...</a></li>'
    , listOfFiles = start + '<li><h2> Empty Dir</h2></li></ul>';

  if (typeof location !== 'object') {
    dir = fs.readdirSync(location);
  }
  if (dir.length >= 1){
    listOfFiles = start;
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
  return template.replace(/\{list\}/gi, listOfFiles)
                 .replace(/\{title\}/gi, location)
                 .replace(/\{version\}/gi, process.version)
                 .replace(/\{hversion\}/gi, version);
}

//
// pipeStream
// @api private
// Pipe stuff is way better than load the file to memory and then serve
// Of course that this is not a heavy-load server, but is good to keep good 
// practices
//
function pipeStream (dir, req, res) {
  var ext = path.extname(dir).replace('.','');
  req.file = dir;
  var raw = req.query.raw === false || req.query.raw == 'false';
  if (!req.query.raw) raw = true;
  // Custom actions for your files
  if (actions[ext] && raw) {    
    if (typeof actions[ext] == 'function') {
      return actions[ext].call(actions, req, res);
    }
  }  
  function er (){
    return res.error(500, 'Internal server error');
  }
  fs.stat(dir, function (err, stats){
    if (err) return err;  
    if (!checkEtags(req, res, stats)){
      var stream = fs.createReadStream(dir);
      stream.on('error', er);
      stream.once('fd', function () {
        res.statusCode = 200;
        res.setHeader('Content-type', mime.lookup(dir));
       });
      stream.pipe(res);
    }
  });
}

//
// mergeObj
// merge the target object into the origin
// This overwrite the origin object
//
function mergeObj (org, target) {
  var result = org;
  Object.keys(target).map(function(prop){
    result[prop] = target[prop];
    return true;
  });
  return result;
}

//
// Partially borrowed from Connect
// lib/middleware/static
//
function checkEtags (req, res, stat) {
  function getHeader (name){
    if (req.headers[name] || req.headers[name.toLowerCase()]) return req.headers[name];
    return false;
  }
  var etag =  '"' + stat.size + '-' + Number(stat.mtime) + '"'
    , last = stat.mtime.toUTCString();
  cfg.maxAge = cfg.maxAge || 1000*3600*24;
  var ret = etag == getHeader('if-none-match') && last == getHeader('if-modified-since');
  if (!getHeader('Date')) res.setHeader('Date', new Date().toUTCString());
  if (!getHeader('Cache-Control')) res.setHeader('Cache-Control', 'public, max-age=' + (cfg.maxAge / 1000));
  if (!getHeader('Last-Modified')) res.setHeader('Last-Modified', last);
  if (!getHeader('ETag')) res.setHeader('ETag', etag);
  if (ret) {
    res.statusCode = 304;
    res.end();
    return true;
  } else {
    return false;  
  }
}
// 
// server
// The server handler
//
function server (req, res) {
  var self = this;
  req.startTime = Date.now();
  req.query  = qs.parse(url.parse(req.url).query);  
  // Hack to make it work with weird paths and encoding types, especial
  // File names with spaces like "Hi world.pdf" or "niña.pdf"
  // Hat tip to @mathias
  req.url =  decodeURIComponent(url.parse(req.url).pathname);
  //
  // Emit the method to the parent if I can't handle it yep before of anything else.
  // So you can do:
  // var myapp = require('nhouston')(options);
  // myapp.on('POST', function(req,res){ /* my codez */});
  //
  res.error = function(code, msg) {
    res.statusCode = code || 500;
    res.setHeader('Content-type','text/html');
    return res.end(
      '<div style="text-align:center"><h1> ' + code + ' - ' + msg + ' </h1><hr>' +
      '<p> node-' + process.version + ' running on ' + cfg.port + '</p></div>'
    );
  };

  res.setHeader('Server','node/'+ process.version.replace('v','') + ' ('+ os +')');
  res.setHeader('X-Powered-By', pkg.name+ '/' + pkg.version);

  if (req.method != 'GET' && self.listeners(req.method).length) {
    return self.emit(req.method, req, res);
  } else if (req.method != 'GET'){
    return res.error(501, 'Not Implemented');
  }

  var absolute = path.join(cfg.path, req.url)
    , isPublic = req.url.substr(0,8) == '/public/'
    , rabpub = ''
    ;    

  req.isPublic = isPublic;

  req.once('error', function(){
    res.error(500,'Internal Server Error');
  });
  if (req.url == '/favicon.ico')
    return pipeStream(__dirname + '/../public/img.png', req, res);
  if (isPublic) rabpub = path.join(__dirname, '..', req.url);

  if (req.url === '/'){
    readContents(cfg.path, req, res);
  } else if (req.url !=='/favicon.ico' && !isPublic){

    if (existsSync(absolute)) {
      var stats = fs.statSync(absolute);
      if (res.statusCode == 304) return res.end();
      if (stats.isDirectory()){
        readContents(absolute, req, res);
      } else {
        pipeStream(absolute, req, res);
      }
      csl.log(req.method + req.url, (Date.now() - req.startTime) + 'ms');
    } else {
      res.error(404,'Not found');
    }
  } else if (isPublic && existsSync(rabpub) && !fs.statSync(rabpub).isDirectory()) {

    pipeStream(rabpub, req, res);

  } else if (isPublic && existsSync(req.url)) {

    if (path.extname(req.url) === '') {
      res.writeHeader(200, {'Content-type':'text/html'});
      return res.end(readDir(rabpub));
    }
  } else if (isPublic) {
    pipeStream(__dirname + '/../public/default.png', req, res);
  } else {
    res.error(404,'Not found');
  }
}

function lazyLoad () { 
  var dir = fs.readdirSync(__dirname +  '/actions');
  dir.filter(function(v){ 
    return path.extname(v) == '.js';
  }).forEach(function(file){
    try {
      actions[file.split('.')[0]] = require(path.resolve(__dirname, 'actions',file));
    } catch (exc) {
      console.warn('Failed to load %s', file);
      console.log(exc);
    }
  });
}

lazyLoad();

//
// Houston
// The main function
//


function createServer (options) {
  var app;

  if (!options) throw new Error('Invalid options');

  if (typeof options === 'string') cfg.path = options;
  else if (typeof options === 'object') cfg = mergeObj(cfg, options);
  else throw new TypeError('Type of ' + options + ' is not an object or a string');
  
  // Right after i read the conf launch the Logger (to be aware of verbose mode);
  csl = new Logger();

  // OH! We have a cli app, read the confs from launch args
  if (cfg.cli) load();
  if (!cfg.safe) template = fs.readFileSync(path.join(__dirname, '..', 'public/index.html'), 'utf8');
  // Switch protocols depending on options
  // SPDY - HTTPS - HTTP
  // And yes just require the valid one
  if (options.spdy) app = require('spdy').createServer(https.Server, options.spdy, server);
  else if (options.https) app = https.createServer(options.https, server);
  else app = http.createServer(server);

  // Avoid loggin twice, because of domains
  var logged = 0;

  // When the server is already listing on a port log the conf
  function listener () {
    if (logged == 1) return;
    logged = 1;
    cfg.port = app.address().port;
    csl.log('Server running on port := ' + cfg.port );
    // Log the current configuration
    for (var key in cfg){
      if (key != 'spdy' || key != 'https')
      csl.log(key +' : ' + cfg[key]);
    }

    // If browser is true, launch it.
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
  }

  // Add the hability to pick the PORT in the env var.
  if (!cfg.ignorePort) cfg.ignorePort = true;
  if (process.env.PORT && cfg.ignorePort) cfg.port = process.env.PORT;

  var handler = domain.create();
  // Yeah just once
  handler.once('error', function(){
    csl.warn('The port that you provide is in use, trying one more time');
    app.listen('', listener);
  });
  
  handler.run(function(){
    app.listen(cfg.port, listener);
  });

  // Add config (useful for cli apps)
  app.config = cfg;
  // Important config to share to parent
  app.port = cfg.port;
  app.path = cfg.path;
  // Returns a http server instance
  return app;
}

function houston() {}
houston.createServer = createServer;

houston.extend = function extend (obj) {
  if (typeof obj != 'object') throw new TypeError('Invalid action, it must be an object');
  Object.keys(obj).forEach(function(action){
    actions[action] = obj[action];
  });
};

// export ALL the things
module.exports = houston;
