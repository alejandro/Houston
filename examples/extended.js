
var Houston = require('../lib/server');

Houston.extend({
    'js':  function (req, res) {
        return res.end('You requested: ' + String(req.file));
    }
})

var server  = Houston.createServer({
    path: __dirname,
    verbose: true,
    port: 8000,
    safe: false
})
