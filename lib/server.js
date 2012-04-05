#!/usr/bin/env node

/*
 * Houston
 * @date:Sun Mar 25 2012 16:06:16 GMT-0600 (CST)
 * @author: Alejandro Morales <vamg008@gmail.com>
 * @name: server.js
 * @licence: MIT
 * 
*/


var http    = require('http')
  , fs      = require('fs')
  , path    = require('path')
  , mime    = require('mime')
  , params  = {}
  , version = require(__dirname+'/../package.json').version
  ;

for (var key in process.argv){
  var attr =process.argv[key];
  if (/--/gi.test(attr) || /-/gi.test(attr)){
    var attri = attr.replace('--','').replace('-','').replace(/=.*/gi,'')
    if (/=.*/gi.test(attr)){
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
}

// Help function
function logHelp(){
  console.log(' ')
  console.log(' Houston :: A cool static files server')
  console.log(' ')
  console.log(' Available options:')
  console.log('\t --port, -p \t Listening port to Houston, default to 8000 ')
  console.log('\t --path, -d \t Dir of starting point to Houston, default to actual dir')
  console.log('\t --browser,-b \t open browser window, (true,false) default to true')
  console.log('\t --help, -h \t show this info')
  console.log('\t --version,-v \t Show the current version of Houston')
  console.log(' ')
  console.log(' :: end of help ::')
  process.kill(0)
}

Object.keys(params).map(function(key){
  switch (key){
    case 'port':
    case 'p':
      cfg['port'] = params[key];
      break;
    case 'path':
    case 'd':
      if (params[key]=='.'|| params[key]=='')
        cfg['path'] = process.env.PWD;
      else 
        cfg['path'] = params[key];
      if (cfg.path.charAt(0) == '~')
        cfg['path'] = path.join(process.env.HOME, cfg['path'].replace(/\~/,'')  )
      break;
    case 'browser':
    case 'b':
      cfg['broser'] = params[key];
    case 'v':
    case 'version':
      console.log('Houston '+ version)
      process.kill(0)
    case 'help':
    case 'h':
      logHelp();
    default:
     break;
  }
})

// Some colors to the loggin function

var colors ={
  'bold'      : ['\033[1m',  '\033[22m'],
  'cyan'      : ['\033[36m', '\033[39m'],
  'green'     : ['\033[32m', '\033[39m'],
  'magenta'   : ['\033[35m', '\033[39m'],
  'red'       : ['\033[31m', '\033[39m'],
  'yellow'    : ['\033[33m', '\033[39m']
}
  
// dummy (awful) logger 
var csl = function(){
  var s = colors.bold[0]+colors.green[0]+'⢷⡾ Houston ➔'+colors.green[1]+colors.bold[1]
  var s2 = colors.bold[0]+colors.red[0]+'⢷⡾ Houston ➔'+colors.red[1]+colors.bold[1]
  this.log = function(msg,time){
    if (time) time = colors.cyan[0]+time+colors.cyan[1]
    else time = ''
    console.log(s,msg,time)
  }
  this.warn = function(msg){
    console.warn(s2, msg)
  }
}
csl = new csl

var template = fs.readFileSync(path.join(__dirname,'..','public','index.html'),'utf8');

var readDir = function(location){
  
  
  var dir = fs.readdirSync(location);
  var listOfFiles = '<ul class="list"><li class="return"><a href="#" id="return">'+
                    'return...</a><li><h2> Empty Dir</h2></li></ul>';

  if (dir.length >= 1){
    listOfFiles = '<ul class="list"><li class="return"><a href="#" id="return">return...</a></li>'
    listOfFiles += dir.sort().map(function(file){
      if (file[0]!=='.'){
        var relative = path.join(location,file).replace(cfg.path,'');
        var absolute = path.join(cfg.path,relative);
        if (path.existsSync(absolute)){
          var classEl = path.extname(absolute).substr(1);
          if (fs.statSync(absolute).isDirectory()){
              classEl = "dir";
          }
          relative[0]=='/' ? relative = relative.substr(1) : relative;
          return '<li class="'+ classEl+'"><a href="/'+relative+'">'+file+'</a></li>';
        } else {
          return ''
        }
      } else return '';
    }).join('');
    listOfFiles += '</ul>';
  } 
  return template.replace(/\{list\}/gi,listOfFiles)
                 .replace(/\{title\}/gi,location)
                 .replace(/\{version\}/gi, process.version)
                 .replace(/\{hversion\}/gi, version);

}

var pipeStream  = function(dir,res){
  var stream = fs.createReadStream(dir);
  stream.on('error', function () {
    res.writeHeader(500,{'Content-type':'text/plain'});
    res.end('500 :: Internal server error');
  })
  stream.once('fd', function () {
    res.writeHeader(200,{'Content-type':mime.lookup(dir)});
   });
  stream.pipe(res);
}

var app  = http.createServer(function(req,res){
  var startTime = Date.now();
  // Hat tip to @mathias
  req.url = decodeURIComponent(escape(unescape(req.url)))

  var absolute =path.join(cfg.path,req.url);
  var isPublic = req.url.substr(0,8)=='/public/';
  req.isPublic = isPublic

  if (req.url=='/favicon.ico')
    pipeStream(__dirname+'/../public/img.png', res)
  
  if (isPublic) var rabpub = path.join(__dirname,'..',req.url);

  if (req.url === '/'){
    var location = cfg.path;
    res.writeHeader(200,{'Content-type':'text/html'})
    res.end(readDir(location))

  } else if (req.url !=='/favicon.icon' && !isPublic){

    if (path.existsSync(absolute)){

      if (fs.statSync(absolute).isDirectory()){
        res.writeHeader(200,{'Content-type':'text/html'})
        res.end(readDir(absolute))
      } else {
        pipeStream(absolute, res);
      }
      csl.log('GET '+req.url,(Date.now()-startTime)+'ms')

    } else {
      res.writeHeader(404)
      res.end('<not found>')
    }
  } else if (isPublic && path.existsSync(rabpub) && !fs.statSync(rabpub).isDirectory()) {
    pipeStream(rabpub, res);
  }else if(isPublic) {
    pipeStream(__dirname+'/../public/default.png', res);
  } else {
    res.writeHeader(404,{'Content-type':'text/plain'})
    res.end('<not found>')
  }
});

app.listen(cfg.port, function() {
  csl.log('Server running on port => '+app.address().port)
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
    
    csl.warn('Opening a new browser window...')
    require('child_process').spawn(browser, ['http://localhost:'+app.address().port]);
  } 

})

