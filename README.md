
# Houston :: A static files server based on node.js
 
A Static file server, simple as you hear.

The main purpose of Houston is to provide a static, 0 dependencies (just mime), server. 

## Installation

Asuming that you have installed [node.js](http://nodejs.org) and [npm](http://npmjs.org)
    
    > npm install -g houston

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


## Contributors

- [Alejadro Morales](http://github.com/alejandromg)
- [Kronos](http://github.com/alejandromg/kronos 'npm install kronos') 

## License

MIT 2012