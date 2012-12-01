/*
 * Houston
 * https://github.com/alejandro/Houston
 *
 * Copyright (c) 2012 Alejandro Morales
 * Licensed under the MIT license.
 */ "use strict";

// Export Houston
module.exports = Houston

var fs     = require('fs')
  , path   = require('path')
  , url    = require('url')
  , http   = require('http')
  , https  = require('https')
  , util   = require('util')
  , mime   = require('mime')
  , events = require('events')
  , helpers = require('./houston/helpers')


var EventEmitter = events.EventEmitter

/*
 * Houston
 * -------
 * A simple static web server
 */
function Houston(options) {
  this.options = options || {},
  this.template = fs.readFileSync(__dirname + '/files.html','utf8'),
  this.parse = helpers.parser(this.template),
  
  this.root = path.resolve(process.cwd(), this.options.dir || __dirname),
  this.pkg = require('../package'),
  this.runtime = this.pkg.name + '-' + Date.now()
  this.ext = []
}

Houston.helpers = helpers
Houston.createServer = function (opts){
  return new this(opts)
}

/*
 * Houston Methods
 * ---------------
 *  - EventEmitter instance
 */

Houston.prototype = Object.create(EventEmitter.prototype, {
  constructor: Houston
})


util._extend(Houston.prototype, {

  // extend functionality, for example response to a specific type of file
  // 
  //  Houston.extend('ext', function (req, res){
  //      var file = req.file
  //      res.end(compile(file))
  //  })

  extend: function (ext, action){
    this.ext[ext] = action
    return this
  },

  log: function (){
    if (this.options.verbose) {
      console.log.apply(console.log, arguments)
    }
  },

  /*
   * attach 
   * ------
   * Alias to listen, more idiomatic
   */
  attach: function (server){
    this.listen(server)
    return this
  },

  listen: function (server){
    this.server = server || {}
    if (server instanceof http.Server || server instanceof https.Server){
      this._clean(server)
    }
    this.Manager = this.Manager.bind(this)
    if ('number' === typeof(server) || !isNaN(Number(server))){
      if (this.options.https) {
        this.server = https.createServer(this.options.https, this.Manager)
      } else {
        this.server = http.createServer(this.Manager)
      }
      this.PORT = server
      this.server.listen.apply(this.server, arguments)
    }
    return this
  },

  _clean: function (server){
    var self = this, oldListeners = server.listeners('request')
 
    server.removeAllListeners('request')
    server.on('request', function (req, res){
      var args = arguments
      self.Manager(req, res, function (err){
        if (err && oldListeners.length)
          oldListeners.forEach(function(listener){
            listener.apply(self.server, args)
          })
        else res.error(500, err)
      })
    })
    this.server = server
  },

  Manager: function (req, res, cb){
    var self = this

    if (!cb) cb = function (error){
      if (error.code === 'ENOENT') {
        return res.error(404, 'not found')
      }
      res.error(500, error)
    }
    
    req.file = this.fixPath(req.url)
    res.mime = mime.lookup(req.file)
    req.fileExt = path.extname(req.file)

    res.setHeader('Server', this.pkg.name + '/' + this.pkg.version)
    
    if (this.ext[req.fileExt]) {
      return this.ext[req.fileExt].apply(this, arguments)
    }

    res.error = function (code, msg){
      if (msg instanceof Error && msg.code === 'ENOENT') code = 404
      res.statusCode = code || 500
      res.end(msg.toString() || 'Internal Server Error')
    }

    fs.stat(req.file, function (error, stats){
      if (error) return cb(error)
      if (stats.isDirectory() && self.options.list){
        self._serveDirectory(req, res, cb)
      } else if (stats.isDirectory()){
         res.error(401, 'Unauthorized')
      } else {
        self._createStream(req, res, cb)
      }
    })
  },

  fixPath: function (pth){
    this.log(pth)
    return path.resolve(this.root, './' + decodeURIComponent((url.parse(pth).pathname)))
  },

  _serveDirectory: function (req, res, cb){
    var s = this
    // Hate this
    if (req.url[req.url.length - 1] !== '/') req.url = req.url + '/'

    fs.readdir(req.file, function (error, files){
      if (error) return cb(error)

      files = files.map(function (i){
        return '<li><a href="' + req.url + i + '">' + i + '</a></li>'
      })
      
      var vars = {
        files: files.join('\n'),
        title: req.file,
        version: s.pkg.version,
        node: process.version,
        name: s.pkg.name,
        port: s.PORT || 8100,
        url: '/' + req.uri,
        houston: s.runtime
      }
      
      res.setHeader('Content-Type','text/html')
      res.end(s.parse(vars))
    })
  },

  _createStream: function (req, res){
    var stream = fs.createReadStream(req.file)

    stream.once('error', function (err){
      console.error('[on createStream]', err)
      try {stream.destroy()} catch (ex){}
      res.end()
    })
    res.setHeader('Content-Type', res.mime)
    stream.pipe(res)
  }
})
