
var houston = require('../lib/server');
var server  = houston.createServer({
	path: __dirname,
	verbose: true,
	port: 8000,
	safe: true
})