
// You don't want options right? so
// Yep this gonna work too
if (!process.env.PORT) process.env.PORT = 8010

// you can run the static server with `$ PORT=80 node myapp`

var houston = require('../lib/server')(__dirname);