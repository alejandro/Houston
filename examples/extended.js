
var Houston = require('../lib/server');

Houston.extend({
    'js':  function (dir, res) {
        return res.end(dir);
    }
})

var server  = Houston.createServer({
    path: __dirname,
    verbose: true,
    port: 8000,
    safe: false
})