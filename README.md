  # Houston :: A static files server based on node.js
 
Yet another static file server, simple as you hear.

The main purpose of Houston is to provide a static, 0 dependencies (just mime), server. 

**WARNING** Houston >1.0.x only runs on node-v0.8.x. The 0.6.x compatible version is 0.2.1 (`npm install -g nhouston@0.2.1`)

## Features

Houston initially was made to provide a cli-server. But the ability to create cli apps with custom servers make me re-think about this. Still Houston is a cli-server but with the followed features in order to you:

-  static file server
-  spdy, https support
-  houston is an instance of a server, so you can tweak an put socket.io in from of it
-  `cli: true` enable cli features like process.argv parser and more -> (houston#config)
-  websockets support (see socket.io example)
- If Houston can't handle the event it'll let you the task. (e.g. `houston.on('POST', function(req, res){/* the response code */}))`
-  Custom Actions for Files. E.g. Markdown files rendered on the fly
-  Extend method. Customized actions to files like:

        
        Houston.extend({
                js: function (req, res) {                       
                        var file = req.file
                        res.end('w00t you requested ' + file)
                }
        })
        
        Houston.createServer(/* blah */)

  curl http://myser.ver/path/to/a/js/file.js
  => w00t you requested /path/to/a/js/file.js


## Installation

Asuming that you have installed [node.js](http://nodejs.org) and [npm](http://npmjs.org)
    
    > npm install -g nhouston

Or:

    > git clone https://github.com/alejandromg/Houston.git
    > cd Houston
    > ln -s bin/houston ~/bin
    

Then:
   
    # To start the server in the current dir 
    > houston 

This will open a new window in your browser, or go to [http://localhost:8000/](http://localhost:8000/)

To start the server in a different port:

    > sudo houston --port 80
    > houston -p 8010
    > houston -p=8010

All of them are valid, also you can define a different path:

    > houston --path=/home/ --port=8010

Also you can avoid the new browser window with:

    > houston -b false

## Static server

Houston, as well, has a static file server built-in. So if you want to use Houston as your static files provider use it as follows:

    var houston = require('nhouston');
    var server = houston(options);

Where options can be:

    { 
      path : __dirname + '/public', // to serve files from public folder
      port : 3001, // the port that houston will bind to listen
      spdy : { // To create an spdy server (npm install spdy), this can be https too
        key: fs.readFileSync(__dirname + '/keys/spdy-key.pem'),
        cert: fs.readFileSync(__dirname + '/keys/spdy-cert.pem'),
        ca: fs.readFileSync(__dirname + '/keys/spdy-csr.pem')
      },
      silent : true, // Log options: false as default
      cli    : true, // to emule cli behavior (list files on dirs, open browser and more)
    }

See more in the examples dir.

## Screenshot

<img src="http://dl.dropbox.com/u/29662133/Pantallazo-Houston%20%3A%3A%20-home-alejandromg-dev-blackbox%20-%20Google%20Chrome.png" />

## Help

`houston -h`
`houston --help`

    Houston :: A cool static files server

    Available options:
       --port, -p    Listening port to Houston, default to 8000 
       --path, -d    Dir of starting point to Houston, default to actual dir
       --browser,-b  open browser window, (true,false) default to true
       --help, -h    show this info
       --version,-v  Show the current version of Houston

    :: end of help ::

## Alternatives

For sure that Houston is not the first option to static file servers, there are a bunch of other static file providers, with better support:

-  [ecstatic](https://github.com/jesusabdullah/node-ecstatic)
-  connect static middleware

And many others.

## Contributors

- [Alejadro Morales](http://github.com/alejandromg)

## License

MIT
Alejandro Morales (c) 2012